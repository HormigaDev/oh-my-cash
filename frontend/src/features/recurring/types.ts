export type TransactionDirection = "income" | "expense";
export type RecurringAmountMode = "fixed" | "variable";

export interface FixedRecurringAmount {
  mode: "fixed";
  amount: string;
}

export interface VariableRecurringAmount {
  mode: "variable";
  estimated: string | null;
  min: string | null;
  max: string | null;
}

export type RecurringAmount = FixedRecurringAmount | VariableRecurringAmount;

export interface RecurringRule {
  id: string;
  categoryId: string;
  name: string;
  direction: TransactionDirection;
  amount: RecurringAmount;
  frequency: "monthly";
  dayOfMonth: number;
  startsOn: string;
  endsOn: string | null;
  notes: string | null;
}

export interface RecurringRuleInput {
  categoryId: string;
  name: string;
  direction: TransactionDirection;
  amount: RecurringAmount;
  dayOfMonth: number;
  startsOn: string;
  endsOn: string | null;
  notes: string | null;
}
