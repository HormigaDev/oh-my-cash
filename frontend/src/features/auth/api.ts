import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";

import type {
  AuthUser,
  LoginCredentials,
  SessionResponse,
  ThemeMode,
  ThemeName
} from "./types";

const themes: ThemeName[] = [
  "aurora",
  "ocean",
  "royal",
  "orchid",
  "rose",
  "sunset",
  "forest",
  "graphite",
  "coral",
  "nord",
  "contrast-light",
  "contrast-dark"
];
const themeModes: ThemeMode[] = ["system", "light", "dark"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseUser(value: unknown): AuthUser {
  if (
    !isRecord(value) ||
    typeof value.id !== "string" ||
    typeof value.email !== "string" ||
    (value.display_name !== null && typeof value.display_name !== "string") ||
    typeof value.currency !== "string" ||
    typeof value.timezone !== "string" ||
    typeof value.locale !== "string" ||
    !themes.includes(value.theme as ThemeName) ||
    !themeModes.includes(value.theme_mode as ThemeMode)
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
    currency: value.currency,
    timezone: value.timezone,
    locale: value.locale,
    theme: value.theme as ThemeName,
    themeMode: value.theme_mode as ThemeMode
  };
}

export { parseUser };

function parseSessionResponse(value: unknown): SessionResponse {
  if (!isRecord(value) || !("user" in value)) {
    throw new ApiError(
      200,
      "INVALID_RESPONSE",
      "The server returned an invalid session"
    );
  }

  return {
    user: value.user === null ? null : parseUser(value.user)
  };
}

export async function fetchSession(): Promise<SessionResponse> {
  return parseSessionResponse(await apiRequest("/auth/session"));
}

export async function createSession(
  credentials: LoginCredentials
): Promise<SessionResponse> {
  return parseSessionResponse(
    await apiRequest("/auth/login", {
      method: "POST",
      body: credentials
    })
  );
}

export async function destroySession(): Promise<SessionResponse> {
  return parseSessionResponse(
    await apiRequest("/auth/logout", { method: "POST" })
  );
}
