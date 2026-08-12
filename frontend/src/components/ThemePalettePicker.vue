<template>
  <div
    class="theme-palette-picker"
    role="radiogroup"
    :aria-label="t('theme.palette')"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      class="theme-palette-picker__option"
      :class="[
        `theme-preview--${option.value}`,
        { 'theme-palette-picker__option--active': theme.theme === option.value }
      ]"
      role="radio"
      :aria-checked="theme.theme === option.value"
      @click="theme.setTheme(option.value)"
    >
      <span class="theme-palette-picker__preview" aria-hidden="true">
        <i /><i /><i />
      </span>
      <span>{{ t(option.labelKey) }}</span>
      <q-icon v-if="theme.theme === option.value" name="check_circle" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { ThemeName } from "@/features/auth/types";
import { useThemeStore } from "@/features/preferences/themeStore";

const theme = useThemeStore();
const { t } = useI18n();
const options: ReadonlyArray<{
  value: ThemeName;
  labelKey: `theme.names.${ThemeName}`;
}> = [
  { value: "aurora", labelKey: "theme.names.aurora" },
  { value: "ocean", labelKey: "theme.names.ocean" },
  { value: "royal", labelKey: "theme.names.royal" },
  { value: "orchid", labelKey: "theme.names.orchid" },
  { value: "rose", labelKey: "theme.names.rose" },
  { value: "sunset", labelKey: "theme.names.sunset" },
  { value: "forest", labelKey: "theme.names.forest" },
  { value: "graphite", labelKey: "theme.names.graphite" },
  { value: "coral", labelKey: "theme.names.coral" },
  { value: "nord", labelKey: "theme.names.nord" },
  { value: "contrast-light", labelKey: "theme.names.contrast-light" },
  { value: "contrast-dark", labelKey: "theme.names.contrast-dark" }
];
</script>

<style scoped lang="scss">
.theme-palette-picker {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.6rem;
}
.theme-palette-picker__option {
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.6rem;
  min-width: 0;
  padding: 0.65rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface);
  color: var(--omc-color-text-secondary);
  font: inherit;
  font-size: 0.76rem;
  font-weight: 650;
  text-align: left;
  cursor: pointer;
  transition: 150ms ease;
}
.theme-palette-picker__option:hover {
  border-color: var(--omc-color-primary);
  transform: translateY(-0.0625rem);
}
.theme-palette-picker__option--active {
  border-color: var(--omc-color-primary);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
  box-shadow: 0 0 0 0.125rem var(--omc-color-focus-ring);
}
.theme-palette-picker__preview {
  display: flex;
  width: 2.8rem;
  height: 2rem;
  overflow: hidden;
  border: 0.0625rem solid rgba(127, 127, 127, 0.25);
  border-radius: 0.45rem;
  background: var(--preview-bg);
}
.theme-palette-picker__preview i {
  flex: 1;
  background: var(--preview-primary);
}
.theme-palette-picker__preview i:nth-child(2) {
  background: var(--preview-accent);
}
.theme-palette-picker__preview i:nth-child(3) {
  background: var(--preview-surface);
}
.theme-preview--aurora {
  --preview-bg: #f2fbf8;
  --preview-primary: #0f766e;
  --preview-accent: #06b6d4;
  --preview-surface: #fff;
}
.theme-preview--ocean {
  --preview-bg: #eff8ff;
  --preview-primary: #0369a1;
  --preview-accent: #0891b2;
  --preview-surface: #fff;
}
.theme-preview--royal {
  --preview-bg: #f3f4ff;
  --preview-primary: #4338ca;
  --preview-accent: #2563eb;
  --preview-surface: #fff;
}
.theme-preview--orchid {
  --preview-bg: #faf5ff;
  --preview-primary: #7e22ce;
  --preview-accent: #c026d3;
  --preview-surface: #fff;
}
.theme-preview--rose {
  --preview-bg: #fff1f5;
  --preview-primary: #be123c;
  --preview-accent: #db2777;
  --preview-surface: #fff;
}
.theme-preview--sunset {
  --preview-bg: #fff8ed;
  --preview-primary: #c2410c;
  --preview-accent: #d97706;
  --preview-surface: #fff;
}
.theme-preview--forest {
  --preview-bg: #f3f8f2;
  --preview-primary: #166534;
  --preview-accent: #4d7c0f;
  --preview-surface: #fff;
}
.theme-preview--graphite {
  --preview-bg: #f5f6f7;
  --preview-primary: #334155;
  --preview-accent: #475569;
  --preview-surface: #fff;
}
.theme-preview--coral {
  --preview-bg: #fff4f1;
  --preview-primary: #c2413b;
  --preview-accent: #ea580c;
  --preview-surface: #fff;
}
.theme-preview--nord {
  --preview-bg: #eef3f5;
  --preview-primary: #3b6e7c;
  --preview-accent: #5e81ac;
  --preview-surface: #fff;
}
.theme-preview--contrast-light {
  --preview-bg: #fff;
  --preview-primary: #000;
  --preview-accent: #0047ff;
  --preview-surface: #ffea00;
}
.theme-preview--contrast-dark {
  --preview-bg: #000;
  --preview-primary: #fff;
  --preview-accent: #00ffff;
  --preview-surface: #ffea00;
}
@media (min-width: 40rem) {
  .theme-palette-picker {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
