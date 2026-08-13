import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { paginationParams, parsePage } from "@/lib/api/pagination";

import type { AdminUserInput, ManagedUser } from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUser(value: unknown): ManagedUser {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    (value.display_name !== null && typeof value.display_name !== "string") ||
    (value.role !== "admin" && value.role !== "user") ||
    typeof value.created_at !== "string"
  ) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "The server returned an invalid user"
    );
  }
  return {
    id: value.id,
    email: value.email,
    displayName: value.display_name,
    role: value.role,
    createdAt: value.created_at
  };
}

export async function fetchManagedUsers(page = 1, perPage = 25) {
  const response = await apiRequest(
    `/admin/users?${new URLSearchParams(paginationParams(page, perPage))}`
  );
  return parsePage(response, parseUser);
}

export async function createManagedUser(input: Required<AdminUserInput>) {
  return parseUser(
    await apiRequest("/admin/users", {
      method: "POST",
      body: {
        email: input.email,
        display_name: input.displayName,
        password: input.password,
        administrator_password: input.administratorPassword
      }
    })
  );
}

export async function updateManagedUser(id: string, input: AdminUserInput) {
  return parseUser(
    await apiRequest(`/admin/users/${id}`, {
      method: "PUT",
      body: {
        email: input.email,
        display_name: input.displayName,
        new_password: input.password,
        administrator_password: input.administratorPassword
      }
    })
  );
}

export async function deleteManagedUser(
  id: string,
  administratorPassword: string
) {
  await apiRequest(`/admin/users/${id}`, {
    method: "DELETE",
    body: { administrator_password: administratorPassword }
  });
}
