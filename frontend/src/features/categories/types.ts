export const categoryKinds = ["expense", "income", "both"] as const;
export type CategoryKind = (typeof categoryKinds)[number];

export const categoryColors = [
  "teal",
  "emerald",
  "cyan",
  "blue",
  "indigo",
  "violet",
  "amber",
  "rose"
] as const;
export type CategoryColor = (typeof categoryColors)[number];

export interface Category {
  id: string;
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: CategoryColor | null;
}

export interface CategoryInput {
  name: string;
  kind: CategoryKind;
  icon: string | null;
  color: CategoryColor | null;
}
