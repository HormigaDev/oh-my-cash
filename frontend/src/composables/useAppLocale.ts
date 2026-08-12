import { computed } from "vue";

import { useAuthStore } from "@/features/auth/authStore";
import { resolveAppLocale } from "@/i18n/locale";

export function useAppLocale() {
  const auth = useAuthStore();
  const locale = computed(() => resolveAppLocale(auth.user?.locale));

  return { locale };
}
