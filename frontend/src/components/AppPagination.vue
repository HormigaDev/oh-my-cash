<template>
  <nav
    v-if="totalPages > 1"
    class="app-pagination"
    :aria-label="t('pagination.label')"
  >
    <span class="app-pagination__total">{{
      t("pagination.total", { total })
    }}</span>
    <q-pagination
      :model-value="page"
      :max="totalPages"
      :max-pages="$q.screen.lt.sm ? 3 : 7"
      boundary-numbers
      direction-links
      color="primary"
      :disable="loading"
      @update:model-value="$emit('update:page', $event)"
    />
  </nav>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

defineProps<{
  page: number;
  totalPages: number;
  total: number;
  loading?: boolean;
}>();
defineEmits<{ "update:page": [page: number] }>();
const $q = useQuasar();
const { t } = useI18n();
</script>

<style scoped lang="scss">
.app-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.25rem;
  flex-wrap: wrap;
}
.app-pagination__total {
  color: var(--omc-color-text-muted);
  font-size: 0.875rem;
}
@media (max-width: 37.5rem) {
  .app-pagination {
    justify-content: center;
  }
  .app-pagination__total {
    width: 100%;
    text-align: center;
  }
}
</style>
