export type AuthStatus = "unknown" | "authenticated" | "anonymous";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  currency: string;
  timezone: string;
  locale: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionResponse {
  user: AuthUser | null;
}
