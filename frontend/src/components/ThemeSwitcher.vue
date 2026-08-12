<template>
  <q-btn-toggle
    v-if="expanded"
    :model-value="theme.preference"
    spread
    no-caps
    unelevated
    :disable="theme.isHighContrast"
    :options="expandedOptions"
    class="theme-switcher__expanded"
    @update:model-value="setPreference"
  />
  <q-btn
    v-else
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
          :disable="theme.isHighContrast"
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
        <q-item-label
          v-if="theme.isHighContrast"
          caption
          class="theme-switcher__hint"
        >
          {{ t("theme.contrastModeHint") }}
        </q-item-label>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import type { ThemeMode } from "@/features/auth/types";
import { useThemeStore } from "@/features/preferences/themeStore";

const theme = useThemeStore();
const { t } = useI18n();
withDefaults(defineProps<{ expanded?: boolean }>(), { expanded: false });

const options: ReadonlyArray<{
  value: ThemeMode;
  icon: string;
  labelKey: "theme.light" | "theme.dark" | "theme.system";
}> = [
  { value: "light", icon: "light_mode", labelKey: "theme.light" },
  { value: "dark", icon: "dark_mode", labelKey: "theme.dark" },
  { value: "system", icon: "devices", labelKey: "theme.system" }
];

const expandedOptions = computed(() =>
  options.map(option => ({
    value: option.value,
    icon: option.icon,
    label: t(option.labelKey)
  }))
);
const buttonIcon = computed(() =>
  theme.isHighContrast
    ? "visibility"
    : theme.preference === "system"
      ? "contrast"
      : theme.isDark
        ? "dark_mode"
        : "light_mode"
);
const ariaLabel = computed(() =>
  t("theme.current", {
    theme: t(`theme.names.${theme.theme}`)
  })
);

function setPreference(value: ThemeMode) {
  theme.setPreference(value);
}
</script>

<style scoped lang="scss">
.theme-switcher {
  color: var(--omc-color-text-secondary);
}

.theme-switcher__menu {
  min-width: 12rem;
  padding: 0.5rem;
}

.theme-switcher__hint {
  max-width: 15rem;
  padding: 0.6rem 1rem;
  line-height: 1.4;
}

.theme-switcher__option--active {
  border-radius: var(--omc-radius-sm);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.theme-switcher__expanded {
  width: 100%;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface-subtle);
  color: var(--omc-color-text-secondary);
}

.theme-switcher__expanded :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}
</style>
