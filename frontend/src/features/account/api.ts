import { parseUser } from "@/features/auth/api";
import { apiRequest } from "@/lib/api/client";

import type { AppearanceInput, PasswordInput, ProfileInput } from "./types";

export async function updateProfile(input: ProfileInput) {
  return parseUser(
    await apiRequest("/account/profile", {
      method: "PUT",
      body: {
        email: input.email,
        display_name: input.displayName,
        currency: input.currency,
        timezone: input.timezone,
        locale: input.locale
      }
    })
  );
}

export async function updateAppearance(input: AppearanceInput) {
  return parseUser(
    await apiRequest("/account/appearance", {
      method: "PUT",
      body: { theme: input.theme, theme_mode: input.themeMode }
    })
  );
}

export async function changePassword(input: PasswordInput) {
  return parseUser(
    await apiRequest("/account/password", {
      method: "PATCH",
      body: {
        current_password: input.currentPassword,
        new_password: input.newPassword
      }
    })
  );
}
