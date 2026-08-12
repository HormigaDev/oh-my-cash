use rust_decimal::Decimal;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::transactions::dto::TransactionDirection;

#[derive(Debug, Deserialize)]
pub struct DashboardQuery {
    #[serde(default)]
    pub month: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct DashboardResponse {
    pub month: String,

    pub currency: String,

    pub summary: DashboardSummary,

    pub spending_by_category: Vec<CategorySpending>,

    pub pending: Vec<PendingItem>,

    pub recent_activity: Vec<ActivityItem>,
}

#[derive(Debug, Serialize)]
pub struct DashboardSummary {
    #[serde(with = "rust_decimal::serde::str")]
    pub income_received: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub expenses_paid: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub real_balance: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub pending_income: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub pending_expenses: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub projected_income: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub projected_expenses: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub projected_balance: Decimal,

    #[serde(with = "rust_decimal::serde::str_option")]
    pub actual_savings_rate_percent: Option<Decimal>,

    #[serde(with = "rust_decimal::serde::str_option")]
    pub projected_savings_rate_percent: Option<Decimal>,

    pub projection_complete: bool,

    pub pending_income_without_estimate: u64,

    pub pending_expenses_without_estimate: u64,

    pub overdue_income: u64,

    pub overdue_expenses: u64,

    pub paid_transaction_count: u64,

    pub pending_transaction_count: u64,
}

#[derive(Clone, Debug, Serialize)]
pub struct DashboardCategory {
    pub id: Uuid,

    pub name: String,

    pub icon: Option<String>,

    pub color: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct CategorySpending {
    pub category: DashboardCategory,

    #[serde(with = "rust_decimal::serde::str")]
    pub paid_amount: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub pending_amount: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub projected_amount: Decimal,

    #[serde(with = "rust_decimal::serde::str")]
    pub paid_expense_share_percent: Decimal,

    pub paid_count: u64,

    pub pending_count: u64,

    pub pending_without_estimate: u64,
}

#[derive(Debug, Serialize)]
pub struct PendingItem {
    pub id: Uuid,

    pub recurring_rule_id: Option<Uuid>,

    pub category: DashboardCategory,

    pub direction: TransactionDirection,

    pub description: String,

    #[serde(with = "rust_decimal::serde::str_option")]
    pub expected_amount: Option<Decimal>,

    pub due_date: Option<String>,

    pub overdue: bool,
}

#[derive(Debug, Serialize)]
pub struct ActivityItem {
    pub id: Uuid,

    pub category: DashboardCategory,

    pub direction: TransactionDirection,

    pub description: String,

    #[serde(with = "rust_decimal::serde::str")]
    pub amount: Decimal,

    pub occurred_at: String,

    pub recurring: bool,
}
