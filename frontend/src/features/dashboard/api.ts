import {
  categoryColors,
  type CategoryColor
} from "@/features/categories/types";
import { isValidMonth } from "@/features/transactions/month";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import type {
  CategorySpending,
  Dashboard,
  DashboardActivityItem,
  DashboardCategory,
  DashboardPendingItem,
  DashboardSummary
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function invalidResponse(): never {
  throw new ApiError(
    200,
    "INVALID_RESPONSE",
    "The server returned an invalid dashboard"
  );
}

function string(value: unknown) {
  if (typeof value !== "string") invalidResponse();
  return value;
}

function nullableString(value: unknown) {
  if (value !== null && typeof value !== "string") invalidResponse();
  return value;
}

function decimal(value: unknown) {
  const result = string(value);
  if (!/^-?\d+(?:\.\d+)?$/u.test(result)) invalidResponse();
  return result;
}

function nullableDecimal(value: unknown) {
  return value === null ? null : decimal(value);
}

function count(value: unknown) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    invalidResponse();
  return value;
}

function boolean(value: unknown) {
  if (typeof value !== "boolean") invalidResponse();
  return value;
}

function categoryColor(value: unknown): CategoryColor | null {
  if (value === null) return null;
  if (
    typeof value !== "string" ||
    !categoryColors.includes(value as CategoryColor)
  )
    invalidResponse();
  return value as CategoryColor;
}

function direction(value: unknown) {
  if (value !== "income" && value !== "expense") invalidResponse();
  return value;
}

function category(value: unknown): DashboardCategory {
  if (!isRecord(value)) invalidResponse();
  return {
    id: string(value.id),
    name: string(value.name),
    icon: nullableString(value.icon),
    color: categoryColor(value.color)
  };
}

function summary(value: unknown): DashboardSummary {
  if (!isRecord(value)) invalidResponse();
  return {
    globalBalance: decimal(value.global_balance),
    incomeReceived: decimal(value.income_received),
    expensesPaid: decimal(value.expenses_paid),
    realBalance: decimal(value.real_balance),
    pendingIncome: decimal(value.pending_income),
    pendingExpenses: decimal(value.pending_expenses),
    projectedIncome: decimal(value.projected_income),
    projectedExpenses: decimal(value.projected_expenses),
    projectedBalance: decimal(value.projected_balance),
    actualSavingsRatePercent: nullableDecimal(
      value.actual_savings_rate_percent
    ),
    projectedSavingsRatePercent: nullableDecimal(
      value.projected_savings_rate_percent
    ),
    projectionComplete: boolean(value.projection_complete),
    pendingIncomeWithoutEstimate: count(value.pending_income_without_estimate),
    pendingExpensesWithoutEstimate: count(
      value.pending_expenses_without_estimate
    ),
    overdueIncome: count(value.overdue_income),
    overdueExpenses: count(value.overdue_expenses),
    paidTransactionCount: count(value.paid_transaction_count),
    pendingTransactionCount: count(value.pending_transaction_count)
  };
}

function spending(value: unknown): CategorySpending {
  if (!isRecord(value)) invalidResponse();
  return {
    category: category(value.category),
    paidAmount: decimal(value.paid_amount),
    pendingAmount: decimal(value.pending_amount),
    projectedAmount: decimal(value.projected_amount),
    paidExpenseSharePercent: decimal(value.paid_expense_share_percent),
    paidCount: count(value.paid_count),
    pendingCount: count(value.pending_count),
    pendingWithoutEstimate: count(value.pending_without_estimate)
  };
}

function pending(value: unknown): DashboardPendingItem {
  if (!isRecord(value)) invalidResponse();
  return {
    id: string(value.id),
    recurringRuleId: nullableString(value.recurring_rule_id),
    category: category(value.category),
    direction: direction(value.direction),
    description: string(value.description),
    expectedAmount: nullableDecimal(value.expected_amount),
    dueDate: nullableString(value.due_date),
    overdue: boolean(value.overdue)
  };
}

function activity(value: unknown): DashboardActivityItem {
  if (!isRecord(value)) invalidResponse();
  return {
    id: string(value.id),
    category: category(value.category),
    direction: direction(value.direction),
    description: string(value.description),
    amount: decimal(value.amount),
    occurredAt: string(value.occurred_at),
    recurring: boolean(value.recurring)
  };
}

function array<T>(value: unknown, parse: (item: unknown) => T) {
  if (!Array.isArray(value)) invalidResponse();
  return value.map(parse);
}

function parseDashboard(value: unknown): Dashboard {
  if (!isRecord(value)) invalidResponse();
  const month = string(value.month);
  if (!isValidMonth(month)) invalidResponse();
  const startMonth = string(value.start_month);
  const endMonth = string(value.end_month);
  if (
    !isValidMonth(startMonth) ||
    !isValidMonth(endMonth) ||
    startMonth > endMonth
  )
    invalidResponse();

  return {
    month,
    startMonth,
    endMonth,
    currency: string(value.currency),
    summary: summary(value.summary),
    spendingByCategory: array(value.spending_by_category, spending),
    pending: array(value.pending, pending),
    recentActivity: array(value.recent_activity, activity)
  };
}

export async function fetchDashboard(startMonth: string, endMonth: string) {
  if (
    !isValidMonth(startMonth) ||
    !isValidMonth(endMonth) ||
    startMonth > endMonth
  ) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid dashboard month");
  }

  const query = new URLSearchParams({
    start_month: startMonth,
    end_month: endMonth
  });
  return parseDashboard(await apiRequest(`/dashboard?${query.toString()}`));
}
