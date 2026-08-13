use rust_decimal::Decimal;
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, FromQueryResult, NotSet, QueryFilter, Set,
    TransactionTrait, TryInsertResult, raw_sql,
    sea_query::{Expr, ExprTrait, OnConflict},
};
use sha2::{Digest, Sha256};
use time::Date;

use crate::{
    app::AppState,
    auth::AuthUser,
    entities::{recurring_rules, transactions},
    error::AppError,
    materialization::period::MonthPeriod,
    transactions::dto::{TransactionDirection, TransactionResponse, TransactionStatus},
};

#[derive(Clone, Copy, Debug, Default)]
pub struct MaterializationResult {
    pub created: u64,
}

#[derive(Debug, FromQueryResult)]
struct CurrentDateRow {
    current_date: Date,
}

pub async fn prepare_requested_period(
    state: &AppState,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
) -> Result<MonthPeriod, AppError> {
    let current = current_period(state, auth).await?;
    let next = current.next()?;

    for period in [&current, &next] {
        if period.first_day() >= start.first_day() && period.first_day() <= end.first_day() {
            materialize_month(state, auth, period).await?;
        }
    }

    next.next()
}

pub async fn virtual_transactions(
    state: &AppState,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
    virtual_from: &MonthPeriod,
) -> Result<Vec<TransactionResponse>, AppError> {
    if end.first_day() < virtual_from.first_day() {
        return Ok(Vec::new());
    }

    let lower_bound = if start.first_day() > virtual_from.first_day() {
        start
    } else {
        virtual_from
    };
    let rules = recurring_rules::Entity::find()
        .filter(recurring_rules::Column::UserId.eq(auth.id))
        .filter(recurring_rules::Column::IsActive.eq(true))
        .filter(recurring_rules::Column::Frequency.eq("monthly"))
        .filter(recurring_rules::Column::StartsOn.lte(end.last_day()))
        .filter(
            Condition::any()
                .add(recurring_rules::Column::EndsOn.is_null())
                .add(recurring_rules::Column::EndsOn.gte(lower_bound.first_day())),
        )
        .all(&state.db)
        .await?;

    let mut items = Vec::new();
    let mut period = end.clone();
    loop {
        for rule in &rules {
            let day = u8::try_from(rule.day_of_month).map_err(|_| AppError::Internal)?;
            let due_date = period.due_date(day)?;
            if !rule_applies_on(rule, due_date) {
                continue;
            }
            items.push(TransactionResponse {
                id: virtual_id(auth.id, rule.id, period.key()),
                category_id: rule.category_id,
                recurring_rule_id: Some(rule.id),
                client_operation_id: None,
                direction: TransactionDirection::try_from(rule.direction.as_str())?,
                status: TransactionStatus::Pending,
                description: rule.name.clone(),
                notes: rule.notes.clone(),
                expected_amount: expected_amount(rule)?,
                actual_amount: None,
                due_date: Some(due_date.to_string()),
                recurrence_period: Some(period.first_day().to_string()),
                occurred_at: None,
                paid_at: None,
                virtual_transaction: true,
            });
        }

        if period.first_day() == lower_bound.first_day() {
            break;
        }
        period = period.previous()?;
    }
    Ok(items)
}

async fn current_period(state: &AppState, auth: &AuthUser) -> Result<MonthPeriod, AppError> {
    let timezone = auth.timezone.clone();
    let row = CurrentDateRow::find_by_statement(raw_sql!(
        Postgres,
        "SELECT (CURRENT_TIMESTAMP AT TIME ZONE {timezone})::date AS current_date"
    ))
    .one(&state.db)
    .await?
    .ok_or(AppError::Internal)?;
    MonthPeriod::from_date(row.current_date)
}

fn virtual_id(user_id: uuid::Uuid, rule_id: uuid::Uuid, period: &str) -> uuid::Uuid {
    let mut hash = Sha256::new();
    hash.update(user_id.as_bytes());
    hash.update(rule_id.as_bytes());
    hash.update(period.as_bytes());
    let digest = hash.finalize();
    let mut bytes = [0_u8; 16];
    bytes.copy_from_slice(&digest[..16]);
    bytes[6] = (bytes[6] & 0x0f) | 0x50;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    uuid::Uuid::from_bytes(bytes)
}

pub async fn materialize_month(
    state: &AppState,
    auth: &AuthUser,
    period: &MonthPeriod,
) -> Result<MaterializationResult, AppError> {
    let transaction = state.db.begin().await?;

    let rules = recurring_rules::Entity::find()
        .filter(recurring_rules::Column::UserId.eq(auth.id))
        .filter(recurring_rules::Column::IsActive.eq(true))
        .filter(recurring_rules::Column::Frequency.eq("monthly"))
        .filter(recurring_rules::Column::StartsOn.lte(period.last_day()))
        .filter(
            Condition::any()
                .add(recurring_rules::Column::EndsOn.is_null())
                .add(recurring_rules::Column::EndsOn.gte(period.first_day())),
        )
        .all(&transaction)
        .await?;

    let mut created = 0_u64;

    for rule in rules {
        let day_of_month = u8::try_from(rule.day_of_month).map_err(|_| AppError::Internal)?;

        let due_date = period.due_date(day_of_month)?;

        if !rule_applies_on(&rule, due_date) {
            continue;
        }

        let expected_amount = expected_amount(&rule)?;

        let model = transactions::ActiveModel {
            id: NotSet,

            user_id: Set(auth.id),

            category_id: Set(rule.category_id),

            recurring_rule_id: Set(Some(rule.id)),

            client_operation_id: Set(None),

            direction: Set(rule.direction.clone()),

            status: Set("pending".to_owned()),

            description: Set(rule.name.clone()),

            notes: Set(rule.notes.clone()),

            expected_amount: Set(expected_amount),

            actual_amount: Set(None),

            due_date: Set(Some(due_date)),

            recurrence_period: Set(Some(period.first_day())),

            occurred_at: Set(None),

            paid_at: Set(None),

            created_at: NotSet,

            updated_at: NotSet,
        };

        let result = transactions::Entity::insert(model)
            .on_conflict(recurrence_conflict())
            .try_insert()
            .exec(&transaction)
            .await?;

        match result {
            TryInsertResult::Inserted(_) => {
                created += 1;
            }

            TryInsertResult::Conflicted => {}

            TryInsertResult::Empty => {
                return Err(AppError::Internal);
            }
        }
    }

    transaction.commit().await?;

    Ok(MaterializationResult { created })
}

fn recurrence_conflict() -> OnConflict {
    OnConflict::columns([
        transactions::Column::RecurringRuleId,
        transactions::Column::RecurrencePeriod,
    ])
    .target_and_where(Expr::col(transactions::Column::RecurringRuleId).is_not_null())
    .do_nothing()
    .to_owned()
}

fn rule_applies_on(rule: &recurring_rules::Model, due_date: time::Date) -> bool {
    if due_date < rule.starts_on {
        return false;
    }

    match rule.ends_on {
        Some(ends_on) => due_date <= ends_on,

        None => true,
    }
}

fn expected_amount(rule: &recurring_rules::Model) -> Result<Option<Decimal>, AppError> {
    match rule.amount_mode.as_str() {
        "fixed" => {
            let amount = rule.fixed_amount.ok_or(AppError::Internal)?;

            Ok(Some(amount))
        }

        "variable" => Ok(rule.estimated_amount),

        _ => Err(AppError::Internal),
    }
}
