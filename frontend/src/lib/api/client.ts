import { ApiError, isApiErrorBody } from "./errors";

const apiPrefix = "/api/v1";

interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (text.length === 0) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(text);
    return parsed;
  } catch {
    throw new ApiError(
      response.status,
      "INVALID_RESPONSE",
      "The server returned invalid JSON"
    );
  }
}

export async function apiRequest(
  path: `/${string}`,
  options: ApiRequestOptions = {}
): Promise<unknown> {
  const headers = new Headers({ Accept: "application/json" });
  const request: RequestInit = {
    method: options.method ?? "GET",
    credentials: "include",
    headers
  };

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
    request.body = JSON.stringify(options.body);
  }

  if (options.signal !== undefined) {
    request.signal = options.signal;
  }

  let response: Response;

  try {
    response = await fetch(`${apiPrefix}${path}`, request);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error";
    throw new ApiError(0, "NETWORK_ERROR", message);
  }

  const body = await parseResponseBody(response);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiError(response.status, body.error.code, body.error.message);
    }

    throw new ApiError(response.status, "HTTP_ERROR", response.statusText);
  }

  return body;
}
