<template>
  <q-page class="recurring-page">
    <div class="recurring-page__content">
      <AppPageHeader
        :title="t('recurring.title')"
        :subtitle="t('recurring.subtitle')"
      >
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          class="recurring-page__create"
          :label="t('recurring.actions.create')"
          :disable="loadStatus === 'ready' && categories.length === 0"
          @click="openCreateDialog"
        />
      </AppPageHeader>

      <div v-if="loadStatus === 'ready' && rules.length > 0">
        <section
          class="recurring-toolbar"
          :aria-label="t('recurring.filters.label')"
        >
          <q-input
            v-model="search"
            dense
            outlined
            clearable
            debounce="150"
            class="recurring-toolbar__search"
            :placeholder="t('recurring.filters.search')"
            :aria-label="t('recurring.filters.search')"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>

          <q-btn-toggle
            v-model="directionFilter"
            no-caps
            unelevated
            :options="filterOptions"
            class="recurring-toolbar__filters"
          />
        </section>

        <div class="recurring-page__result-count" role="status">
          {{ t("recurring.count", { count: filteredRules.length }) }}
        </div>
      </div>

      <section
        v-if="loadStatus === 'loading'"
        class="recurring-grid"
        :aria-label="t('common.loading')"
        aria-busy="true"
      >
        <q-card v-for="index in 4" :key="index" flat class="rule-skeleton">
          <q-card-section class="rule-skeleton__content">
            <div class="rule-skeleton__heading">
              <q-skeleton type="QAvatar" size="2.75rem" />
              <div>
                <q-skeleton type="text" width="70%" />
                <q-skeleton type="text" width="40%" />
              </div>
            </div>
            <q-skeleton type="text" width="48%" height="2.2rem" />
            <q-skeleton type="rect" height="4.5rem" />
          </q-card-section>
        </q-card>
      </section>

      <section v-else-if="loadStatus === 'error'" class="recurring-state">
        <div
          class="recurring-state__icon recurring-state__icon--error"
          aria-hidden="true"
        >
          <q-icon name="cloud_off" size="1.75rem" />
        </div>
        <h2>{{ t("recurring.loadError.title") }}</h2>
        <p>{{ t("recurring.loadError.description") }}</p>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="refresh"
          :label="t('common.retry')"
          @click="loadData"
        />
      </section>

      <section v-else-if="rules.length === 0" class="recurring-state">
        <div class="recurring-state__icon" aria-hidden="true">
          <q-icon name="event_repeat" size="1.8rem" />
        </div>
        <h2>
          {{
            categories.length === 0
              ? t("recurring.empty.noCategoriesTitle")
              : t("recurring.empty.title")
          }}
        </h2>
        <p>
          {{
            categories.length === 0
              ? t("recurring.empty.noCategoriesDescription")
              : t("recurring.empty.description")
          }}
        </p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          :icon="categories.length === 0 ? 'category' : 'add'"
          :to="categories.length === 0 ? { name: 'categories' } : undefined"
          :label="
            categories.length === 0
              ? t('recurring.actions.manageCategories')
              : t('recurring.actions.createFirst')
          "
          @click="categories.length > 0 && openCreateDialog()"
        />
      </section>

      <section
        v-else-if="filteredRules.length === 0"
        class="recurring-state recurring-state--compact"
      >
        <div class="recurring-state__icon" aria-hidden="true">
          <q-icon name="search_off" size="1.8rem" />
        </div>
        <h2>{{ t("recurring.noResults.title") }}</h2>
        <p>{{ t("recurring.noResults.description") }}</p>
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('recurring.filters.clear')"
          @click="clearFilters"
        />
      </section>

      <section v-else class="recurring-grid recurring-grid--ready">
        <RecurringRuleCard
          v-for="rule in filteredRules"
          :key="rule.id"
          :rule="rule"
          :category="categoryById(rule.categoryId)"
          @edit="openEditDialog"
          @deactivate="openDeactivateDialog"
        />
      </section>
    </div>

    <RecurringRuleFormDialog
      v-model="formOpen"
      :rule="editingRule"
      :categories="categories"
      :saving="saving"
      :error="formError"
      @submit="saveRule"
      @clear-error="formError = null"
    />

    <q-dialog v-model="deactivateOpen" :persistent="deactivating">
      <q-card class="deactivate-dialog">
        <q-card-section class="deactivate-dialog__header">
          <div class="deactivate-dialog__icon" aria-hidden="true">
            <q-icon name="event_busy" size="1.5rem" />
          </div>
          <div>
            <h2>{{ t("recurring.deactivate.title") }}</h2>
            <p>
              {{
                t("recurring.deactivate.description", {
                  name: deactivatingRule?.name ?? ""
                })
              }}
            </p>
          </div>
        </q-card-section>
        <q-card-actions class="deactivate-dialog__actions">
          <q-btn
            v-close-popup
            flat
            no-caps
            :disable="deactivating"
            :label="t('common.cancel')"
          />
          <q-btn
            unelevated
            no-caps
            class="deactivate-dialog__confirm"
            :loading="deactivating"
            :disable="deactivating"
            :label="t('recurring.deactivate.confirm')"
            @click="confirmDeactivate"
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
import { listCategories } from "@/features/categories/api";
import type { Category } from "@/features/categories/types";
import RecurringRuleCard from "@/features/recurring/RecurringRuleCard.vue";
import RecurringRuleFormDialog from "@/features/recurring/RecurringRuleFormDialog.vue";
import {
  createRecurringRule,
  deactivateRecurringRule,
  listRecurringRules,
  updateRecurringRule
} from "@/features/recurring/api";
import type {
  RecurringRule,
  RecurringRuleInput,
  TransactionDirection
} from "@/features/recurring/types";
import { isApiError } from "@/lib/api/errors";

type LoadStatus = "loading" | "ready" | "error";
type DirectionFilter = "all" | TransactionDirection;

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const rules = ref<RecurringRule[]>([]);
const categories = ref<Category[]>([]);
const loadStatus = ref<LoadStatus>("loading");
const search = ref("");
const directionFilter = ref<DirectionFilter>("all");
const formOpen = ref(false);
const editingRule = ref<RecurringRule | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);
const deactivateOpen = ref(false);
const deactivatingRule = ref<RecurringRule | null>(null);
const deactivating = ref(false);

const filterOptions = computed(() => [
  { label: t("recurring.filters.all"), value: "all" },
  {
    label: t("recurring.direction.income"),
    value: "income",
    icon: "south_west"
  },
  {
    label: t("recurring.direction.expense"),
    value: "expense",
    icon: "north_east"
  }
]);

const filteredRules = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("es");

  return rules.value.filter(rule => {
    const category = categoryById(rule.categoryId);
    const matchesDirection =
      directionFilter.value === "all" ||
      rule.direction === directionFilter.value;
    const matchesSearch =
      query.length === 0 ||
      rule.name.toLocaleLowerCase("es").includes(query) ||
      category?.name.toLocaleLowerCase("es").includes(query) === true;

    return matchesDirection && matchesSearch;
  });
});

function sortRules(values: RecurringRule[]) {
  return [...values].sort(
    (left, right) =>
      left.dayOfMonth - right.dayOfMonth ||
      left.name.localeCompare(right.name, "es", { sensitivity: "base" })
  );
}

function categoryById(id: string) {
  return categories.value.find(category => category.id === id) ?? null;
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

function ruleErrorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.code === "NETWORK_ERROR") {
      return t("recurring.errors.unavailable");
    }

    if (error.code === "NOT_FOUND") {
      return t("recurring.errors.notFound");
    }

    if (error.code === "BAD_REQUEST") {
      return t("recurring.errors.invalid");
    }
  }

  return t("recurring.errors.unexpected");
}

async function loadData() {
  loadStatus.value = "loading";

  try {
    const [loadedRules, loadedCategories] = await Promise.all([
      listRecurringRules(),
      listCategories()
    ]);
    rules.value = sortRules(loadedRules);
    categories.value = loadedCategories;
    loadStatus.value = "ready";
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      loadStatus.value = "error";
    }
  }
}

function openCreateDialog() {
  editingRule.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEditDialog(rule: RecurringRule) {
  editingRule.value = rule;
  formError.value = null;
  formOpen.value = true;
}

async function saveRule(input: RecurringRuleInput) {
  if (saving.value) {
    return;
  }

  saving.value = true;
  formError.value = null;

  try {
    const saved = editingRule.value
      ? await updateRecurringRule(editingRule.value.id, input)
      : await createRecurringRule(input);
    const existing = rules.value.some(rule => rule.id === saved.id);

    rules.value = sortRules(
      existing
        ? rules.value.map(rule => (rule.id === saved.id ? saved : rule))
        : [...rules.value, saved]
    );
    formOpen.value = false;
    $q.notify({
      type: "positive",
      message: existing
        ? t("recurring.feedback.updated")
        : t("recurring.feedback.created")
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      formError.value = ruleErrorMessage(error);
    }
  } finally {
    saving.value = false;
  }
}

function openDeactivateDialog(rule: RecurringRule) {
  deactivatingRule.value = rule;
  deactivateOpen.value = true;
}

async function confirmDeactivate() {
  if (deactivating.value || deactivatingRule.value === null) {
    return;
  }

  deactivating.value = true;

  try {
    await deactivateRecurringRule(deactivatingRule.value.id);
    rules.value = rules.value.filter(
      rule => rule.id !== deactivatingRule.value?.id
    );
    deactivateOpen.value = false;
    $q.notify({
      type: "positive",
      message: t("recurring.feedback.deactivated")
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      $q.notify({
        type: "negative",
        message: ruleErrorMessage(error)
      });
    }
  } finally {
    deactivating.value = false;
  }
}

function clearFilters() {
  search.value = "";
  directionFilter.value = "all";
}

onMounted(() => {
  void loadData();
});
</script>

<style scoped lang="scss">
.recurring-page {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.recurring-page__content {
  width: 100%;
  max-width: var(--omc-content-max-width);
  margin: 0 auto;
}

.recurring-page__content :deep(.page-header) {
  align-items: flex-start;
  flex-direction: column;
}

.recurring-page__create {
  min-height: 2.75rem;
  flex: 0 0 auto;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.recurring-toolbar {
  display: grid;
  gap: 0.75rem;
  margin-top: 2rem;
}

.recurring-toolbar__filters {
  overflow-x: auto;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface);
  color: var(--omc-color-text-secondary);
}

.recurring-toolbar__filters :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.recurring-page__result-count {
  margin: 0.75rem 0 1rem;
  color: var(--omc-color-text-muted);
  font-size: 0.8rem;
}

.recurring-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
  margin-top: 2rem;
}

.recurring-grid--ready {
  margin-top: 0;
}

.rule-skeleton {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.rule-skeleton__content {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}

.rule-skeleton__heading {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  align-items: center;
  gap: 0.85rem;
}

.recurring-state {
  display: grid;
  justify-items: center;
  margin-top: 2rem;
  padding: clamp(2.5rem, 9vw, 5rem) 1.5rem;
  border: 0.0625rem dashed var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface);
  text-align: center;
}

.recurring-state__icon {
  display: grid;
  width: 3.75rem;
  height: 3.75rem;
  margin-bottom: 1.2rem;
  place-items: center;
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.recurring-state__icon--error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.recurring-state h2,
.recurring-state p {
  margin: 0;
}

.recurring-state h2 {
  color: var(--omc-color-text);
  font-size: 1.2rem;
  font-weight: 720;
}

.recurring-state p {
  max-width: 34rem;
  margin: 0.6rem 0 1.25rem;
  color: var(--omc-color-text-muted);
  line-height: 1.6;
}

.recurring-state--compact {
  padding-block: 3rem;
}

.deactivate-dialog {
  width: min(29rem, calc(100vw - 2rem));
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
}

.deactivate-dialog__header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
}

.deactivate-dialog__icon {
  display: grid;
  flex: 0 0 auto;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.deactivate-dialog h2,
.deactivate-dialog p {
  margin: 0;
}

.deactivate-dialog h2 {
  font-size: 1.25rem;
  font-weight: 730;
}

.deactivate-dialog p {
  margin-top: 0.5rem;
  color: var(--omc-color-text-secondary);
  line-height: 1.55;
}

.deactivate-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1.5rem 1.5rem;
}

.deactivate-dialog__actions .q-btn {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.deactivate-dialog__confirm {
  background: var(--omc-color-negative) !important;
  color: var(--omc-color-text-on-primary) !important;
}

@media (min-width: 42rem) {
  .recurring-page__content :deep(.page-header) {
    align-items: flex-end;
    flex-direction: row;
  }

  .recurring-toolbar {
    grid-template-columns: minmax(14rem, 1fr) auto;
  }

  .recurring-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
