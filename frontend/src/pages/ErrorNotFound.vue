<template>
  <main class="not-found">
    <div class="not-found__theme"><ThemeSwitcher /></div>
    <section>
      <p class="not-found__code">{{ t("errors.notFound.code") }}</p>
      <h1>{{ t("errors.notFound.title") }}</h1>
      <p class="not-found__description">
        {{ t("errors.notFound.description") }}
      </p>
      <q-btn
        unelevated
        no-caps
        :to="{ name: 'dashboard' }"
        icon="arrow_back"
        class="not-found__action"
        :label="t('errors.notFound.action')"
      />
    </section>
  </main>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import ThemeSwitcher from "@/components/ThemeSwitcher.vue";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.not-found {
  position: relative;
  display: grid;
  min-height: 100dvh;
  place-items: center;
  padding: 2rem;
  background: var(--omc-color-background);
  text-align: center;
}

.not-found__theme {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.not-found__code,
.not-found h1,
.not-found__description {
  margin: 0;
}

.not-found__code {
  color: var(--omc-color-primary);
  font-size: clamp(4.5rem, 20vw, 8rem);
  font-weight: 820;
  letter-spacing: -0.08em;
  line-height: 0.9;
}

.not-found h1 {
  margin-top: 1.5rem;
  color: var(--omc-color-text);
  font-size: clamp(1.6rem, 6vw, 2.3rem);
}

.not-found__description {
  max-width: 28rem;
  margin-top: 0.75rem;
  color: var(--omc-color-text-secondary);
  line-height: 1.6;
}

.not-found__action {
  margin-top: 1.75rem;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-primary) !important;
  color: var(--omc-color-text-on-primary) !important;
  font-weight: 680;
}
</style>
