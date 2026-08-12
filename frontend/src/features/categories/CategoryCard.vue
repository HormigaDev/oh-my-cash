<template>
  <q-card flat class="category-card">
    <q-card-section class="category-card__content">
      <div
        class="category-card__icon"
        :class="`category-color--${category.color ?? 'neutral'}`"
        aria-hidden="true"
      >
        <q-icon :name="category.icon ?? 'category'" size="1.5rem" />
      </div>
      <div class="category-card__identity">
        <h2>{{ category.name }}</h2>
        <span class="category-card__kind">
          {{ t(`categories.kind.${category.kind}`) }}
        </span>
      </div>
      <q-btn
        flat
        round
        dense
        icon="more_vert"
        class="category-card__menu"
        :aria-label="t('categories.actions.open', { name: category.name })"
      >
        <q-menu anchor="bottom right" self="top right">
          <q-list class="category-card__actions">
            <q-item v-close-popup clickable @click="emit('edit', category)">
              <q-item-section avatar><q-icon name="edit" /></q-item-section>
              <q-item-section>{{
                t("categories.actions.edit")
              }}</q-item-section>
            </q-item>
            <q-item
              v-close-popup
              clickable
              class="category-card__archive-action"
              @click="emit('archive', category)"
            >
              <q-item-section avatar><q-icon name="archive" /></q-item-section>
              <q-item-section>
                {{ t("categories.actions.archive") }}
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

import type { Category } from "./types";

defineProps<{ category: Category }>();
const emit = defineEmits<{
  edit: [category: Category];
  archive: [category: Category];
}>();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.category-card {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.category-card:hover {
  border-color: var(--omc-color-primary);
  box-shadow: var(--omc-shadow-sm);
  transform: translateY(-0.125rem);
}

.category-card__content {
  display: flex;
  min-height: 6.25rem;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem;
}

.category-card__icon {
  display: grid;
  flex: 0 0 auto;
  width: 3.25rem;
  height: 3.25rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-category-color-soft);
  color: var(--omc-category-color);
}

.category-card__identity {
  min-width: 0;
}

.category-card h2 {
  margin: 0;
  overflow: hidden;
  color: var(--omc-color-text);
  font-size: 1rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-card__kind {
  display: inline-block;
  margin-top: 0.35rem;
  color: var(--omc-color-text-muted);
  font-size: 0.78rem;
}

.category-card__menu {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--omc-color-text-muted);
}

.category-card__actions {
  min-width: 11rem;
  padding: 0.5rem;
}

.category-card__actions .q-item {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-sm);
}

.category-card__archive-action {
  color: var(--omc-color-negative);
}
</style>
