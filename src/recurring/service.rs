use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, NotSet, QueryFilter, QueryOrder, Set};
use time::{Date, format_description::well_known::Iso8601};
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    entities::{categories, recurring_rules},
    error::AppError,
    recurring::dto::{
        CreateRecurringRuleRequest, PatchValue, RecurringAmount, RecurringRuleResponse,
        TransactionDirection, UpdateRecurringRuleRequest,
    },
};

const RULE_NAME_MAX_LENGTH: usize = 120;

const RULE_NOTES_MAX_LENGTH: usize = 2000;

pub async fn list(
    state: &AppState,
    auth: &AuthUser,
) -> Result<Vec<RecurringRuleResponse>, AppError> {
    let models = recurring_rules::Entity::find()
        .filter(recurring_rules::Column::UserId.eq(auth.id))
        .filter(recurring_rules::Column::IsActive.eq(true))
        .order_by_asc(recurring_rules::Column::DayOfMonth)
        .order_by_asc(recurring_rules::Column::Name)
        .all(&state.db)
        .await?;

    models
        .into_iter()
        .map(RecurringRuleResponse::try_from)
        .collect()
}

pub async fn create(
    state: &AppState,
    auth: &AuthUser,
    request: CreateRecurringRuleRequest,
) -> Result<RecurringRuleResponse, AppError> {
    let name = normalize_name(&request.name)?;

    validate_day_of_month(request.day_of_month)?;

    let starts_on = parse_date(&request.starts_on, "starts_on")?;

    let ends_on = request
        .ends_on
        .as_deref()
        .map(|value| parse_date(value, "ends_on"))
        .transpose()?;

    validate_date_range(starts_on, ends_on)?;

    ensure_category_compatible(state, auth, request.category_id, request.direction).await?;

    let amount = validate_amount(request.amount)?;

    let notes = normalize_notes(request.notes)?;

    let model = recurring_rules::ActiveModel {
        id: NotSet,

        user_id: Set(auth.id),

        category_id: Set(request.category_id),

        name: Set(name),

        direction: Set(request.direction.as_str().to_owned()),

        amount_mode: Set(amount.mode.to_owned()),

        fixed_amount: Set(amount.fixed),

        estimated_amount: Set(amount.estimated),

        min_amount: Set(amount.min),

        max_amount: Set(amount.max),

        frequency: Set("monthly".to_owned()),

        day_of_month: Set(i16::from(request.day_of_month)),

        starts_on: Set(starts_on),

        ends_on: Set(ends_on),

        is_active: Set(true),

        notes: Set(notes),

        created_at: NotSet,

        updated_at: NotSet,
    };

    let rule = model.insert(&state.db).await?;

    rule.try_into()
}

pub async fn update(
    state: &AppState,
    auth: &AuthUser,
    rule_id: Uuid,
    request: UpdateRecurringRuleRequest,
) -> Result<RecurringRuleResponse, AppError> {
    if request.is_empty() {
        return Err(AppError::BadRequest("No fields to update".to_owned()));
    }

    let rule = recurring_rules::Entity::find()
        .filter(recurring_rules::Column::Id.eq(rule_id))
        .filter(recurring_rules::Column::UserId.eq(auth.id))
        .filter(recurring_rules::Column::IsActive.eq(true))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    let current_direction = TransactionDirection::try_from(rule.direction.as_str())?;

    let final_category_id = request.category_id.unwrap_or(rule.category_id);

    let final_direction = request.direction.unwrap_or(current_direction);

    if request.category_id.is_some() || request.direction.is_some() {
        ensure_category_compatible(state, auth, final_category_id, final_direction).await?;
    }

    let new_starts_on = request
        .starts_on
        .as_deref()
        .map(|value| parse_date(value, "starts_on"))
        .transpose()?;

    let final_starts_on = new_starts_on.unwrap_or(rule.starts_on);

    let (ends_on_changed, final_ends_on) = match &request.ends_on {
        PatchValue::Missing => (false, rule.ends_on),

        PatchValue::Null => (true, None),

        PatchValue::Value(value) => (true, Some(parse_date(value, "ends_on")?)),
    };

    validate_date_range(final_starts_on, final_ends_on)?;

    let mut active: recurring_rules::ActiveModel = rule.into();

    if let Some(category_id) = request.category_id {
        active.category_id = Set(category_id);
    }

    if let Some(name) = request.name {
        active.name = Set(normalize_name(&name)?);
    }

    if let Some(direction) = request.direction {
        active.direction = Set(direction.as_str().to_owned());
    }

    if let Some(amount) = request.amount {
        let amount = validate_amount(amount)?;

        active.amount_mode = Set(amount.mode.to_owned());

        active.fixed_amount = Set(amount.fixed);

        active.estimated_amount = Set(amount.estimated);

        active.min_amount = Set(amount.min);

        active.max_amount = Set(amount.max);
    }

    if let Some(day) = request.day_of_month {
        validate_day_of_month(day)?;

        active.day_of_month = Set(i16::from(day));
    }

    if let Some(starts_on) = new_starts_on {
        active.starts_on = Set(starts_on);
    }

    if ends_on_changed {
        active.ends_on = Set(final_ends_on);
    }

    match request.notes {
        PatchValue::Missing => {}

        PatchValue::Null => {
            active.notes = Set(None);
        }

        PatchValue::Value(value) => {
            active.notes = Set(normalize_notes(Some(value))?);
        }
    }

    let rule = active.update(&state.db).await?;

    rule.try_into()
}

pub async fn deactivate(state: &AppState, auth: &AuthUser, rule_id: Uuid) -> Result<(), AppError> {
    let rule = recurring_rules::Entity::find()
        .filter(recurring_rules::Column::Id.eq(rule_id))
        .filter(recurring_rules::Column::UserId.eq(auth.id))
        .one(&state.db)
        .await?
        .ok_or(AppError::NotFound)?;

    if !rule.is_active {
        return Ok(());
    }

    let mut active: recurring_rules::ActiveModel = rule.into();

    active.is_active = Set(false);

    active.update(&state.db).await?;

    Ok(())
}

struct AmountColumns {
    mode: &'static str,

    fixed: Option<Decimal>,

    estimated: Option<Decimal>,
    min: Option<Decimal>,
    max: Option<Decimal>,
}

fn validate_amount(amount: RecurringAmount) -> Result<AmountColumns, AppError> {
    match amount {
        RecurringAmount::Fixed { amount } => {
            validate_money(amount)?;

            Ok(AmountColumns {
                mode: "fixed",

                fixed: Some(amount),

                estimated: None,

                min: None,

                max: None,
            })
        }

        RecurringAmount::Variable {
            estimated,
            min,
            max,
        } => {
            for amount in [estimated, min, max].into_iter().flatten() {
                validate_money(amount)?;
            }

            if let (Some(min), Some(max)) = (min, max)
                && min > max
            {
                return Err(AppError::BadRequest(
                    "Minimum amount cannot exceed maximum amount".to_owned(),
                ));
            }

            if let (Some(estimated), Some(min)) = (estimated, min)
                && estimated < min
            {
                return Err(AppError::BadRequest(
                    "Estimated amount cannot be below minimum amount".to_owned(),
                ));
            }

            if let (Some(estimated), Some(max)) = (estimated, max)
                && estimated > max
            {
                return Err(AppError::BadRequest(
                    "Estimated amount cannot exceed maximum amount".to_owned(),
                ));
            }

            Ok(AmountColumns {
                mode: "variable",

                fixed: None,

                estimated,

                min,

                max,
            })
        }
    }
}

fn validate_money(amount: Decimal) -> Result<(), AppError> {
    if amount <= Decimal::ZERO {
        return Err(AppError::BadRequest(
            "Amounts must be greater than zero".to_owned(),
        ));
    }

    if amount.scale() > 2 {
        return Err(AppError::BadRequest(
            "Amounts cannot have more than two decimal places".to_owned(),
        ));
    }

    Ok(())
}

fn validate_day_of_month(day: u8) -> Result<(), AppError> {
    if !(1..=31).contains(&day) {
        return Err(AppError::BadRequest(
            "day_of_month must be between 1 and 31".to_owned(),
        ));
    }

    Ok(())
}

fn parse_date(value: &str, field: &str) -> Result<Date, AppError> {
    Date::parse(value, &Iso8601::DATE)
        .map_err(|_| AppError::BadRequest(format!("{field} must use YYYY-MM-DD")))
}

fn validate_date_range(starts_on: Date, ends_on: Option<Date>) -> Result<(), AppError> {
    if let Some(ends_on) = ends_on
        && ends_on < starts_on
    {
        return Err(AppError::BadRequest(
            "ends_on cannot be before starts_on".to_owned(),
        ));
    }

    Ok(())
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

fn normalize_name(value: &str) -> Result<String, AppError> {
    let value = value.trim();

    if value.is_empty() {
        return Err(AppError::BadRequest(
            "Recurring rule name cannot be empty".to_owned(),
        ));
    }

    if value.chars().count() > RULE_NAME_MAX_LENGTH {
        return Err(AppError::BadRequest(
            "Recurring rule name is too long".to_owned(),
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

    if value.chars().count() > RULE_NOTES_MAX_LENGTH {
        return Err(AppError::BadRequest("Notes are too long".to_owned()));
    }

    Ok(Some(value.to_owned()))
}
