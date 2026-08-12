import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import type {
  RecurringAmount,
  RecurringRule,
  RecurringRuleInput,
  TransactionDirection
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDirection(value: unknown): value is TransactionDirection {
  return value === "income" || value === "expense";
}

function isDecimalString(value: unknown): value is string {
  return typeof value === "string" && /^\d+(?:\.\d+)?$/u.test(value);
}

function isNullableDecimal(value: unknown): value is string | null {
  return value === null || isDecimalString(value);
}

function isDateString(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/u.test(value);
}

function parseAmount(value: unknown): RecurringAmount {
  if (!isRecord(value)) {
    throw invalidResponse();
  }

  if (value.mode === "fixed" && isDecimalString(value.amount)) {
    return { mode: "fixed", amount: value.amount };
  }

  if (
    value.mode === "variable" &&
    isNullableDecimal(value.estimated) &&
    isNullableDecimal(value.min) &&
    isNullableDecimal(value.max)
  ) {
    return {
      mode: "variable",
      estimated: value.estimated,
      min: value.min,
      max: value.max
    };
  }

  throw invalidResponse();
}

function invalidResponse() {
  return new ApiError(
    200,
    "INVALID_RESPONSE",
    "The server returned an invalid recurring rule"
  );
}

function parseRecurringRule(value: unknown): RecurringRule {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.category_id !== "string" ||
    typeof value.name !== "string" ||
    !isDirection(value.direction) ||
    value.frequency !== "monthly" ||
    typeof value.day_of_month !== "number" ||
    !Number.isInteger(value.day_of_month) ||
    value.day_of_month < 1 ||
    value.day_of_month > 31 ||
    !isDateString(value.starts_on) ||
    (value.ends_on !== null && !isDateString(value.ends_on)) ||
    (value.notes !== null && typeof value.notes !== "string")
  ) {
    throw invalidResponse();
  }

  return {
    id: value.id,
    categoryId: value.category_id,
    name: value.name,
    direction: value.direction,
    amount: parseAmount(value.amount),
    frequency: value.frequency,
    dayOfMonth: value.day_of_month,
    startsOn: value.starts_on,
    endsOn: value.ends_on,
    notes: value.notes
  };
}

function requestBody(input: RecurringRuleInput) {
  return {
    category_id: input.categoryId,
    name: input.name,
    direction: input.direction,
    amount: input.amount,
    day_of_month: input.dayOfMonth,
    starts_on: input.startsOn,
    ends_on: input.endsOn,
    notes: input.notes
  };
}

export async function listRecurringRules(): Promise<RecurringRule[]> {
  const response = await apiRequest("/recurring-rules");

  if (!Array.isArray(response)) {
    throw invalidResponse();
  }

  return response.map(parseRecurringRule);
}

export async function createRecurringRule(
  input: RecurringRuleInput
): Promise<RecurringRule> {
  return parseRecurringRule(
    await apiRequest("/recurring-rules", {
      method: "POST",
      body: requestBody(input)
    })
  );
}

export async function updateRecurringRule(
  id: string,
  input: RecurringRuleInput
): Promise<RecurringRule> {
  return parseRecurringRule(
    await apiRequest(`/recurring-rules/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: requestBody(input)
    })
  );
}

export async function deactivateRecurringRule(id: string): Promise<void> {
  await apiRequest(`/recurring-rules/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
