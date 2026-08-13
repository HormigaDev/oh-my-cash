use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DbErr, EntityTrait, NotSet, PaginatorTrait,
    QueryFilter, QueryOrder, QuerySelect, Set, SqlErr, sea_query::Expr,
};
use time::{Date, OffsetDateTime};
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    entities::{categories, transactions},
    error::AppError,
    materialization::MonthPeriod,
    pagination::{PageResponse, PaginationQuery},
    transactions::dto::{
        CreateTransactionRequest, CreateTransactionStatus, PayTransactionRequest,
        TransactionDirection, TransactionResponse, TransactionSortOrder, UpdateTransactionRequest,
        parse_date, parse_datetime,
    },
};

const DESCRIPTION_MAX_LENGTH: usize = 160;

const NOTES_MAX_LENGTH: usize = 2000;

pub struct CreateTransactionResult {
    pub transaction: TransactionResponse,

    pub created: bool,
}

struct PointTransactionInput {
    category_id: Uuid,

    direction: TransactionDirection,

    status: CreateTransactionStatus,

    description: String,

    amount: Decimal,

    due_date: Option<Date>,

    occurred_at: Option<OffsetDateTime>,

    notes: Option<String>,
}

pub async fn list(
    state: &AppState,
    auth: &AuthUser,
    period: Option<(&MonthPeriod, &MonthPeriod)>,
    pagination: PaginationQuery,
    virtual_items: Vec<TransactionResponse>,
    overdue: bool,
    sort_order: TransactionSortOrder,
) -> Result<PageResponse<TransactionResponse>, AppError> {
    let mut query = transactions::Entity::find().filter(transactions::Column::UserId.eq(auth.id));

    if let Some((start, end)) = period {
        query = query.filter(month_filter(auth, start, end));
    }
    if overdue {
        query = query
            .filter(transactions::Column::Status.eq("pending"))
            .filter(transactions::Column::DueDate.is_not_null())
            .filter(Expr::cust_with_values(
                r#""transactions"."due_date" < (CURRENT_TIMESTAMP AT TIME ZONE $1)::date"#,
                [auth.timezone.clone()],
            ));
    }

    let persisted_total = query.clone().count(&state.db).await?;
    let total = persisted_total + virtual_items.len() as u64;
    let offset = pagination.offset();
    let mut items = Vec::new();

    if offset < persisted_total {
        let limit = pagination.per_page.min(persisted_total - offset);
        let query = match sort_order {
            TransactionSortOrder::Asc => query
                .order_by_asc(transactions::Column::DueDate)
                .order_by_asc(transactions::Column::CreatedAt),
            TransactionSortOrder::Desc => query
                .order_by_desc(transactions::Column::DueDate)
                .order_by_desc(transactions::Column::CreatedAt),
        };
        let models = query.offset(offset).limit(limit).all(&state.db).await?;
        items = models
            .into_iter()
            .map(TransactionResponse::try_from)
            .collect::<Result<Vec<_>, _>>()?;
    }

    let virtual_offset = offset.saturating_sub(persisted_total) as usize;
    let remaining = pagination.per_page as usize - items.len();
    if remaining > 0 {
        items.extend(
            virtual_items
                .into_iter()
                .skip(virtual_offset)
                .take(remaining),
        );
    }

    Ok(PageResponse::new(items, pagination, total))
}

pub async fn create(
    state: &AppState,
    auth: &AuthUser,
    request: CreateTransactionRequest,
) -> Result<CreateTransactionResult, AppError> {
    let input = PointTransactionInput {
        category_id: request.category_id,

        direction: request.direction,

        status: request.status,

        description: normalize_description(&request.description)?,

        amount: request.amount,

        due_date: request
            .due_date
            .as_deref()
            .map(|value| parse_date(value, "due_date"))
            .transpose()?,

        occurred_at: request
            .occurred_at
            .as_deref()
            .map(|value| parse_datetime(value, "occurred_at"))
            .transpose()?,

        notes: normalize_notes(request.notes)?,
    };

    validate_money(input.amount)?;

    validate_point_transaction_shape(&input)?;

    ensure_category_compatible(state, auth, input.category_id, input.direction).await?;

    if let Some(existing) =
        find_by_client_operation(state, auth, request.client_operation_id).await?
    {
        ensure_same_operation(&existing, &input)?;

        return Ok(CreateTransactionResult {
            transaction: existing.try_into()?,

            created: false,
        });
    }

    let now = OffsetDateTime::now_utc();

    let model = transactions::ActiveModel {
        id: NotSet,

        user_id: Set(auth.id),

        category_id: Set(input.category_id),

        recurring_rule_id: Set(None),

        client_operation_id: Set(Some(request.client_operation_id)),

        direction: Set(input.direction.as_str().to_owned()),

        status: Set(input.status.as_str().to_owned()),

        description: Set(input.description.clone()),

        notes: Set(input.notes.clone()),

        expected_amount: Set(match input.status {
            CreateTransactionStatus::Pending => Some(input.amount),
            CreateTransactionStatus::Paid => None,
        }),

        actual_amount: Set(match input.status {
            CreateTransactionStatus::Pending => None,
            CreateTransactionStatus::Paid => Some(input.amount),
        }),

        due_date: Set(input.due_date),

        recurrence_period: Set(None),

        occurred_at: Set(input.occurred_at),

        paid_at: Set(match input.status {
            CreateTransactionStatus::Pending => None,
            CreateTransactionStatus::Paid => Some(now),
        }),

        created_at: NotSet,

        updated_at: NotSet,
    };

    match model.insert(&state.db).await {
        Ok(model) => Ok(CreateTransactionResult {
            transaction: model.try_into()?,

            created: true,
        }),

        Err(error) if is_unique_violation(&error) => {
            let existing = find_by_client_operation(state, auth, request.client_operation_id)
                .await?
                .ok_or(AppError::Internal)?;

            ensure_same_operation(&existing, &input)?;

            Ok(CreateTransactionResult {
                transaction: existing.try_into()?,

                created: false,
            })
        }

        Err(error) => Err(error.into()),
    }
}

pub async fn update(
    state: &AppState,
    auth: &AuthUser,
    transaction_id: Uuid,
    request: UpdateTransactionRequest,
) -> Result<TransactionResponse, AppError> {
    if request.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_owned()));
    }

    let transaction = find_owned(state, auth, transaction_id).await?;

    if transaction.recurring_rule_id.is_some() {
        return Err(AppError::BadRequest(
            "Recurring transactions cannot be edited through this endpoint".to_owned(),
        ));
    }

    if !matches!(transaction.status.as_str(), "paid" | "pending") {
        return Err(AppError::InvalidTransactionState);
    }

    let current_direction = TransactionDirection::try_from(transaction.direction.as_str())?;

    let final_category_id = request.category_id.unwrap_or(transaction.category_id);

    let final_direction = request.direction.unwrap_or(current_direction);

    if request.category_id.is_some() || request.direction.is_some() {
        ensure_category_compatible(state, auth, final_category_id, final_direction).await?;
    }

    let status = transaction.status.clone();
    let mut active: transactions::ActiveModel = transaction.into();

    if let Some(category_id) = request.category_id {
        active.category_id = Set(category_id);
    }

    if let Some(direction) = request.direction {
        active.direction = Set(direction.as_str().to_owned());
    }

    if let Some(description) = request.description {
        active.description = Set(normalize_description(&description)?);
    }

    if let Some(amount) = request.amount {
        validate_money(amount)?;

        if status == "paid" {
            active.actual_amount = Set(Some(amount));
        } else {
            active.expected_amount = Set(Some(amount));
        }
    }

    if let Some(occurred_at) = request.occurred_at {
        if status != "paid" {
            return Err(AppError::BadRequest(
                "Pending transactions use due_date".to_owned(),
            ));
        }

        active.occurred_at = Set(Some(parse_datetime(&occurred_at, "occurred_at")?));
    }

    if let Some(due_date) = request.due_date {
        if status != "pending" {
            return Err(AppError::BadRequest(
                "Paid transactions use occurred_at".to_owned(),
            ));
        }

        active.due_date = Set(Some(parse_date(&due_date, "due_date")?));
    }

    if let Some(notes) = request.notes {
        active.notes = Set(normalize_notes(Some(notes))?);
    }

    let updated = active.update(&state.db).await?;

    updated.try_into()
}

pub async fn pay(
    state: &AppState,
    auth: &AuthUser,
    transaction_id: Uuid,
    request: PayTransactionRequest,
) -> Result<TransactionResponse, AppError> {
    let transaction = find_owned(state, auth, transaction_id).await?;

    if transaction.status != "pending" {
        return Err(AppError::InvalidTransactionState);
    }

    let amount = request
        .amount
        .or(transaction.expected_amount)
        .ok_or_else(|| AppError::BadRequest("Paid amount is required".to_owned()))?;

    validate_money(amount)?;

    let now = OffsetDateTime::now_utc();

    let occurred_at = request
        .occurred_at
        .as_deref()
        .map(|value| parse_datetime(value, "occurred_at"))
        .transpose()?
        .unwrap_or(now);

    let mut active: transactions::ActiveModel = transaction.into();

    active.status = Set("paid".to_owned());

    active.actual_amount = Set(Some(amount));

    active.paid_at = Set(Some(now));

    active.occurred_at = Set(Some(occurred_at));

    let transaction = active.update(&state.db).await?;

    transaction.try_into()
}

pub async fn skip(
    state: &AppState,
    auth: &AuthUser,
    transaction_id: Uuid,
) -> Result<TransactionResponse, AppError> {
    let transaction = find_owned(state, auth, transaction_id).await?;

    if transaction.status != "pending" || transaction.recurring_rule_id.is_none() {
        return Err(AppError::InvalidTransactionState);
    }

    let mut active: transactions::ActiveModel = transaction.into();

    active.status = Set("skipped".to_owned());

    let transaction = active.update(&state.db).await?;

    transaction.try_into()
}

pub async fn cancel(
    state: &AppState,
    auth: &AuthUser,
    transaction_id: Uuid,
) -> Result<TransactionResponse, AppError> {
    let transaction = find_owned(state, auth, transaction_id).await?;

    if transaction.status != "pending" {
        return Err(AppError::InvalidTransactionState);
    }

    let mut active: transactions::ActiveModel = transaction.into();

    active.status = Set("cancelled".to_owned());

    let transaction = active.update(&state.db).await?;

    transaction.try_into()
}

async fn find_by_client_operation(
    state: &AppState,
    auth: &AuthUser,
    operation_id: Uuid,
) -> Result<Option<transactions::Model>, AppError> {
    transactions::Entity::find()
        .filter(transactions::Column::UserId.eq(auth.id))
        .filter(transactions::Column::ClientOperationId.eq(operation_id))
        .one(&state.db)
        .await
        .map_err(Into::into)
}

fn ensure_same_operation(
    existing: &transactions::Model,
    input: &PointTransactionInput,
) -> Result<(), AppError> {
    let same = existing.recurring_rule_id.is_none()
        && existing.category_id == input.category_id
        && existing.direction == input.direction.as_str()
        && existing.description == input.description
        && existing.status == input.status.as_str()
        && existing.expected_amount
            == match input.status {
                CreateTransactionStatus::Pending => Some(input.amount),
                CreateTransactionStatus::Paid => None,
            }
        && existing.actual_amount
            == match input.status {
                CreateTransactionStatus::Pending => None,
                CreateTransactionStatus::Paid => Some(input.amount),
            }
        && existing.due_date == input.due_date
        && existing.occurred_at == input.occurred_at
        && existing.notes == input.notes;

    if !same {
        return Err(AppError::IdempotencyConflict);
    }

    Ok(())
}

fn is_unique_violation(error: &DbErr) -> bool {
    matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_,)))
}

fn validate_point_transaction_shape(input: &PointTransactionInput) -> Result<(), AppError> {
    let valid = match input.status {
        CreateTransactionStatus::Pending => input.due_date.is_some() && input.occurred_at.is_none(),
        CreateTransactionStatus::Paid => input.due_date.is_none() && input.occurred_at.is_some(),
    };

    if !valid {
        return Err(AppError::BadRequest(match input.status {
            CreateTransactionStatus::Pending => {
                "Pending transactions require due_date and must not include occurred_at".to_owned()
            }
            CreateTransactionStatus::Paid => {
                "Paid transactions require occurred_at and must not include due_date".to_owned()
            }
        }));
    }

    Ok(())
}

async fn find_owned(
    state: &AppState,
    auth: &AuthUser,
    transaction_id: Uuid,
) -> Result<transactions::Model, AppError> {
    transactions::Entity::find()
        .filter(transactions::Column::Id.eq(transaction_id))
        .filter(transactions::Column::UserId.eq(auth.id))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)
}

async fn ensure_category_compatible(
    state: &AppState,
    auth: &AuthUser,
    category_id: Uuid,
    direction: TransactionDirection,
) -> Result<(), AppError> {
    let category = categories::Entity::find()
        .filter(categories::Column::Id.eq(category_id))
        .filter(categories::Column::UserId.eq(auth.id))
        .filter(categories::Column::IsArchived.eq(false))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    let compatible = match direction {
        TransactionDirection::Expense => {
            matches!(category.kind.as_str(), "expense" | "both")
        }

        TransactionDirection::Income => {
            matches!(category.kind.as_str(), "income" | "both")
        }
    };

    if !compatible {
        return Err(AppError::BadRequest(
            "Category is incompatible with transaction direction".to_owned(),
        ));
    }

    Ok(())
}

fn validate_money(amount: Decimal) -> Result<(), AppError> {
    if amount <= Decimal::ZERO {
        return Err(AppError::BadRequest(
            "Amount must be greater than zero".to_owned(),
        ));
    }

    if amount.scale() > 2 {
        return Err(AppError::BadRequest(
            "Amount cannot have more than two decimal places".to_owned(),
        ));
    }

    Ok(())
}

fn normalize_description(value: &str) -> Result<String, AppError> {
    let value = value.trim();

    if value.is_empty() {
        return Err(AppError::BadRequest(
            "Transaction description cannot be empty".to_owned(),
        ));
    }

    if value.chars().count() > DESCRIPTION_MAX_LENGTH {
        return Err(AppError::BadRequest(
            "Transaction description is too long".to_owned(),
        ));
    }

    Ok(value.to_owned())
}

fn normalize_notes(value: Option<String>) -> Result<Option<String>, AppError> {
    let Some(value) = value else {
        return Ok(None);
    };

    let value = value.trim();

    if value.is_empty() {
        return Ok(None);
    }

    if value.chars().count() > NOTES_MAX_LENGTH {
        return Err(AppError::BadRequest(
            "Transaction notes are too long".to_owned(),
        ));
    }

    Ok(Some(value.to_owned()))
}

fn month_filter(auth: &AuthUser, start: &MonthPeriod, end: &MonthPeriod) -> Condition {
    let end_exclusive = end
        .next()
        .map(|period| period.first_day())
        .unwrap_or(end.last_day());
    let recurring = Condition::all()
        .add(transactions::Column::RecurringRuleId.is_not_null())
        .add(transactions::Column::RecurrencePeriod.gte(start.first_day()))
        .add(transactions::Column::RecurrencePeriod.lt(end_exclusive));

    let scheduled_point_in_time = Condition::all()
        .add(transactions::Column::RecurringRuleId.is_null())
        .add(transactions::Column::DueDate.is_not_null())
        .add(transactions::Column::DueDate.gte(start.first_day()))
        .add(transactions::Column::DueDate.lt(end_exclusive));

    let unscheduled_point_in_time = Condition::all()
        .add(transactions::Column::RecurringRuleId.is_null())
        .add(transactions::Column::DueDate.is_null())
        .add(Expr::cust_with_values(
            r#"
                    "transactions"."occurred_at" >= (
                        $2::date::timestamp AT TIME ZONE $1
                    )
                    AND "transactions"."occurred_at" < (
                        $3::date::timestamp AT TIME ZONE $1
                    )
                    "#,
            [
                auth.timezone.clone(),
                start.first_day().to_string(),
                end_exclusive.to_string(),
            ],
        ));

    Condition::any()
        .add(recurring)
        .add(scheduled_point_in_time)
        .add(unscheduled_point_in_time)
}

#[cfg(test)]
mod tests {
    use sea_orm::{DbBackend, EntityTrait, QueryFilter, QueryTrait};
    use uuid::Uuid;

    use super::*;

    #[test]
    fn month_filter_builds_valid_postgres_placeholders() {
        let auth = AuthUser {
            id: Uuid::nil(),
            email: "user@example.com".to_owned(),
            display_name: None,
            currency: "BRL".to_owned(),
            timezone: "America/Sao_Paulo".to_owned(),
            locale: "es".to_owned(),
            theme: "aurora".to_owned(),
            theme_mode: "system".to_owned(),
            role: "user".to_owned(),
        };
        let period = MonthPeriod::parse("2026-08").unwrap();

        let statement = transactions::Entity::find()
            .filter(transactions::Column::UserId.eq(auth.id))
            .filter(month_filter(&auth, &period, &period))
            .build(DbBackend::Postgres);

        assert!(!statement.sql.contains('?'), "{}", statement.sql);
        assert!(
            statement.sql.contains("AT TIME ZONE $"),
            "{}",
            statement.sql
        );
        assert!(statement.sql.contains("due_date"), "{}", statement.sql);
    }
}
