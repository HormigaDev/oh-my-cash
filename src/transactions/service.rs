use rust_decimal::Decimal;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, Condition, DbErr, EntityTrait, NotSet, QueryFilter, QueryOrder,
    QuerySelect, Set, SqlErr, sea_query::Expr,
};
use time::OffsetDateTime;
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    entities::{categories, transactions},
    error::AppError,
    materialization::MonthPeriod,
    transactions::dto::{
        CreateTransactionRequest, PayTransactionRequest, TransactionDirection, TransactionResponse,
        UpdateTransactionRequest, parse_datetime,
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

    description: String,

    amount: Decimal,

    occurred_at: OffsetDateTime,

    notes: Option<String>,
}

pub async fn list(
    state: &AppState,
    auth: &AuthUser,
    period: Option<&MonthPeriod>,
) -> Result<Vec<TransactionResponse>, AppError> {
    let mut query = transactions::Entity::find().filter(transactions::Column::UserId.eq(auth.id));

    if let Some(period) = period {
        query = query.filter(month_filter(auth, period));
    }

    let models = query
        .order_by_desc(transactions::Column::CreatedAt)
        .limit(200)
        .all(&state.db)
        .await?;

    models
        .into_iter()
        .map(TransactionResponse::try_from)
        .collect()
}

pub async fn create(
    state: &AppState,
    auth: &AuthUser,
    request: CreateTransactionRequest,
) -> Result<CreateTransactionResult, AppError> {
    let input = PointTransactionInput {
        category_id: request.category_id,

        direction: request.direction,

        description: normalize_description(&request.description)?,

        amount: request.amount,

        occurred_at: parse_datetime(&request.occurred_at, "occurred_at")?,

        notes: normalize_notes(request.notes)?,
    };

    validate_money(input.amount)?;

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

        status: Set("paid".to_owned()),

        description: Set(input.description.clone()),

        notes: Set(input.notes.clone()),

        expected_amount: Set(None),

        actual_amount: Set(Some(input.amount)),

        due_date: Set(None),

        recurrence_period: Set(None),

        occurred_at: Set(Some(input.occurred_at)),

        paid_at: Set(Some(now)),

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

    if transaction.status != "paid" {
        return Err(AppError::InvalidTransactionState);
    }

    let current_direction = TransactionDirection::try_from(transaction.direction.as_str())?;

    let final_category_id = request.category_id.unwrap_or(transaction.category_id);

    let final_direction = request.direction.unwrap_or(current_direction);

    if request.category_id.is_some() || request.direction.is_some() {
        ensure_category_compatible(state, auth, final_category_id, final_direction).await?;
    }

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

        active.actual_amount = Set(Some(amount));
    }

    if let Some(occurred_at) = request.occurred_at {
        active.occurred_at = Set(Some(parse_datetime(&occurred_at, "occurred_at")?));
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
        && existing.actual_amount == Some(input.amount)
        && existing.occurred_at == Some(input.occurred_at)
        && existing.notes == input.notes;

    if !same {
        return Err(AppError::IdempotencyConflict);
    }

    Ok(())
}

fn is_unique_violation(error: &DbErr) -> bool {
    matches!(error.sql_err(), Some(SqlErr::UniqueConstraintViolation(_,)))
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

fn month_filter(auth: &AuthUser, period: &MonthPeriod) -> Condition {
    let recurring = Condition::all()
        .add(transactions::Column::RecurringRuleId.is_not_null())
        .add(transactions::Column::RecurrencePeriod.eq(period.first_day()));

    let point_in_time = Condition::all()
        .add(transactions::Column::RecurringRuleId.is_null())
        .add(Expr::cust_with_values(
            r#"
                    to_char(
                        "transactions"."occurred_at"
                        AT TIME ZONE ?,
                        'YYYY-MM'
                    ) = ?
                    "#,
            [auth.timezone.clone(), period.key().to_owned()],
        ));

    Condition::any().add(recurring).add(point_in_time)
}
