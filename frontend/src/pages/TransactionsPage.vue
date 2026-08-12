<template>
  <q-page class="transactions-page">
    <div class="transactions-page__content">
      <AppPageHeader
        :title="t('transactions.title')"
        :subtitle="t('transactions.subtitle')"
      >
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          class="transactions-page__create"
          :label="t('transactions.actions.create')"
          :disable="loadStatus === 'ready' && categories.length === 0"
          @click="openCreateDialog"
        />
      </AppPageHeader>

      <section
        class="transactions-period"
        :aria-label="t('transactions.month.label')"
      >
        <q-btn
          flat
          round
          icon="chevron_left"
          :disable="loadStatus === 'loading'"
          :aria-label="t('transactions.month.previous')"
          @click="changeMonth(-1)"
        />
        <div class="transactions-period__value">
          <span>{{ t("transactions.month.eyebrow") }}</span>
          <strong>{{ selectedMonthLabel }}</strong>
        </div>
        <q-btn
          flat
          round
          icon="chevron_right"
          :disable="loadStatus === 'loading'"
          :aria-label="t('transactions.month.next')"
          @click="changeMonth(1)"
        />
        <AppMonthField
          v-model="selectedMonth"
          class="transactions-period__picker"
          :label="t('transactions.month.choose')"
          :disable="loadStatus === 'loading'"
          @update:model-value="loadTransactions"
        />
        <q-btn
          v-if="selectedMonth !== thisMonth"
          flat
          no-caps
          color="primary"
          :disable="loadStatus === 'loading'"
          :label="t('transactions.month.current')"
          @click="goToCurrentMonth"
        />
      </section>

      <q-banner
        v-if="loadStatus === 'ready'"
        dense
        rounded
        class="transactions-materialization"
      >
        <template #avatar><q-icon name="info" size="md" /></template>
        {{ t("transactions.materialization.notice") }}
      </q-banner>

      <div v-if="loadStatus === 'ready' && transactions.length > 0">
        <section
          class="transactions-summary"
          :aria-label="t('transactions.summary.label')"
        >
          <div>
            <span>{{ t("transactions.summary.pending") }}</span>
            <strong>{{ statusCounts.pending }}</strong>
          </div>
          <div>
            <span>{{ t("transactions.summary.paid") }}</span>
            <strong>{{ statusCounts.paid }}</strong>
          </div>
          <div>
            <span>{{ t("transactions.summary.total") }}</span>
            <strong>{{ transactions.length }}</strong>
          </div>
        </section>

        <section
          class="transactions-toolbar"
          :aria-label="t('transactions.filters.label')"
        >
          <q-input
            v-model="search"
            dense
            outlined
            clearable
            debounce="150"
            :placeholder="t('transactions.filters.search')"
            :aria-label="t('transactions.filters.search')"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
          <div class="transactions-toolbar__scroll">
            <q-btn-toggle
              v-model="statusFilter"
              no-caps
              unelevated
              :options="statusOptions"
              class="transactions-toolbar__filters"
            />
          </div>
        </section>

        <div class="transactions-page__result-count" role="status">
          {{ t("transactions.count", { count: filteredTransactions.length }) }}
        </div>
      </div>

      <section
        v-if="loadStatus === 'loading'"
        class="transactions-grid"
        :aria-label="t('common.loading')"
        aria-busy="true"
      >
        <q-card
          v-for="index in 6"
          :key="index"
          flat
          class="transaction-skeleton"
        >
          <q-card-section>
            <div class="transaction-skeleton__heading">
              <q-skeleton type="QAvatar" size="2.75rem" />
              <q-skeleton type="text" width="65%" />
            </div>
            <q-skeleton type="text" width="48%" height="2.2rem" />
            <q-skeleton type="rect" height="4rem" />
          </q-card-section>
        </q-card>
      </section>

      <section v-else-if="loadStatus === 'error'" class="transactions-state">
        <div
          class="transactions-state__icon transactions-state__icon--error"
          aria-hidden="true"
        >
          <q-icon name="cloud_off" size="1.75rem" />
        </div>
        <h2>{{ t("transactions.loadError.title") }}</h2>
        <p>{{ t("transactions.loadError.description") }}</p>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="refresh"
          :label="t('common.retry')"
          @click="loadData"
        />
      </section>

      <section v-else-if="transactions.length === 0" class="transactions-state">
        <div class="transactions-state__icon" aria-hidden="true">
          <q-icon name="receipt_long" size="1.8rem" />
        </div>
        <h2>
          {{
            t(
              categories.length === 0
                ? "transactions.empty.noCategoriesTitle"
                : "transactions.empty.title",
            )
          }}
        </h2>
        <p>
          {{
            t(
              categories.length === 0
                ? "transactions.empty.noCategoriesDescription"
                : "transactions.empty.description",
            )
          }}
        </p>
        <q-btn
          unelevated
          no-caps
          color="primary"
          :icon="categories.length === 0 ? 'category' : 'add'"
          :to="categories.length === 0 ? { name: 'categories' } : undefined"
          :label="
            t(
              categories.length === 0
                ? 'transactions.actions.manageCategories'
                : 'transactions.actions.createFirst',
            )
          "
          @click="categories.length > 0 && openCreateDialog()"
        />
      </section>

      <section
        v-else-if="filteredTransactions.length === 0"
        class="transactions-state transactions-state--compact"
      >
        <div class="transactions-state__icon" aria-hidden="true">
          <q-icon name="search_off" size="1.8rem" />
        </div>
        <h2>{{ t("transactions.noResults.title") }}</h2>
        <p>{{ t("transactions.noResults.description") }}</p>
        <q-btn
          flat
          no-caps
          color="primary"
          :label="t('transactions.filters.clear')"
          @click="clearFilters"
        />
      </section>

      <section v-else class="transactions-grid transactions-grid--ready">
        <TransactionCard
          v-for="transaction in filteredTransactions"
          :key="transaction.id"
          :transaction="transaction"
          :category="categoryById(transaction.categoryId)"
          @edit="openEditDialog"
          @pay="openPayDialog"
          @skip="openTransitionDialog('skip', $event)"
          @cancel="openTransitionDialog('cancel', $event)"
        />
      </section>
    </div>

    <TransactionFormDialog
      v-model="formOpen"
      :transaction="editingTransaction"
      :initial-occurred-at="initialOccurredAt"
      :categories="categories"
      :saving="saving"
      :error="formError"
      @submit="saveTransaction"
      @clear-error="formError = null"
    />

    <PayTransactionDialog
      v-model="payOpen"
      :transaction="payingTransaction"
      :saving="paying"
      :error="payError"
      @submit="confirmPayment"
      @clear-error="payError = null"
    />

    <q-dialog v-model="transitionOpen" :persistent="transitioning">
      <q-card class="transition-dialog">
        <q-card-section class="transition-dialog__header">
          <div
            class="transition-dialog__icon"
            :class="`transition-dialog__icon--${transitionAction}`"
            aria-hidden="true"
          >
            <q-icon
              :name="transitionAction === 'skip' ? 'skip_next' : 'block'"
              size="1.5rem"
            />
          </div>
          <div>
            <h2>{{ t(`transactions.${transitionAction}.title`) }}</h2>
            <p>
              {{
                t(`transactions.${transitionAction}.description`, {
                  name: transitioningTransaction?.description ?? "",
                })
              }}
            </p>
          </div>
        </q-card-section>
        <q-card-actions class="transition-dialog__actions">
          <q-btn
            v-close-popup
            flat
            no-caps
            :disable="transitioning"
            :label="t('common.cancel')"
          />
          <q-btn
            unelevated
            no-caps
            :class="`transition-dialog__confirm--${transitionAction}`"
            :loading="transitioning"
            :disable="transitioning"
            :label="t(`transactions.${transitionAction}.confirm`)"
            @click="confirmTransition"
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
import AppMonthField from "@/components/AppMonthField.vue";
import { useAppLocale } from "@/composables/useAppLocale";
import { useAuthStore } from "@/features/auth/authStore";
import { listCategories } from "@/features/categories/api";
import type { Category } from "@/features/categories/types";
import PayTransactionDialog from "@/features/transactions/PayTransactionDialog.vue";
import TransactionCard from "@/features/transactions/TransactionCard.vue";
import TransactionFormDialog from "@/features/transactions/TransactionFormDialog.vue";
import {
  cancelTransaction,
  createTransaction,
  listTransactions,
  payTransaction,
  skipTransaction,
  updateTransaction,
} from "@/features/transactions/api";
import type {
  ManualTransactionInput,
  PayTransactionInput,
  Transaction,
  TransactionStatus,
} from "@/features/transactions/types";
import {
  currentMonth,
  dateTimeInputForMonth,
  formatMonth,
  isValidMonth,
  shiftMonth,
} from "@/features/transactions/month";
import { isApiError } from "@/lib/api/errors";

type LoadStatus = "loading" | "ready" | "error";
type StatusFilter = "all" | TransactionStatus;
type TransitionAction = "skip" | "cancel";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();
const { locale } = useAppLocale();

const transactions = ref<Transaction[]>([]);
const categories = ref<Category[]>([]);
const thisMonth = currentMonth(auth.user?.timezone ?? "America/Sao_Paulo");
const selectedMonth = ref(thisMonth);
const loadStatus = ref<LoadStatus>("loading");
let loadSequence = 0;
const search = ref("");
const statusFilter = ref<StatusFilter>("all");
const formOpen = ref(false);
const editingTransaction = ref<Transaction | null>(null);
const saving = ref(false);
const formError = ref<string | null>(null);
const createAttempt = ref<{ fingerprint: string; id: string } | null>(null);
const payOpen = ref(false);
const payingTransaction = ref<Transaction | null>(null);
const paying = ref(false);
const payError = ref<string | null>(null);
const transitionOpen = ref(false);
const transitionAction = ref<TransitionAction>("skip");
const transitioningTransaction = ref<Transaction | null>(null);
const transitioning = ref(false);

const statusOptions = computed(() => [
  { label: t("transactions.filters.all"), value: "all" },
  { label: t("transactions.status.pending"), value: "pending" },
  { label: t("transactions.status.paid"), value: "paid" },
  { label: t("transactions.status.skipped"), value: "skipped" },
  { label: t("transactions.status.cancelled"), value: "cancelled" },
]);
const selectedMonthLabel = computed(() =>
  formatMonth(selectedMonth.value, locale.value),
);
const initialOccurredAt = computed(() =>
  dateTimeInputForMonth(selectedMonth.value, thisMonth),
);
const statusCounts = computed(() => ({
  pending: transactions.value.filter(
    (transaction) => transaction.status === "pending",
  ).length,
  paid: transactions.value.filter(
    (transaction) => transaction.status === "paid",
  ).length,
}));
const filteredTransactions = computed(() => {
  const query = search.value.trim().toLocaleLowerCase("es");

  return transactions.value.filter((transaction) => {
    const category = categoryById(transaction.categoryId);
    return (
      (statusFilter.value === "all" ||
        transaction.status === statusFilter.value) &&
      (query.length === 0 ||
        transaction.description.toLocaleLowerCase("es").includes(query) ||
        transaction.notes?.toLocaleLowerCase("es").includes(query) === true ||
        category?.name.toLocaleLowerCase("es").includes(query) === true)
    );
  });
});

function categoryById(id: string) {
  return categories.value.find((category) => category.id === id) ?? null;
}

async function redirectExpiredSession(error: unknown) {
  if (!isApiError(error) || error.code !== "UNAUTHORIZED") return false;

  auth.expireSession();
  await router.replace({ name: "login", query: { redirect: route.fullPath } });
  return true;
}

function errorMessage(error: unknown) {
  if (isApiError(error)) {
    if (error.code === "NETWORK_ERROR")
      return t("transactions.errors.unavailable");
    if (error.code === "NOT_FOUND") return t("transactions.errors.notFound");
    if (error.code === "INVALID_TRANSACTION_STATE")
      return t("transactions.errors.invalidState");
    if (error.code === "IDEMPOTENCY_CONFLICT")
      return t("transactions.errors.idempotencyConflict");
    if (error.code === "BAD_REQUEST") return t("transactions.errors.invalid");
  }

  return t("transactions.errors.unexpected");
}

async function loadData() {
  try {
    categories.value = await listCategories();
    await loadTransactions();
  } catch (error) {
    if (!(await redirectExpiredSession(error))) loadStatus.value = "error";
  }
}

async function loadTransactions() {
  if (!isValidMonth(selectedMonth.value)) return;

  const sequence = ++loadSequence;
  loadStatus.value = "loading";

  try {
    const loadedTransactions = await listTransactions(selectedMonth.value);
    if (sequence !== loadSequence) return;

    transactions.value = loadedTransactions;
    loadStatus.value = "ready";
  } catch (error) {
    if (sequence !== loadSequence) return;
    if (!(await redirectExpiredSession(error))) loadStatus.value = "error";
  }
}

function changeMonth(offset: number) {
  selectedMonth.value = shiftMonth(selectedMonth.value, offset);
  void loadTransactions();
}

function goToCurrentMonth() {
  selectedMonth.value = thisMonth;
  void loadTransactions();
}

function openCreateDialog() {
  editingTransaction.value = null;
  createAttempt.value = null;
  formError.value = null;
  formOpen.value = true;
}

function openEditDialog(transaction: Transaction) {
  editingTransaction.value = transaction;
  formError.value = null;
  formOpen.value = true;
}

function operationIdFor(input: ManualTransactionInput) {
  const fingerprint = JSON.stringify(input);
  if (createAttempt.value?.fingerprint === fingerprint)
    return createAttempt.value.id;

  const id = crypto.randomUUID();
  createAttempt.value = { fingerprint, id };
  return id;
}

function replaceTransaction(saved: Transaction) {
  const index = transactions.value.findIndex(
    (transaction) => transaction.id === saved.id,
  );
  if (index === -1) transactions.value = [saved, ...transactions.value];
  else
    transactions.value = transactions.value.map((transaction) =>
      transaction.id === saved.id ? saved : transaction,
    );
}

async function saveTransaction(input: ManualTransactionInput) {
  if (saving.value) return;
  saving.value = true;
  formError.value = null;

  try {
    const editing = editingTransaction.value;
    if (editing) {
      await updateTransaction(editing.id, input);
    } else {
      await createTransaction({
        ...input,
        clientOperationId: operationIdFor(input),
      });
    }
    await loadTransactions();
    formOpen.value = false;
    createAttempt.value = null;
    $q.notify({
      type: "positive",
      message: t(
        editing
          ? "transactions.feedback.updated"
          : "transactions.feedback.created",
      ),
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error)))
      formError.value = errorMessage(error);
  } finally {
    saving.value = false;
  }
}

function openPayDialog(transaction: Transaction) {
  payingTransaction.value = transaction;
  payError.value = null;
  payOpen.value = true;
}

async function confirmPayment(input: PayTransactionInput) {
  if (paying.value || payingTransaction.value === null) return;
  paying.value = true;
  payError.value = null;

  try {
    replaceTransaction(await payTransaction(payingTransaction.value.id, input));
    payOpen.value = false;
    $q.notify({ type: "positive", message: t("transactions.feedback.paid") });
  } catch (error) {
    if (!(await redirectExpiredSession(error)))
      payError.value = errorMessage(error);
  } finally {
    paying.value = false;
  }
}

function openTransitionDialog(
  action: TransitionAction,
  transaction: Transaction,
) {
  transitionAction.value = action;
  transitioningTransaction.value = transaction;
  transitionOpen.value = true;
}

async function confirmTransition() {
  if (transitioning.value || transitioningTransaction.value === null) return;
  transitioning.value = true;

  try {
    const saved =
      transitionAction.value === "skip"
        ? await skipTransaction(transitioningTransaction.value.id)
        : await cancelTransaction(transitioningTransaction.value.id);
    replaceTransaction(saved);
    transitionOpen.value = false;
    $q.notify({
      type: "positive",
      message: t(`transactions.feedback.${transitionAction.value}`),
    });
  } catch (error) {
    if (!(await redirectExpiredSession(error))) {
      $q.notify({ type: "negative", message: errorMessage(error) });
    }
  } finally {
    transitioning.value = false;
  }
}

function clearFilters() {
  search.value = "";
  statusFilter.value = "all";
}

onMounted(() => void loadData());
</script>

<style scoped lang="scss">
.transactions-page {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}

.transactions-page__content {
  width: 100%;
  max-width: var(--omc-content-max-width);
  margin: 0 auto;
}

.transactions-page__content :deep(.page-header) {
  align-items: flex-start;
  flex-direction: column;
}

.transactions-page__create {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.transactions-period {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  margin-top: 2rem;
  padding: 0.65rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.transactions-period__value {
  display: grid;
  min-width: 9rem;
  flex: 1 1 9rem;
}

.transactions-period__value span {
  color: var(--omc-color-text-muted);
  font-size: 0.7rem;
}

.transactions-period__value strong {
  color: var(--omc-color-text);
  font-size: 1rem;
}

.transactions-period__picker {
  width: 10.5rem;
}

.transactions-materialization {
  margin-top: 0.75rem;
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
  font-size: 0.8rem;
  line-height: 1.45;
}

.transactions-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
  margin-top: 0.75rem;
}

.transactions-summary > div {
  display: grid;
  gap: 0.15rem;
  padding: 0.9rem 1rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface);
}

.transactions-summary span {
  color: var(--omc-color-text-muted);
  font-size: 0.72rem;
}

.transactions-summary strong {
  color: var(--omc-color-text);
  font-size: 1.25rem;
}

.transactions-toolbar {
  display: grid;
  gap: 0.75rem;
  margin-top: 1rem;
}

.transactions-toolbar__scroll {
  overflow-x: auto;
}

.transactions-toolbar__filters {
  min-width: max-content;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface);
  color: var(--omc-color-text-secondary);
}

.transactions-toolbar__filters :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.transactions-page__result-count {
  margin: 0.75rem 0 1rem;
  color: var(--omc-color-text-muted);
  font-size: 0.8rem;
}

.transactions-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.85rem;
  margin-top: 2rem;
}

.transactions-grid--ready {
  margin-top: 0;
}

.transaction-skeleton {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.transaction-skeleton .q-card__section {
  display: grid;
  gap: 1rem;
}

.transaction-skeleton__heading {
  display: grid;
  grid-template-columns: 2.75rem minmax(0, 1fr);
  align-items: center;
  gap: 0.8rem;
}

.transactions-state {
  display: grid;
  justify-items: center;
  margin-top: 2rem;
  padding: clamp(2.5rem, 9vw, 5rem) 1.5rem;
  border: 0.0625rem dashed var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface);
  text-align: center;
}

.transactions-state--compact {
  padding-block: 3rem;
}

.transactions-state__icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 50%;
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.transactions-state__icon--error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.transactions-state h2 {
  margin: 1rem 0 0;
  font-size: 1.2rem;
}

.transactions-state p {
  max-width: 31rem;
  margin: 0.45rem 0 1.25rem;
  color: var(--omc-color-text-muted);
}

.transition-dialog {
  width: min(29rem, calc(100vw - 2rem));
  border-radius: var(--omc-radius-xl);
}

.transition-dialog__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 1rem;
  padding: 1.5rem;
}

.transition-dialog__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
}

.transition-dialog__icon--skip {
  background: var(--omc-color-warning-soft);
  color: var(--omc-color-warning);
}

.transition-dialog__icon--cancel {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.transition-dialog__header h2,
.transition-dialog__header p {
  margin: 0;
}

.transition-dialog__header h2 {
  font-size: 1.2rem;
}

.transition-dialog__header p {
  margin-top: 0.4rem;
  color: var(--omc-color-text-muted);
  line-height: 1.5;
}

.transition-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0 1.5rem 1.25rem;
}

.transition-dialog__confirm--skip {
  background: var(--omc-color-warning);
  color: var(--omc-color-text-on-primary);
}

.transition-dialog__confirm--cancel {
  background: var(--omc-color-negative);
  color: var(--omc-color-text-on-primary);
}

@media (min-width: 42rem) {
  .transactions-page__content :deep(.page-header) {
    align-items: center;
    flex-direction: row;
  }

  .transactions-toolbar {
    grid-template-columns: minmax(15rem, 1fr) auto;
  }

  .transactions-period__value {
    flex: 0 0 12rem;
  }

  .transactions-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 72rem) {
  .transactions-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
