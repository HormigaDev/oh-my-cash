import type { CategoryColor } from "@/features/categories/types";
import type { TransactionDirection } from "@/features/recurring/types";

export interface DashboardCategory {
  id: string;
  name: string;
  icon: string | null;
  color: CategoryColor | null;
}

export interface DashboardSummary {
  globalBalance: string;
  incomeReceived: string;
  expensesPaid: string;
  realBalance: string;
  pendingIncome: string;
  pendingExpenses: string;
  projectedIncome: string;
  projectedExpenses: string;
  projectedBalance: string;
  actualSavingsRatePercent: string | null;
  projectedSavingsRatePercent: string | null;
  projectionComplete: boolean;
  pendingIncomeWithoutEstimate: number;
  pendingExpensesWithoutEstimate: number;
  overdueIncome: number;
  overdueExpenses: number;
  paidTransactionCount: number;
  pendingTransactionCount: number;
}

export interface CategorySpending {
  category: DashboardCategory;
  paidAmount: string;
  pendingAmount: string;
  projectedAmount: string;
  paidExpenseSharePercent: string;
  paidCount: number;
  pendingCount: number;
  pendingWithoutEstimate: number;
}

export interface DashboardPendingItem {
  id: string;
  recurringRuleId: string | null;
  category: DashboardCategory;
  direction: TransactionDirection;
  description: string;
  expectedAmount: string | null;
  dueDate: string | null;
  overdue: boolean;
}

export interface DashboardActivityItem {
  id: string;
  category: DashboardCategory;
  direction: TransactionDirection;
  description: string;
  amount: string;
  occurredAt: string;
  recurring: boolean;
}

export interface Dashboard {
  month: string;
  startMonth: string;
  endMonth: string;
  currency: string;
  summary: DashboardSummary;
  spendingByCategory: CategorySpending[];
  pending: DashboardPendingItem[];
  recentActivity: DashboardActivityItem[];
}
