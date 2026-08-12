import { defineStore } from "pinia";
import { Dark } from "quasar";
import { computed, ref } from "vue";

import { updateAppearance } from "@/features/account/api";
import { useAuthStore } from "@/features/auth/authStore";
import type { ThemeMode, ThemeName } from "@/features/auth/types";

const themeStorageKey = "omc.theme.name";
const modeStorageKey = "omc.theme.mode";
const systemThemeQuery = "(prefers-color-scheme: dark)";

export const themeNames: readonly ThemeName[] = [
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
export const themeModes: readonly ThemeMode[] = ["system", "light", "dark"];

function storedTheme(): ThemeName {
  const value = localStorage.getItem(themeStorageKey) as ThemeName | null;
  return value !== null && themeNames.includes(value) ? value : "aurora";
}

function storedMode(): ThemeMode {
  const value = localStorage.getItem(modeStorageKey) as ThemeMode | null;
  return value !== null && themeModes.includes(value) ? value : "system";
}

export const useThemeStore = defineStore("theme", () => {
  const auth = useAuthStore();
  const theme = ref<ThemeName>("aurora");
  const preference = ref<ThemeMode>("system");
  const initialized = ref(false);
  const persistenceStatus = ref<"idle" | "saving" | "saved" | "error">("idle");
  let mediaQuery: MediaQueryList | null = null;
  let persistenceTimer: ReturnType<typeof setTimeout> | null = null;
  let persistenceRevision = 0;
  let persistenceQueue: Promise<void> = Promise.resolve();

  const isDark = computed(() => Dark.isActive);
  const isHighContrast = computed(() => theme.value.startsWith("contrast-"));

  function applyPreference() {
    const dark =
      theme.value === "contrast-dark" ||
      (theme.value !== "contrast-light" &&
        (preference.value === "dark" ||
          (preference.value === "system" && mediaQuery?.matches === true)));

    document.documentElement.dataset.omcPalette = theme.value;
    document.documentElement.dataset.omcMode = dark ? "dark" : "light";
    Dark.set(dark);
  }

  function cache() {
    localStorage.setItem(themeStorageKey, theme.value);
    localStorage.setItem(modeStorageKey, preference.value);
  }

  function persist() {
    if (!auth.isAuthenticated) return;
    if (persistenceTimer !== null) clearTimeout(persistenceTimer);

    const revision = ++persistenceRevision;
    const appearance = { theme: theme.value, themeMode: preference.value };
    persistenceStatus.value = "saving";
    persistenceTimer = setTimeout(() => {
      persistenceTimer = null;
      persistenceQueue = persistenceQueue.then(async () => {
        try {
          const user = await updateAppearance(appearance);
          if (revision !== persistenceRevision) return;
          auth.setUser(user);
          persistenceStatus.value = "saved";
        } catch {
          if (revision === persistenceRevision) {
            persistenceStatus.value = "error";
          }
        }
      });
    }, 250);
  }

  function handleSystemThemeChange() {
    if (preference.value === "system") applyPreference();
  }

  function initialize() {
    if (initialized.value) return;
    mediaQuery = window.matchMedia(systemThemeQuery);
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    theme.value = storedTheme();
    preference.value = storedMode();
    applyPreference();
    initialized.value = true;
  }

  function hydrate(name: ThemeName, mode: ThemeMode) {
    theme.value = name;
    preference.value = mode;
    cache();
    applyPreference();
    persistenceStatus.value = "idle";
  }

  function setPreference(value: ThemeMode) {
    preference.value = value;
    cache();
    applyPreference();
    persist();
  }

  function setTheme(value: ThemeName) {
    theme.value = value;
    cache();
    applyPreference();
    persist();
  }

  return {
    theme,
    preference,
    isDark,
    isHighContrast,
    persistenceStatus,
    initialize,
    hydrate,
    setPreference,
    setTheme
  };
});
