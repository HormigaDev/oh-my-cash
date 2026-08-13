import { ApiError } from "@/lib/api/errors";

export interface Page<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function parsePage<T>(
  value: unknown,
  parseItem: (item: unknown) => T
): Page<T> {
  if (
    typeof value !== "object" ||
    value === null ||
    !Array.isArray((value as Record<string, unknown>).items)
  )
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "The server returned an invalid page"
    );
  const row = value as Record<string, unknown>;
  for (const key of ["page", "per_page", "total", "total_pages"] as const) {
    if (
      typeof row[key] !== "number" ||
      !Number.isInteger(row[key]) ||
      row[key] < 0
    )
      throw new ApiError(
        200,
        "INVALID_RESPONSE",
        "The server returned invalid pagination"
      );
  }
  return {
    items: (row.items as unknown[]).map(parseItem),
    page: row.page as number,
    perPage: row.per_page as number,
    total: row.total as number,
    totalPages: row.total_pages as number
  };
}

export function paginationParams(page: number, perPage: number) {
  return { page: String(page), per_page: String(Math.min(100, perPage)) };
}
