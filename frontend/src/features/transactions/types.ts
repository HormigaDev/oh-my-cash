import type { TransactionDirection } from "@/features/recurring/types";

export type TransactionStatus = "pending" | "paid" | "skipped" | "cancelled";

export interface Transaction {
  id: string;
  categoryId: string;
  recurringRuleId: string | null;
  clientOperationId: string | null;
  direction: TransactionDirection;
  status: TransactionStatus;
  description: string;
  notes: string | null;
  expectedAmount: string | null;
  actualAmount: string | null;
  dueDate: string | null;
  recurrencePeriod: string | null;
  occurredAt: string | null;
  paidAt: string | null;
}

export interface ManualTransactionInput {
  categoryId: string;
  direction: TransactionDirection;
  description: string;
  amount: string;
  occurredAt: string;
  notes: string;
}

export interface CreateTransactionInput extends ManualTransactionInput {
  clientOperationId: string;
}

export interface PayTransactionInput {
  amount: string;
  occurredAt: string;
}
