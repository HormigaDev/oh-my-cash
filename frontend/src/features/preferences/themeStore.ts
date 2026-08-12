import { defineStore } from "pinia";
import { Dark } from "quasar";
import { computed, ref } from "vue";

export type ThemePreference = "light" | "dark" | "system";

const storageKey = "omc.theme";
const systemThemeQuery = "(prefers-color-scheme: dark)";

function isThemePreference(value: string | null): value is ThemePreference {
  return value === "light" || value === "dark" || value === "system";
}

function storedPreference(): ThemePreference {
  const value = localStorage.getItem(storageKey);
  return isThemePreference(value) ? value : "system";
}

export const useThemeStore = defineStore("theme", () => {
  const preference = ref<ThemePreference>("system");
  const initialized = ref(false);
  let mediaQuery: MediaQueryList | null = null;

  const isDark = computed(() => Dark.isActive);

  function applyPreference() {
    const dark =
      preference.value === "dark" ||
      (preference.value === "system" && mediaQuery?.matches === true);

    document.documentElement.dataset.omcTheme = dark ? "dark" : "light";
    Dark.set(dark);
  }

  function handleSystemThemeChange() {
    if (preference.value === "system") {
      applyPreference();
    }
  }

  function initialize() {
    if (initialized.value) {
      return;
    }

    mediaQuery = window.matchMedia(systemThemeQuery);
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    preference.value = storedPreference();
    applyPreference();
    initialized.value = true;
  }

  function setPreference(value: ThemePreference) {
    preference.value = value;
    localStorage.setItem(storageKey, value);
    applyPreference();
  }

  return { preference, isDark, initialize, setPreference };
});
