<template>
  <header class="page-header">
    <div>
      <p v-if="eyebrow" class="page-header__eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <slot />
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
}>();
</script>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
}

.page-header__eyebrow,
.page-header h1,
.page-header__subtitle {
  margin: 0;
}

.page-header__eyebrow {
  margin-bottom: 0.5rem;
  color: var(--omc-color-primary);
  font-size: 0.78rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.page-header h1 {
  color: var(--omc-color-text);
  font-size: clamp(1.75rem, 5vw, 2.35rem);
  font-weight: 760;
  letter-spacing: -0.035em;
  line-height: 1.15;
}

.page-header__subtitle {
  max-width: 38rem;
  margin-top: 0.65rem;
  color: var(--omc-color-text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
}
</style>
