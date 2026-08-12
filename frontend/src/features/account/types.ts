import type { ThemeMode, ThemeName } from "@/features/auth/types";

export interface ProfileInput {
  email: string;
  displayName: string | null;
  currency: string;
  timezone: string;
  locale: string;
}

export interface PasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface AppearanceInput {
  theme: ThemeName;
  themeMode: ThemeMode;
}
