<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="saving"
    :maximized="$q.screen.lt.sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="transaction-form-dialog">
      <q-card-section class="transaction-form-dialog__header">
        <div>
          <p>{{
            t(
              transaction
                ? "transactions.form.editEyebrow"
                : "transactions.form.createEyebrow"
            )
          }}</p>
          <h2>{{
            t(
              transaction
                ? "transactions.form.editTitle"
                : "transactions.form.createTitle"
            )
          }}</h2>
        </div>
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          :disable="saving"
          :aria-label="t('common.close')"
        />
      </q-card-section>

      <q-separator />

      <q-form ref="form" @submit="submit">
        <q-card-section class="transaction-form-dialog__body">
          <q-banner
            v-if="error"
            dense
            rounded
            class="transaction-form-dialog__error"
            role="alert"
          >
            <template #avatar><q-icon name="error_outline" /></template>
            {{ error }}
          </q-banner>

          <fieldset class="transaction-form-dialog__fieldset">
            <legend>{{ t("transactions.form.direction") }}</legend>
            <q-btn-toggle
              v-model="direction"
              spread
              no-caps
              unelevated
              :options="directionOptions"
              :disable="saving"
              class="transaction-form-dialog__toggle"
            />
          </fieldset>

          <q-select
            v-model="categoryId"
            outlined
            emit-value
            map-options
            options-dense
            :options="categoryOptions"
            :label="t('transactions.form.category')"
            :rules="categoryRules"
            :disable="saving"
            :no-option-label="t('transactions.form.noCompatibleCategories')"
          >
            <template #prepend><q-icon name="category" /></template>
          </q-select>

          <q-banner
            v-if="categoryOptions.length === 0"
            dense
            rounded
            class="transaction-form-dialog__notice"
          >
            <template #avatar><q-icon name="info_outline" /></template>
            {{ t("transactions.form.categoryRequiredForDirection") }}
            <template #action>
              <q-btn
                v-close-popup
                flat
                dense
                no-caps
                color="primary"
                :to="{ name: 'categories' }"
                :label="t('transactions.form.manageCategories')"
              />
            </template>
          </q-banner>

          <q-input
            v-model="description"
            outlined
            autofocus
            maxlength="160"
            counter
            :label="t('transactions.form.description')"
            :rules="descriptionRules"
            :disable="saving"
            @update:model-value="emit('clearError')"
          >
            <template #prepend><q-icon name="subject" /></template>
          </q-input>

          <div class="transaction-form-dialog__row">
            <q-input
              v-model="amount"
              outlined
              inputmode="decimal"
              :label="t('transactions.form.amount')"
              :suffix="currency"
              :rules="amountRules"
              :disable="saving"
            >
              <template #prepend><q-icon name="payments" /></template>
            </q-input>
            <AppDateTimeField
              v-model="occurredAt"
              :label="t('transactions.form.occurredAt')"
              :rules="occurredAtRules"
              :disable="saving"
            />
          </div>

          <q-input
            v-model="notes"
            outlined
            type="textarea"
            autogrow
            maxlength="2000"
            counter
            :label="t('transactions.form.notes')"
            :disable="saving"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions class="transaction-form-dialog__actions">
          <q-btn
            v-close-popup
            flat
            no-caps
            :label="t('common.cancel')"
            :disable="saving"
          />
          <q-btn
            unelevated
            no-caps
            type="submit"
            color="primary"
            :label="
              t(
                transaction
                  ? 'transactions.form.save'
                  : 'transactions.form.create'
              )
            "
            :loading="saving"
            :disable="saving || categoryOptions.length === 0"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar, type QForm } from "quasar";

import AppDateTimeField from "@/components/AppDateTimeField.vue";
import { useAuthStore } from "@/features/auth/authStore";
import type { Category } from "@/features/categories/types";
import {
  isValidPositiveMoney,
  normalizeDecimalInput
} from "@/features/recurring/money";
import type { TransactionDirection } from "@/features/recurring/types";

import {
  isValidDateTimeInput,
  nowDateTimeInput,
  toDateTimeInput,
  toRfc3339
} from "./datetime";
import type { ManualTransactionInput, Transaction } from "./types";

const props = defineProps<{
  modelValue: boolean;
  transaction: Transaction | null;
  initialOccurredAt: string | null;
  categories: Category[];
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [input: ManualTransactionInput];
  clearError: [];
}>();

const auth = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();
const form = ref<QForm | null>(null);
const direction = ref<TransactionDirection>("expense");
const categoryId = ref<string | null>(null);
const description = ref("");
const amount = ref("");
const occurredAt = ref(nowDateTimeInput());
const notes = ref("");

const currency = computed(() => auth.user?.currency ?? "BRL");
const directionOptions = computed(() => [
  {
    label: t("transactions.direction.expense"),
    value: "expense",
    icon: "north_east"
  },
  {
    label: t("transactions.direction.income"),
    value: "income",
    icon: "south_west"
  }
]);
const categoryOptions = computed(() =>
  props.categories
    .filter(
      category => category.kind === direction.value || category.kind === "both"
    )
    .map(category => ({ label: category.name, value: category.id }))
);
const descriptionRules = [
  (value: string) =>
    value.trim().length > 0 || t("transactions.form.descriptionRequired"),
  (value: string) =>
    value.trim().length <= 160 || t("transactions.form.descriptionTooLong")
];
const categoryRules = [
  (value: string | null) =>
    value !== null || t("transactions.form.categoryRequired")
];
const amountRules = [
  (value: string) =>
    isValidPositiveMoney(value) || t("transactions.form.amountInvalid")
];
const occurredAtRules = [
  (value: string) =>
    isValidDateTimeInput(value) || t("transactions.form.dateInvalid")
];

watch(direction, () => {
  if (
    !categoryOptions.value.some(option => option.value === categoryId.value)
  ) {
    categoryId.value = categoryOptions.value[0]?.value ?? null;
  }
  emit("clearError");
});

watch(
  () => [props.modelValue, props.transaction] as const,
  ([open, transaction]) => {
    if (!open) return;

    direction.value = transaction?.direction ?? "expense";
    categoryId.value = transaction?.categoryId ?? null;
    description.value = transaction?.description ?? "";
    amount.value = transaction?.actualAmount ?? "";
    occurredAt.value = transaction?.occurredAt
      ? toDateTimeInput(transaction.occurredAt)
      : (props.initialOccurredAt ?? nowDateTimeInput());
    notes.value = transaction?.notes ?? "";
    form.value?.resetValidation();
  },
  { immediate: true }
);

async function submit() {
  if (!(await form.value?.validate()) || categoryId.value === null) return;

  const normalizedAmount = normalizeDecimalInput(amount.value);
  if (normalizedAmount === null) return;

  emit("submit", {
    categoryId: categoryId.value,
    direction: direction.value,
    description: description.value.trim(),
    amount: normalizedAmount,
    occurredAt: toRfc3339(occurredAt.value),
    notes: notes.value.trim()
  });
}
</script>

<style scoped lang="scss">
.transaction-form-dialog {
  width: min(43rem, calc(100vw - 2rem));
  max-width: 43rem;
  border-radius: var(--omc-radius-xl);
}

.transaction-form-dialog__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.transaction-form-dialog__header p,
.transaction-form-dialog__header h2 {
  margin: 0;
}

.transaction-form-dialog__header p {
  color: var(--omc-color-primary);
  font-size: 0.75rem;
  font-weight: 720;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.transaction-form-dialog__header h2 {
  margin-top: 0.3rem;
  font-size: 1.45rem;
}

.transaction-form-dialog__body {
  display: grid;
  gap: 1.2rem;
  max-height: min(70vh, 46rem);
  overflow-y: auto;
  padding: 1.5rem;
}

.transaction-form-dialog__error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.transaction-form-dialog__notice {
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
}

.transaction-form-dialog__fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.transaction-form-dialog__fieldset legend {
  margin-bottom: 0.55rem;
  color: var(--omc-color-text-secondary);
  font-size: 0.78rem;
  font-weight: 650;
}

.transaction-form-dialog__toggle {
  width: 100%;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface-subtle);
  color: var(--omc-color-text-secondary);
}

.transaction-form-dialog__toggle :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.transaction-form-dialog__row {
  display: grid;
  gap: 1.2rem;
}

.transaction-form-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

@media (min-width: 40rem) {
  .transaction-form-dialog__row {
    grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr);
  }
}

@media (max-width: 37.49rem) {
  .transaction-form-dialog {
    width: 100%;
    max-width: none;
    border-radius: 0;
  }

  .transaction-form-dialog__body {
    max-height: none;
  }
}
</style>
