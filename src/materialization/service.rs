use rust_decimal::Decimal;
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, NotSet, QueryFilter, Set, TransactionTrait,
    TryInsertResult,
    sea_query::{Expr, ExprTrait, OnConflict},
};

use crate::{
    app::AppState,
    auth::AuthUser,
    entities::{recurring_rules, transactions},
    error::AppError,
    materialization::period::MonthPeriod,
};

#[derive(Clone, Copy, Debug, Default)]
pub struct MaterializationResult {
    pub created: u64,
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
