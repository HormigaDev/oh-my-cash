use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use time::{
    Date, OffsetDateTime,
    format_description::well_known::{Iso8601, Rfc3339},
};
use uuid::Uuid;

use crate::{entities::transactions, error::AppError};

#[derive(Debug, Deserialize)]
pub struct ListTransactionsQuery {
    #[serde(default)]
    pub month: Option<String>,
}

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
pub enum TransactionStatus {
    Pending,
    Paid,
    Skipped,
    Cancelled,
}

#[derive(Clone, Copy, Debug, PartialEq, Eq, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum CreateTransactionStatus {
    Pending,
    Paid,
}

impl CreateTransactionStatus {
    pub const fn as_str(self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Paid => "paid",
        }
    }
}

impl TryFrom<&str> for TransactionStatus {
    type Error = AppError;

    fn try_from(value: &str) -> Result<Self, Self::Error> {
        match value {
            "pending" => Ok(Self::Pending),

            "paid" => Ok(Self::Paid),

            "skipped" => Ok(Self::Skipped),

            "cancelled" => Ok(Self::Cancelled),

            _ => Err(AppError::Internal),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateTransactionRequest {
    pub client_operation_id: Uuid,

    pub category_id: Uuid,

    pub direction: TransactionDirection,

    pub status: CreateTransactionStatus,

    pub description: String,

    #[serde(with = "rust_decimal::serde::str")]
    pub amount: Decimal,

    #[serde(default)]
    pub due_date: Option<String>,

    #[serde(default)]
    pub occurred_at: Option<String>,

    #[serde(default)]
    pub notes: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateTransactionRequest {
    #[serde(default)]
    pub category_id: Option<Uuid>,

    #[serde(default)]
    pub direction: Option<TransactionDirection>,

    #[serde(default)]
    pub description: Option<String>,

    #[serde(default, with = "rust_decimal::serde::str_option")]
    pub amount: Option<Decimal>,

    #[serde(default)]
    pub occurred_at: Option<String>,

    #[serde(default)]
    pub due_date: Option<String>,

    #[serde(default)]
    pub notes: Option<String>,
}

impl UpdateTransactionRequest {
    pub fn is_empty(&self) -> bool {
        self.category_id.is_none()
            && self.direction.is_none()
            && self.description.is_none()
            && self.amount.is_none()
            && self.occurred_at.is_none()
            && self.due_date.is_none()
            && self.notes.is_none()
    }
}

#[derive(Debug, Deserialize)]
pub struct PayTransactionRequest {
    #[serde(default, with = "rust_decimal::serde::str_option")]
    pub amount: Option<Decimal>,

    #[serde(default)]
    pub occurred_at: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
pub struct TransactionResponse {
    pub id: Uuid,

    pub category_id: Uuid,

    pub recurring_rule_id: Option<Uuid>,

    pub client_operation_id: Option<Uuid>,

    pub direction: TransactionDirection,

    pub status: TransactionStatus,

    pub description: String,

    pub notes: Option<String>,

    #[serde(with = "rust_decimal::serde::str_option")]
    pub expected_amount: Option<Decimal>,

    #[serde(with = "rust_decimal::serde::str_option")]
    pub actual_amount: Option<Decimal>,

    pub due_date: Option<String>,

    pub recurrence_period: Option<String>,

    pub occurred_at: Option<String>,

    pub paid_at: Option<String>,
}

impl TryFrom<transactions::Model> for TransactionResponse {
    type Error = AppError;

    fn try_from(model: transactions::Model) -> Result<Self, Self::Error> {
        Ok(Self {
            id: model.id,

            category_id: model.category_id,

            recurring_rule_id: model.recurring_rule_id,

            client_operation_id: model.client_operation_id,

            direction: TransactionDirection::try_from(model.direction.as_str())?,

            status: TransactionStatus::try_from(model.status.as_str())?,

            description: model.description,

            notes: model.notes,

            expected_amount: model.expected_amount,

            actual_amount: model.actual_amount,

            due_date: format_optional_date(model.due_date)?,

            recurrence_period: format_optional_date(model.recurrence_period)?,

            occurred_at: format_optional_datetime(model.occurred_at)?,

            paid_at: format_optional_datetime(model.paid_at)?,
        })
    }
}

pub fn parse_datetime(value: &str, field: &str) -> Result<OffsetDateTime, AppError> {
    OffsetDateTime::parse(value, &Rfc3339)
        .map_err(|_| AppError::BadRequest(format!("{field} must use RFC3339")))
}

pub fn parse_date(value: &str, field: &str) -> Result<Date, AppError> {
    Date::parse(value, &Iso8601::DATE)
        .map_err(|_| AppError::BadRequest(format!("{field} must use YYYY-MM-DD")))
}

fn format_optional_date(value: Option<Date>) -> Result<Option<String>, AppError> {
    value
        .map(|value| value.format(&Iso8601::DATE).map_err(|_| AppError::Internal))
        .transpose()
}

fn format_optional_datetime(value: Option<OffsetDateTime>) -> Result<Option<String>, AppError> {
    value
        .map(|value| value.format(&Rfc3339).map_err(|_| AppError::Internal))
        .transpose()
}
