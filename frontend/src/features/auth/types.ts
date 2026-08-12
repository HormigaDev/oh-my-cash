export type AuthStatus = "unknown" | "authenticated" | "anonymous";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string | null;
  currency: string;
  timezone: string;
  locale: string;
  theme: ThemeName;
  themeMode: ThemeMode;
  role: UserRole;
}

export type UserRole = "admin" | "user";

export type ThemeName =
  | "aurora"
  | "ocean"
  | "royal"
  | "orchid"
  | "rose"
  | "sunset"
  | "forest"
  | "graphite"
  | "coral"
  | "nord"
  | "contrast-light"
  | "contrast-dark";

export type ThemeMode = "system" | "light" | "dark";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionResponse {
  user: AuthUser | null;
}
