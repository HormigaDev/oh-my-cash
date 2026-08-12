use rust_decimal::Decimal;
use serde::{Deserialize, Deserializer, Serialize};
use time::format_description::well_known::Iso8601;
use uuid::Uuid;

use crate::{entities::recurring_rules, error::AppError};

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum TransactionDirection {
    Income,
    Expense,
}

impl TransactionDirection {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Income => "income",
            Self::Expense => "expense",
        }
    }
}

impl TryFrom<&str> for TransactionDirection {
    type Error = AppError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "income" => Ok(Self::Income),
            "expense" => Ok(Self::Expense),
            _ => Err(AppError::Internal),
        }
    }
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum RecurrenceFrequency {
    Monthly,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(tag = "mode", rename_all = "lowercase")]
pub enum RecurringAmount {
    Fixed {
        #[serde(with = "rust_decimal::serde::str")]
        amount: Decimal,
    },

    Variable {
        #[serde(default, with = "rust_decimal::serde::str_option")]
        estimated: Option<Decimal>,

        #[serde(default, with = "rust_decimal::serde::str_option")]
        min: Option<Decimal>,

        #[serde(default, with = "rust_decimal::serde::str_option")]
        max: Option<Decimal>,
    },
}

#[derive(Debug, Deserialize)]
pub struct CreateRecurringRuleRequest {
    pub category_id: Uuid,

    pub name: String,

    pub direction: TransactionDirection,

    pub amount: RecurringAmount,

    pub day_of_month: u8,

    pub starts_on: String,

    #[serde(default)]
    pub ends_on: Option<String>,

    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateRecurringRuleRequest {
    #[serde(default)]
    pub category_id: Option<Uuid>,

    #[serde(default)]
    pub name: Option<String>,

    #[serde(default)]
    pub direction: Option<TransactionDirection>,

    #[serde(default)]
    pub amount: Option<RecurringAmount>,

    #[serde(default)]
    pub day_of_month: Option<u8>,

    #[serde(default)]
    pub starts_on: Option<String>,

    #[serde(default)]
    pub ends_on: PatchValue<String>,

    #[serde(default)]
    pub notes: PatchValue<String>,
}

impl UpdateRecurringRuleRequest {
    pub fn is_empty(&self) -> bool {
        self.category_id.is_none()
            && self.name.is_none()
            && self.direction.is_none()
            && self.amount.is_none()
            && self.day_of_month.is_none()
            && self.starts_on.is_none()
            && self.ends_on.is_missing()
            && self.notes.is_missing()
    }
}

#[derive(Debug, Default)]
pub enum PatchValue<T> {
    #[default]
    Missing,

    Null,

    Value(T),
}

impl<T> PatchValue<T> {
    pub const fn is_missing(&self) -> bool {
        matches!(self, Self::Missing)
    }
}

impl<'de, T> Deserialize<'de> for PatchValue<T>
where
    T: Deserialize<'de>,
{
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        Option::<T>::deserialize(deserializer).map(|value| match value {
            Some(value) => Self::Value(value),

            None => Self::Null,
        })
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct RecurringRuleResponse {
    pub id: Uuid,

    pub category_id: Uuid,

    pub name: String,

    pub direction: TransactionDirection,

    pub amount: RecurringAmount,

    pub frequency: RecurrenceFrequency,

    pub day_of_month: u8,

    pub starts_on: String,

    pub ends_on: Option<String>,

    pub notes: Option<String>,
}

impl TryFrom<recurring_rules::Model> for RecurringRuleResponse {
    type Error = AppError;

    fn try_from(model: recurring_rules::Model) -> Result<Self, Self::Error> {
        let direction = TransactionDirection::try_from(model.direction.as_str())?;

        let amount = match model.amount_mode.as_str() {
            "fixed" => {
                let amount = model.fixed_amount.ok_or(AppError::Internal)?;

                RecurringAmount::Fixed { amount }
            }

            "variable" => RecurringAmount::Variable {
                estimated: model.estimated_amount,

                min: model.min_amount,

                max: model.max_amount,
            },

            _ => {
                return Err(AppError::Internal);
            }
        };

        let starts_on = model
            .starts_on
            .format(&Iso8601::DATE)
            .map_err(|_| AppError::Internal)?;

        let ends_on = model
            .ends_on
            .map(|date| date.format(&Iso8601::DATE).map_err(|_| AppError::Internal))
            .transpose()?;

        let day_of_month = u8::try_from(model.day_of_month).map_err(|_| AppError::Internal)?;

        Ok(Self {
            id: model.id,
            category_id: model.category_id,

            name: model.name,

            direction,

            amount,

            frequency: RecurrenceFrequency::Monthly,

            day_of_month,

            starts_on,
            ends_on,

            notes: model.notes,
        })
    }
}
