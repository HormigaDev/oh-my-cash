import type { CategoryColor, CategoryKind } from "./types";

export const defaultCategoryIcon = "category";
export const defaultCategoryColor: CategoryColor = "teal";

export const categoryIconOptions = [
  "category",
  "restaurant",
  "home",
  "directions_car",
  "shopping_bag",
  "health_and_safety",
  "school",
  "movie",
  "payments",
  "savings",
  "work"
] as const;

export const categoryKindOptions: ReadonlyArray<{
  value: CategoryKind;
  labelKey:
    | "categories.kind.expense"
    | "categories.kind.income"
    | "categories.kind.both";
}> = [
  { value: "expense", labelKey: "categories.kind.expense" },
  { value: "income", labelKey: "categories.kind.income" },
  { value: "both", labelKey: "categories.kind.both" }
];

export const categoryColorOptions: ReadonlyArray<{
  value: CategoryColor;
  labelKey:
    | "categories.colors.teal"
    | "categories.colors.emerald"
    | "categories.colors.cyan"
    | "categories.colors.blue"
    | "categories.colors.indigo"
    | "categories.colors.violet"
    | "categories.colors.amber"
    | "categories.colors.rose";
}> = [
  { value: "teal", labelKey: "categories.colors.teal" },
  { value: "emerald", labelKey: "categories.colors.emerald" },
  { value: "cyan", labelKey: "categories.colors.cyan" },
  { value: "blue", labelKey: "categories.colors.blue" },
  { value: "indigo", labelKey: "categories.colors.indigo" },
  { value: "violet", labelKey: "categories.colors.violet" },
  { value: "amber", labelKey: "categories.colors.amber" },
  { value: "rose", labelKey: "categories.colors.rose" }
];
