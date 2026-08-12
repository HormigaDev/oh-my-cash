import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import {
  categoryColors,
  categoryKinds,
  type Category,
  type CategoryColor,
  type CategoryInput,
  type CategoryKind
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isCategoryKind(value: unknown): value is CategoryKind {
  return (
    typeof value === "string" && categoryKinds.some(kind => kind === value)
  );
}

function isCategoryColor(value: unknown): value is CategoryColor {
  return (
    typeof value === "string" && categoryColors.some(color => color === value)
  );
}

function parseCategory(value: unknown): Category {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    !isCategoryKind(value.kind) ||
    (value.icon !== null && typeof value.icon !== "string") ||
    (value.color !== null && !isCategoryColor(value.color))
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "The server returned an invalid category"
    );
  }

  return {
    id: value.id,
    name: value.name,
    kind: value.kind,
    icon: value.icon,
    color: value.color
  };
}

export async function listCategories(): Promise<Category[]> {
  const response = await apiRequest("/categories");

  if (!Array.isArray(response)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "The server returned an invalid category list"
    );
  }

  return response.map(parseCategory);
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  return parseCategory(
    await apiRequest("/categories", { method: "POST", body: input })
  );
}

export async function updateCategory(
  id: string,
  input: CategoryInput
): Promise<Category> {
  return parseCategory(
    await apiRequest(`/categories/${encodeURIComponent(id)}`, {
      method: "PATCH",
      body: input
    })
  );
}

export async function archiveCategory(id: string): Promise<void> {
  await apiRequest(`/categories/${encodeURIComponent(id)}`, {
    method: "DELETE"
  });
}
