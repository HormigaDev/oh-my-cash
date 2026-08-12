<template>
  <q-page class="categories-page">
    <div class="categories-page__content">
      <AppPageHeader
        :title="t('categories.title')"
        :subtitle="t('categories.subtitle')"
      >
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          class="categories-page__create"
          :label="t('categories.actions.create')"
          @click="openCreateDialog"
        />
      </AppPageHeader>

      <div v-if="loadStatus === 'ready' && categories.length > 0">
        <section
          class="categories-toolbar"
          :aria-label="t('categories.filters.label')"
        >
          <q-input
            v-model="search"
            dense
            outlined
            clearable
            debounce="150"
            class="categories-toolbar__search"
            :placeholder="t('categories.filters.search')"
            :aria-label="t('categories.filters.search')"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <q-btn-toggle
            v-model="kindFilter"
            no-caps
            unelevated
            :options="filterOptions"
            class="categories-toolbar__filters"
          />
        </section>

        <div class="categories-page__result-count" role="status">
          {{ t("categories.count", { count: filteredCategories.length }) }}
        </div>
      </div>

      <section
        v-if="loadStatus === 'loading'"
        class="categories-grid"
        :aria-label="t('common.loading')"
        aria-busy="true"
      >
        <q-card v-for="index in 6" :key="index" flat class="category-skeleton">
          <q-card-section class="category-skeleton__content">
            <q-skeleton type="QAvatar" size="3.25rem" />
            <div class="category-skeleton__text">
              <q-skeleton type="text" width="65%" />
              <q-skeleton type="text" width="38%" />
            </div>
          </q-card-section>
        </q-card>
      </section>

      <section v-else-if="loadStatus === 'error'" class="categories-error">
        <div class="categories-error__icon" aria-hidden="true">
          <q-icon name="cloud_off" size="1.75rem" />
        </div>
        <h2>{{ t("categories.loadError.title") }}</h2>
        <p>{{ t("categories.loadError.description") }}</p>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="refresh"
          :label="t('common.retry')"
          @click="loadCategories"
        />
      </section>

      <section v-else-if="categories.length === 0" class="categories-empty">
        <div class="categories-empty__icon" aria-hidden="true">
          <q-icon name="category" size="1.8rem" />
        </div>
        <h2>{{ t("categories.empty.title") }}</h2>
        <p>{{ t("categories.empty.description") }}</p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          :label="t('categories.actions.createFirst')"
          @click="openCreateDialog"
        />
      </section>

      <section
        v-else-if="filteredCategories.length === 0"
        class="categories-empty categories-empty--compact"
      >
        <div class="categories-empty__icon" aria-hidden="true">
          <q-icon name="search_off" size="1.8rem" />
        </div>
        <h2>{{ t("categories.noResults.title") }}</h2>
        <p>{{ t("categories.noResults.description") }}</p>
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('categories.filters.clear')"
          @click="clearFilters"
        />
      </section>

      <section v-else class="categories-grid">
        <CategoryCard
          v-for="category in filteredCategories"
          :key="category.id"
          :category="category"
          @edit="openEditDialog"
          @archive="openArchiveDialog"
        />
      </section>
    </div>

    <CategoryFormDialog
      v-model="formOpen"
      :category="editingCategory"
      :saving="saving"
      :error="formError"
      @submit="saveCategory"
      @clear-error="formError = null"
    />

    <q-dialog v-model="archiveOpen" :persistent="archiving">
      <q-card class="archive-dialog">
        <q-card-section class="archive-dialog__header">
          <div class="archive-dialog__icon" aria-hidden="true">
            <q-icon name="archive" size="1.5rem" />
          </div>
          <div>
            <h2>{{ t("categories.archive.title") }}</h2>
            <p>
              {{
                t("categories.archive.description", {
                  name: archivingCategory?.name ?? ""
                })
              }}
            </p>
          </div>
        </q-card-section>
        <q-card-actions class="archive-dialog__actions">
          <q-btn
            v-close-popup
            flat
            no-caps
            :disable="archiving"
            :label="t('common.cancel')"
          />
          <q-btn
            unelevated
            no-caps
            class="archive-dialog__confirm"
            :loading="archiving"
            :disable="archiving"
            :label="t('categories.archive.confirm')"
            @click="confirmArchive"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";

import AppPageHeader from "@/components/AppPageHeader.vue";
import { useAuthStore } from "@/features/auth/authStore";
import CategoryCard from "@/features/categories/CategoryCard.vue";
import CategoryFormDialog from "@/features/categories/CategoryFormDialog.vue";
import {
  archiveCategory,
  createCategory,
  listCategories,
  updateCategory
} from "@/features/categories/api";
import { categoryKindOptions } from "@/features/categories/options";
import type {
  Category,
  CategoryInput,
  CategoryKind
} from "@/features/categories/types";
import { isApiError } from "@/lib/api/errors";

type LoadStatus = "loading" | "ready" | "error";
type KindFilter = "all" | CategoryKind;

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const categories = ref<Category[]>([]);
const loadStatus = ref<LoadStatus>("loading");
const search = ref("");
const kindFilter = ref<KindFilter>("all");
const formOpen = ref(false);
const editingCategory = ref<Category | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);
const archiveOpen = ref(false);
const archivingCategory = ref<Category | null>(null);
const archiving = ref(false);

const filterOptions = computed(() => [
  { label: t("categories.filters.all"), value: "all" },
  ...categoryKindOptions.map(option => ({
    label: t(option.labelKey),
    value: option.value
  }))
]);

const filteredCategories = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("es");

  return categories.value.filter(category => {
    const matchesKind =
      kindFilter.value === "all" || category.kind === kindFilter.value;
    const matchesSearch =
      query.length === 0 ||
      category.name.toLocaleLowerCase("es").includes(query);

    return matchesKind && matchesSearch;
  });
});

function sortCategories(values: Category[]) {
  return [...values].sort((left, right) =>
    left.name.localeCompare(right.name, "es", { sensitivity: "base" })
  );
}

async function redirectExpiredSession(error: unknown) {
  if (!isApiError(error) || error.code !== "UNAUTHORIZED") {
    return false;
  }

  auth.expireSession();
  await router.replace({
    name: "login",
    query: { redirect: route.fullPath }
  });
  return true;
}

function categoryErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.code === "CATEGORY_NAME_TAKEN") {
      return t("categories.errors.nameTaken");
    }

    if (error.code === "NETWORK_ERROR") {
      return t("categories.errors.unavailable");
    }

    if (error.code === "NOT_FOUND") {
      return t("categories.errors.notFound");
    }
  }

  return t("categories.errors.unexpected");
}

async function loadCategories() {
  loadStatus.value = "loading";

  try {
    categories.value = sortCategories(await listCategories());
    loadStatus.value = "ready";
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      loadStatus.value = "error";
    }
  }
}

function openCreateDialog() {
  editingCategory.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEditDialog(category: Category) {
  editingCategory.value = category;
  formError.value = null;
  formOpen.value = true;
}

async function saveCategory(input: CategoryInput) {
  if (saving.value) {
    return;
  }

  saving.value = true;
  formError.value = null;

  try {
    const saved = editingCategory.value
      ? await updateCategory(editingCategory.value.id, input)
      : await createCategory(input);
    const existing = categories.value.some(
      category => category.id === saved.id
    );

    categories.value = sortCategories(
      existing
        ? categories.value.map(category =>
            category.id === saved.id ? saved : category
          )
        : [...categories.value, saved]
    );
    formOpen.value = false;
    $q.notify({
      type: "positive",
      message: existing
        ? t("categories.feedback.updated")
        : t("categories.feedback.created")
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      formError.value = categoryErrorMessage(error);
    }
  } finally {
    saving.value = false;
  }
}

function openArchiveDialog(category: Category) {
  archivingCategory.value = category;
  archiveOpen.value = true;
}

async function confirmArchive() {
  if (archiving.value || archivingCategory.value === null) {
    return;
  }

  archiving.value = true;

  try {
    await archiveCategory(archivingCategory.value.id);
    categories.value = categories.value.filter(
      category => category.id !== archivingCategory.value?.id
    );
    archiveOpen.value = false;
    $q.notify({
      type: "positive",
      message: t("categories.feedback.archived")
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      $q.notify({
        type: "negative",
        message: categoryErrorMessage(error)
      });
    }
  } finally {
    archiving.value = false;
  }
}

function clearFilters() {
  search.value = "";
  kindFilter.value = "all";
}

onMounted(() => {
  void loadCategories();
});
</script>

<style scoped lang="scss">
.categories-page {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.categories-page__content {
  width: 100%;
  max-width: var(--omc-content-max-width);
  margin: 0 auto;
}

.categories-page__content :deep(.page-header) {
  align-items: flex-start;
  flex-direction: column;
}

.categories-page__create {
  min-height: 2.75rem;
  flex: 0 0 auto;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.categories-toolbar {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
}

.categories-toolbar__filters {
  overflow-x: auto;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface);
  color: var(--omc-color-text-secondary);
}

.categories-toolbar__filters :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.categories-page__result-count {
  margin: 0.75rem 0 1rem;
  color: var(--omc-color-text-muted);
  font-size: 0.8rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
  margin-top: 2rem;
}

.categories-page__result-count + .categories-grid {
  margin-top: 0;
}

.category-skeleton {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.category-skeleton__content {
  display: flex;
  min-height: 6.25rem;
  align-items: center;
  gap: 1rem;
  padding: 1.15rem;
}

.category-skeleton__text {
  width: 100%;
}

.categories-error,
.categories-empty {
  display: grid;
  justify-items: center;
  margin-top: 2rem;
  padding: clamp(2.5rem, 9vw, 5rem) 1.5rem;
  border: 0.0625rem dashed var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface);
  text-align: center;
}

.categories-error__icon,
.categories-empty__icon {
  display: grid;
  width: 3.75rem;
  height: 3.75rem;
  margin-bottom: 1.2rem;
  place-items: center;
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.categories-error__icon {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.categories-error h2,
.categories-error p,
.categories-empty h2,
.categories-empty p {
  margin: 0;
}

.categories-error h2,
.categories-empty h2 {
  color: var(--omc-color-text);
  font-size: 1.2rem;
  font-weight: 720;
}

.categories-error p,
.categories-empty p {
  max-width: 32rem;
  margin: 0.6rem 0 1.25rem;
  color: var(--omc-color-text-muted);
  line-height: 1.6;
}

.categories-empty--compact {
  padding-block: 3rem;
}

.archive-dialog {
  width: min(28rem, calc(100vw - 2rem));
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
}

.archive-dialog__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
}

.archive-dialog__icon {
  display: grid;
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.archive-dialog h2,
.archive-dialog p {
  margin: 0;
}

.archive-dialog h2 {
  font-size: 1.25rem;
  font-weight: 730;
}

.archive-dialog p {
  margin-top: 0.5rem;
  color: var(--omc-color-text-secondary);
  line-height: 1.55;
}

.archive-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.archive-dialog__actions .q-btn {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.archive-dialog__confirm {
  background: var(--omc-color-negative) !important;
  color: var(--omc-color-text-on-primary) !important;
}

@media (min-width: 42rem) {
  .categories-page__content :deep(.page-header) {
    align-items: flex-end;
    flex-direction: row;
  }

  .categories-toolbar {
    grid-template-columns: minmax(14rem, 1fr) auto;
  }

  .categories-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 75rem) {
  .categories-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
