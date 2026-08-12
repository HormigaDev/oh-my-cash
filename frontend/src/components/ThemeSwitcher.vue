<template>
  <q-btn
    flat
    round
    :icon="buttonIcon"
    :aria-label="ariaLabel"
    class="theme-switcher"
  >
    <q-menu anchor="bottom right" self="top right">
      <q-list class="theme-switcher__menu">
        <q-item-label header>{{ t("theme.title") }}</q-item-label>
        <q-item
          v-for="option in options"
          :key="option.value"
          v-close-popup
          clickable
          :active="theme.preference === option.value"
          active-class="theme-switcher__option--active"
          @click="theme.setPreference(option.value)"
        >
          <q-item-section avatar>
            <q-icon :name="option.icon" />
          </q-item-section>
          <q-item-section>{{ t(option.labelKey) }}</q-item-section>
          <q-item-section side>
            <q-icon
              v-if="theme.preference === option.value"
              name="check"
              color="primary"
            />
          </q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import {
  useThemeStore,
  type ThemePreference
} from "@/features/preferences/themeStore";

const theme = useThemeStore();
const { t } = useI18n();

const options: ReadonlyArray<{
  value: ThemePreference;
  icon: string;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
}> = [
  { value: "light", icon: "light_mode", labelKey: "theme.light" },
  { value: "dark", icon: "dark_mode", labelKey: "theme.dark" },
  { value: "system", icon: "devices", labelKey: "theme.system" }
];

const currentOption = computed(
  () => options.find(option => option.value === theme.preference) ?? options[2]
);
const buttonIcon = computed(() =>
  theme.preference === "system"
    ? "contrast"
    : theme.isDark
      ? "dark_mode"
      : "light_mode"
);
const ariaLabel = computed(() =>
  t("theme.current", {
    theme: currentOption.value ? t(currentOption.value.labelKey) : ""
  })
);
</script>

<style scoped lang="scss">
.theme-switcher {
  color: var(--omc-color-text-secondary);
}

.theme-switcher__menu {
  min-width: 12rem;
  padding: 0.5rem;
}

.theme-switcher__option--active {
  border-radius: var(--omc-radius-sm);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}
</style>
