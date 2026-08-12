<template>
  <section class="empty-state">
    <div class="empty-state__icon" aria-hidden="true">
      <q-icon :name="icon" size="1.75rem" />
    </div>
    <div>
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  icon: string;
}>();
</script>

<style scoped lang="scss">
.empty-state {
  display: grid;
  justify-items: center;
  padding: clamp(2rem, 8vw, 4.5rem) 1.5rem;
  border: 0.0625rem dashed var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface);
  text-align: center;
}

.empty-state__icon {
  display: grid;
  width: 3.75rem;
  height: 3.75rem;
  margin-bottom: 1.25rem;
  place-items: center;
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.empty-state h2,
.empty-state p {
  margin: 0;
}

.empty-state h2 {
  color: var(--omc-color-text);
  font-size: 1.15rem;
  font-weight: 720;
}

.empty-state p {
  max-width: 31rem;
  margin-top: 0.6rem;
  color: var(--omc-color-text-muted);
  line-height: 1.65;
}
</style>
