<template>
  <div class="omc-brand" :class="{ 'omc-brand--compact': compact }">
    <span class="omc-brand__mark" aria-hidden="true">
      {{ t("app.shortName") }}
    </span>
    <span v-if="!compact" class="omc-brand__copy">
      <strong>{{ t("app.name") }}</strong>
      <small>{{ t("app.tagline") }}</small>
    </span>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

withDefaults(defineProps<{ compact?: boolean }>(), { compact: false });

const { t } = useI18n();
</script>

<style scoped lang="scss">
.omc-brand {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: 0;
}

.omc-brand__mark {
  display: inline-grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-primary);
  color: var(--omc-color-text-on-primary);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  box-shadow: var(--omc-shadow-sm);
}

.omc-brand__copy {
  display: grid;
  min-width: 0;
  line-height: 1.15;
}

.omc-brand__copy strong {
  color: var(--omc-color-text);
  font-size: 1rem;
  font-weight: 750;
}

.omc-brand__copy small {
  margin-top: 0.25rem;
  color: var(--omc-color-text-muted);
  font-size: 0.72rem;
  font-weight: 500;
}

.omc-brand--compact .omc-brand__mark {
  width: 2.5rem;
  height: 2.5rem;
}
</style>
