use rust_decimal::Decimal;
use sea_orm::{
    AccessMode, DatabaseTransaction, FromQueryResult, IsolationLevel, TransactionTrait, raw_sql,
};
use time::{
    Date, OffsetDateTime,
    format_description::well_known::{Iso8601, Rfc3339},
};
use uuid::Uuid;

use crate::{
    app::AppState,
    auth::AuthUser,
    dashboard::dto::{
        ActivityItem, CategorySpending, DashboardCategory, DashboardResponse, DashboardSummary,
        PendingItem,
    },
    error::AppError,
    materialization::{MonthPeriod, materialize_month},
    transactions::dto::TransactionDirection,
};

#[derive(Debug, FromQueryResult)]
struct SummaryRow {
    income_received: Decimal,

    expenses_paid: Decimal,

    pending_income: Decimal,

    pending_expenses: Decimal,

    pending_income_without_estimate: i64,

    pending_expenses_without_estimate: i64,

    overdue_income: i64,

    overdue_expenses: i64,

    paid_transaction_count: i64,

    pending_transaction_count: i64,
}

#[derive(Debug, FromQueryResult)]
struct GlobalBalanceRow {
    global_balance: Decimal,
    pending_income: Decimal,
    pending_expenses: Decimal,
    pending_without_estimate: i64,
}

#[derive(Debug, FromQueryResult)]
struct CategoryRow {
    category_id: Uuid,

    category_name: String,

    category_icon: Option<String>,

    category_color: Option<String>,

    paid_amount: Decimal,

    pending_amount: Decimal,

    paid_count: i64,

    pending_count: i64,

    pending_without_estimate: i64,
}

#[derive(Debug, FromQueryResult)]
struct PendingRow {
    id: Uuid,

    recurring_rule_id: Option<Uuid>,

    category_id: Uuid,

    category_name: String,

    category_icon: Option<String>,

    category_color: Option<String>,

    direction: String,

    description: String,

    expected_amount: Option<Decimal>,

    due_date: Option<Date>,

    overdue: bool,
}

#[derive(Debug, FromQueryResult)]
struct ActivityRow {
    id: Uuid,

    category_id: Uuid,

    category_name: String,

    category_icon: Option<String>,

    category_color: Option<String>,

    direction: String,

    description: String,

    amount: Decimal,

    occurred_at: OffsetDateTime,

    recurring: bool,
}

pub async fn get_dashboard(
    state: &AppState,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
) -> Result<DashboardResponse, AppError> {
    let mut period = start.clone();
    loop {
        materialize_month(state, auth, &period).await?;
        if period == *end {
            break;
        }
        period = period.next()?;
    }

    let transaction = state
        .db
        .begin_with_config(
            Some(IsolationLevel::RepeatableRead),
            Some(AccessMode::ReadOnly),
        )
        .await?;

    let summary_row = load_summary(&transaction, auth, start, end).await?;

    let global = load_global_balance(&transaction, auth).await?;

    let summary = build_summary(summary_row, global)?;

    let spending_by_category =
        load_categories(&transaction, auth, start, end, summary.expenses_paid).await?;

    let pending = load_pending(&transaction, auth, start, end).await?;

    let recent_activity = load_activity(&transaction, auth, start, end).await?;

    transaction.commit().await?;

    Ok(DashboardResponse {
        month: start.key().to_owned(),

        start_month: start.key().to_owned(),

        end_month: end.key().to_owned(),

        currency: auth.currency.clone(),

        summary,

        spending_by_category,

        pending,

        recent_activity,
    })
}

async fn load_summary(
    db: &DatabaseTransaction,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
) -> Result<SummaryRow, AppError> {
    let user_id = auth.id;

    let range_start = start.first_day();

    let range_end = end.next()?.first_day();

    let timezone = auth.timezone.clone();

    let row = SummaryRow::find_by_statement(raw_sql!(
        Postgres,
        r#"
                WITH period_transactions AS (
                    SELECT t.*
                    FROM transactions t
                    WHERE
                        t.user_id = {user_id}
                        AND (
                            (
                                t.recurring_rule_id IS NOT NULL
                                AND t.recurrence_period >= {range_start}
                                AND t.recurrence_period < {range_end}
                            )
                            OR
                            (
                                t.recurring_rule_id IS NULL
                                AND (
                                    (
                                        t.due_date IS NULL
                                        AND t.occurred_at >= (
                                            {range_start}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                        AND t.occurred_at < (
                                            {range_end}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                    )
                                    OR
                                    (
                                        t.due_date IS NOT NULL
                                        AND t.due_date >= {range_start}
                                        AND t.due_date < {range_end}
                                    )
                                )
                            )
                        )
                )
                SELECT
                    COALESCE(
                        SUM(actual_amount)
                        FILTER (
                            WHERE
                                status = 'paid'
                                AND direction = 'income'
                        ),
                        0
                    ) AS income_received,

                    COALESCE(
                        SUM(actual_amount)
                        FILTER (
                            WHERE
                                status = 'paid'
                                AND direction = 'expense'
                        ),
                        0
                    ) AS expenses_paid,

                    COALESCE(
                        SUM(expected_amount)
                        FILTER (
                            WHERE
                                status = 'pending'
                                AND direction = 'income'
                        ),
                        0
                    ) AS pending_income,

                    COALESCE(
                        SUM(expected_amount)
                        FILTER (
                            WHERE
                                status = 'pending'
                                AND direction = 'expense'
                        ),
                        0
                    ) AS pending_expenses,

                    COUNT(*)
                    FILTER (
                        WHERE
                            status = 'pending'
                            AND direction = 'income'
                            AND expected_amount IS NULL
                    ) AS pending_income_without_estimate,

                    COUNT(*)
                    FILTER (
                        WHERE
                            status = 'pending'
                            AND direction = 'expense'
                            AND expected_amount IS NULL
                    ) AS pending_expenses_without_estimate,

                    COUNT(*)
                    FILTER (
                        WHERE
                            status = 'pending'
                            AND direction = 'income'
                            AND due_date < (
                                CURRENT_TIMESTAMP
                                AT TIME ZONE {timezone}
                            )::date
                    ) AS overdue_income,

                    COUNT(*)
                    FILTER (
                        WHERE
                            status = 'pending'
                            AND direction = 'expense'
                            AND due_date < (
                                CURRENT_TIMESTAMP
                                AT TIME ZONE {timezone}
                            )::date
                    ) AS overdue_expenses,

                    COUNT(*)
                    FILTER (
                        WHERE status = 'paid'
                    ) AS paid_transaction_count,

                    COUNT(*)
                    FILTER (
                        WHERE status = 'pending'
                    ) AS pending_transaction_count

                FROM period_transactions
                "#
    ))
    .one(db)
    .await?
    .ok_or(AppError::Internal)?;

    Ok(row)
}

async fn load_global_balance(
    db: &DatabaseTransaction,
    auth: &AuthUser,
) -> Result<GlobalBalanceRow, AppError> {
    let user_id = auth.id;
    let row = GlobalBalanceRow::find_by_statement(raw_sql!(
        Postgres,
        r#"
            SELECT COALESCE(
                SUM(
                    CASE
                        WHEN direction = 'income' THEN actual_amount
                        ELSE -actual_amount
                    END
                ) FILTER (WHERE status = 'paid'),
                0
            ) AS global_balance,
            COALESCE(SUM(expected_amount) FILTER (
                WHERE status = 'pending' AND direction = 'income'
            ), 0) AS pending_income,
            COALESCE(SUM(expected_amount) FILTER (
                WHERE status = 'pending' AND direction = 'expense'
            ), 0) AS pending_expenses,
            COUNT(*) FILTER (
                WHERE status = 'pending' AND expected_amount IS NULL
            ) AS pending_without_estimate
            FROM transactions
            WHERE user_id = {user_id}
        "#
    ))
    .one(db)
    .await?
    .ok_or(AppError::Internal)?;

    Ok(row)
}

fn build_summary(row: SummaryRow, global: GlobalBalanceRow) -> Result<DashboardSummary, AppError> {
    let real_balance = row.income_received - row.expenses_paid;

    let projected_income = row.income_received + row.pending_income;

    let projected_expenses = row.expenses_paid + row.pending_expenses;

    let projected_balance = projected_income - projected_expenses;

    let projection_complete =
        row.pending_income_without_estimate == 0 && row.pending_expenses_without_estimate == 0;

    let actual_savings_rate_percent = savings_rate(real_balance, row.income_received);

    let projected_savings_rate_percent = if projection_complete {
        savings_rate(projected_balance, projected_income)
    } else {
        None
    };

    Ok(DashboardSummary {
        global_balance: global.global_balance,

        global_projected_balance: global.global_balance + global.pending_income
            - global.pending_expenses,

        global_projection_complete: global.pending_without_estimate == 0,

        income_received: row.income_received,

        expenses_paid: row.expenses_paid,

        real_balance,

        pending_income: row.pending_income,

        pending_expenses: row.pending_expenses,

        projected_income,

        projected_expenses,

        projected_balance,

        actual_savings_rate_percent,

        projected_savings_rate_percent,

        projection_complete,

        pending_income_without_estimate: count_to_u64(row.pending_income_without_estimate)?,

        pending_expenses_without_estimate: count_to_u64(row.pending_expenses_without_estimate)?,

        overdue_income: count_to_u64(row.overdue_income)?,

        overdue_expenses: count_to_u64(row.overdue_expenses)?,

        paid_transaction_count: count_to_u64(row.paid_transaction_count)?,

        pending_transaction_count: count_to_u64(row.pending_transaction_count)?,
    })
}

fn savings_rate(balance: Decimal, income: Decimal) -> Option<Decimal> {
    if income <= Decimal::ZERO {
        return None;
    }

    Some((balance / income * Decimal::from(100)).round_dp(2))
}

async fn load_categories(
    db: &DatabaseTransaction,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
    expenses_paid: Decimal,
) -> Result<Vec<CategorySpending>, AppError> {
    let user_id = auth.id;

    let range_start = start.first_day();

    let range_end = end.next()?.first_day();

    let timezone = auth.timezone.clone();

    let rows = CategoryRow::find_by_statement(raw_sql!(
        Postgres,
        r#"
                WITH period_transactions AS (
                    SELECT t.*
                    FROM transactions t
                    WHERE
                        t.user_id = {user_id}
                        AND (
                            (
                                t.recurring_rule_id IS NOT NULL
                                AND t.recurrence_period >= {range_start}
                                AND t.recurrence_period < {range_end}
                            )
                            OR
                            (
                                t.recurring_rule_id IS NULL
                                AND (
                                    (
                                        t.due_date IS NULL
                                        AND t.occurred_at >= (
                                            {range_start}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                        AND t.occurred_at < (
                                            {range_end}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                    )
                                    OR
                                    (
                                        t.due_date IS NOT NULL
                                        AND t.due_date >= {range_start}
                                        AND t.due_date < {range_end}
                                    )
                                )
                            )
                        )
                )
                SELECT
                    c.id AS category_id,
                    c.name AS category_name,
                    c.icon AS category_icon,
                    c.color AS category_color,

                    COALESCE(
                        SUM(pt.actual_amount)
                        FILTER (
                            WHERE pt.status = 'paid'
                        ),
                        0
                    ) AS paid_amount,

                    COALESCE(
                        SUM(pt.expected_amount)
                        FILTER (
                            WHERE pt.status = 'pending'
                        ),
                        0
                    ) AS pending_amount,

                    COUNT(*)
                    FILTER (
                        WHERE pt.status = 'paid'
                    ) AS paid_count,

                    COUNT(*)
                    FILTER (
                        WHERE pt.status = 'pending'
                    ) AS pending_count,

                    COUNT(*)
                    FILTER (
                        WHERE
                            pt.status = 'pending'
                            AND pt.expected_amount IS NULL
                    ) AS pending_without_estimate

                FROM period_transactions pt

                JOIN categories c
                    ON c.id = pt.category_id

                WHERE
                    pt.direction = 'expense'
                    AND pt.status IN (
                        'paid',
                        'pending'
                    )

                GROUP BY
                    c.id,
                    c.name,
                    c.icon,
                    c.color

                ORDER BY
                    paid_amount DESC,
                    pending_amount DESC,
                    c.name ASC
                "#
    ))
    .all(db)
    .await?;

    rows.into_iter()
        .map(|row| {
            let share = if expenses_paid > Decimal::ZERO {
                (row.paid_amount / expenses_paid * Decimal::from(100)).round_dp(2)
            } else {
                Decimal::ZERO
            };

            Ok(CategorySpending {
                category: DashboardCategory {
                    id: row.category_id,

                    name: row.category_name,

                    icon: row.category_icon,

                    color: row.category_color,
                },

                paid_amount: row.paid_amount,

                pending_amount: row.pending_amount,

                projected_amount: row.paid_amount + row.pending_amount,

                paid_expense_share_percent: share,

                paid_count: count_to_u64(row.paid_count)?,

                pending_count: count_to_u64(row.pending_count)?,

                pending_without_estimate: count_to_u64(row.pending_without_estimate)?,
            })
        })
        .collect()
}

async fn load_pending(
    db: &DatabaseTransaction,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
) -> Result<Vec<PendingItem>, AppError> {
    let user_id = auth.id;

    let range_start = start.first_day();

    let range_end = end.next()?.first_day();

    let timezone = auth.timezone.clone();

    let rows = PendingRow::find_by_statement(raw_sql!(
        Postgres,
        r#"
                WITH period_transactions AS (
                    SELECT t.*
                    FROM transactions t
                    WHERE
                        t.user_id = {user_id}
                        AND (
                            (
                                t.recurring_rule_id IS NOT NULL
                                AND t.recurrence_period >= {range_start}
                                AND t.recurrence_period < {range_end}
                            )
                            OR
                            (
                                t.recurring_rule_id IS NULL
                                AND (
                                    (
                                        t.due_date IS NULL
                                        AND t.occurred_at >= (
                                            {range_start}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                        AND t.occurred_at < (
                                            {range_end}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                    )
                                    OR
                                    (
                                        t.due_date IS NOT NULL
                                        AND t.due_date >= {range_start}
                                        AND t.due_date < {range_end}
                                    )
                                )
                            )
                        )
                )
                SELECT
                    pt.id,
                    pt.recurring_rule_id,

                    c.id AS category_id,
                    c.name AS category_name,
                    c.icon AS category_icon,
                    c.color AS category_color,

                    pt.direction,
                    pt.description,
                    pt.expected_amount,
                    pt.due_date,

                    COALESCE(
                        pt.due_date < (
                            CURRENT_TIMESTAMP
                            AT TIME ZONE {timezone}
                        )::date,
                        FALSE
                    ) AS overdue

                FROM period_transactions pt

                JOIN categories c
                    ON c.id = pt.category_id

                WHERE pt.status = 'pending'

                ORDER BY
                    CASE
                        WHEN pt.due_date < (
                            CURRENT_TIMESTAMP
                            AT TIME ZONE {timezone}
                        )::date
                        THEN 0
                        ELSE 1
                    END,

                    pt.due_date ASC
                        NULLS LAST,

                    pt.description ASC

                LIMIT 12
                "#
    ))
    .all(db)
    .await?;

    rows.into_iter().map(pending_response).collect()
}

fn pending_response(row: PendingRow) -> Result<PendingItem, AppError> {
    Ok(PendingItem {
        id: row.id,

        recurring_rule_id: row.recurring_rule_id,

        category: DashboardCategory {
            id: row.category_id,

            name: row.category_name,

            icon: row.category_icon,

            color: row.category_color,
        },

        direction: TransactionDirection::try_from(row.direction.as_str())?,

        description: row.description,

        expected_amount: row.expected_amount,

        due_date: row.due_date.map(format_date).transpose()?,

        overdue: row.overdue,
    })
}

async fn load_activity(
    db: &DatabaseTransaction,
    auth: &AuthUser,
    start: &MonthPeriod,
    end: &MonthPeriod,
) -> Result<Vec<ActivityItem>, AppError> {
    let user_id = auth.id;

    let range_start = start.first_day();

    let range_end = end.next()?.first_day();

    let timezone = auth.timezone.clone();

    let rows = ActivityRow::find_by_statement(raw_sql!(
        Postgres,
        r#"
                WITH period_transactions AS (
                    SELECT t.*
                    FROM transactions t
                    WHERE
                        t.user_id = {user_id}
                        AND (
                            (
                                t.recurring_rule_id IS NOT NULL
                                AND t.recurrence_period >= {range_start}
                                AND t.recurrence_period < {range_end}
                            )
                            OR
                            (
                                t.recurring_rule_id IS NULL
                                AND (
                                    (
                                        t.due_date IS NULL
                                        AND t.occurred_at >= (
                                            {range_start}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                        AND t.occurred_at < (
                                            {range_end}::date::timestamp
                                            AT TIME ZONE {timezone}
                                        )
                                    )
                                    OR
                                    (
                                        t.due_date IS NOT NULL
                                        AND t.due_date >= {range_start}
                                        AND t.due_date < {range_end}
                                    )
                                )
                            )
                        )
                )
                SELECT
                    pt.id,

                    c.id AS category_id,
                    c.name AS category_name,
                    c.icon AS category_icon,
                    c.color AS category_color,

                    pt.direction,
                    pt.description,

                    pt.actual_amount AS amount,
                    pt.occurred_at,

                    (
                        pt.recurring_rule_id
                        IS NOT NULL
                    ) AS recurring

                FROM period_transactions pt

                JOIN categories c
                    ON c.id = pt.category_id

                WHERE pt.status = 'paid'

                ORDER BY
                    pt.occurred_at DESC,
                    pt.created_at DESC

                LIMIT 8
                "#
    ))
    .all(db)
    .await?;

    rows.into_iter().map(activity_response).collect()
}

fn activity_response(row: ActivityRow) -> Result<ActivityItem, AppError> {
    Ok(ActivityItem {
        id: row.id,

        category: DashboardCategory {
            id: row.category_id,

            name: row.category_name,

            icon: row.category_icon,

            color: row.category_color,
        },

        direction: TransactionDirection::try_from(row.direction.as_str())?,

        description: row.description,

        amount: row.amount,

        occurred_at: format_datetime(row.occurred_at)?,

        recurring: row.recurring,
    })
}

fn format_date(value: Date) -> Result<String, AppError> {
    value.format(&Iso8601::DATE).map_err(|_| AppError::Internal)
}

fn format_datetime(value: OffsetDateTime) -> Result<String, AppError> {
    value.format(&Rfc3339).map_err(|_| AppError::Internal)
}

fn count_to_u64(value: i64) -> Result<u64, AppError> {
    u64::try_from(value).map_err(|_| AppError::Internal)
}
