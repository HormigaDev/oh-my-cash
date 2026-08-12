import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import type {
  CreateTransactionInput,
  ManualTransactionInput,
  PayTransactionInput,
  Transaction,
  TransactionStatus
} from "./types";
import type { TransactionDirection } from "@/features/recurring/types";
import { isValidMonth } from "./month";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDirection(value: unknown): value is TransactionDirection {
  return value === "income" || value === "expense";
}

function isStatus(value: unknown): value is TransactionStatus {
  return (
    value === "pending" ||
    value === "paid" ||
    value === "skipped" ||
    value === "cancelled"
  );
}

function isDecimal(value: unknown): value is string {
  return typeof value === "string" && /^\d+(?:\.\d+)?$/u.test(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function isNullableDecimal(value: unknown): value is string | null {
  return value === null || isDecimal(value);
}

function invalidResponse() {
  return new ApiError(
    200,
    "INVALID_RESPONSE",
    "The server returned an invalid transaction"
  );
}

function parseTransaction(value: unknown): Transaction {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.category_id !== "string" ||
    !isNullableString(value.recurring_rule_id) ||
    !isNullableString(value.client_operation_id) ||
    !isDirection(value.direction) ||
    !isStatus(value.status) ||
    typeof value.description !== "string" ||
    !isNullableString(value.notes) ||
    !isNullableDecimal(value.expected_amount) ||
    !isNullableDecimal(value.actual_amount) ||
    !isNullableString(value.due_date) ||
    !isNullableString(value.recurrence_period) ||
    !isNullableString(value.occurred_at) ||
    !isNullableString(value.paid_at)
  ) {
    throw invalidResponse();
  }

  return {
    id: value.id,
    categoryId: value.category_id,
    recurringRuleId: value.recurring_rule_id,
    clientOperationId: value.client_operation_id,
    direction: value.direction,
    status: value.status,
    description: value.description,
    notes: value.notes,
    expectedAmount: value.expected_amount,
    actualAmount: value.actual_amount,
    dueDate: value.due_date,
    recurrencePeriod: value.recurrence_period,
    occurredAt: value.occurred_at,
    paidAt: value.paid_at
  };
}

function manualBody(input: ManualTransactionInput) {
  return {
    category_id: input.categoryId,
    direction: input.direction,
    description: input.description,
    amount: input.amount,
    occurred_at: input.occurredAt,
    notes: input.notes
  };
}

export async function listTransactions(month: string) {
  if (!isValidMonth(month)) {
    throw new ApiError(400, "BAD_REQUEST", "Invalid transaction month");
  }

  const response = await apiRequest(
    `/transactions?${new URLSearchParams({ month }).toString()}`
  );

  if (!Array.isArray(response)) {
    throw invalidResponse();
  }

  return response.map(parseTransaction);
}

export async function createTransaction(input: CreateTransactionInput) {
  const response = await apiRequest("/transactions", {
    method: "POST",
    body: {
      client_operation_id: input.clientOperationId,
      ...manualBody(input)
    }
  });

  return parseTransaction(response);
}

export async function updateTransaction(
  id: string,
  input: ManualTransactionInput
) {
  const response = await apiRequest(`/transactions/${id}`, {
    method: "PATCH",
    body: manualBody(input)
  });

  return parseTransaction(response);
}

export async function payTransaction(id: string, input: PayTransactionInput) {
  const response = await apiRequest(`/transactions/${id}/pay`, {
    method: "POST",
    body: {
      amount: input.amount,
      occurred_at: input.occurredAt
    }
  });

  return parseTransaction(response);
}

async function transitionTransaction(id: string, action: "skip" | "cancel") {
  const response = await apiRequest(`/transactions/${id}/${action}`, {
    method: "POST"
  });

  return parseTransaction(response);
}

export function skipTransaction(id: string) {
  return transitionTransaction(id, "skip");
}

export function cancelTransaction(id: string) {
  return transitionTransaction(id, "cancel");
}
