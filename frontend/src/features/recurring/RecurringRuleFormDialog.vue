<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="saving"
    :maximized="$q.screen.lt.sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="recurring-form-dialog">
      <q-card-section class="recurring-form-dialog__header">
        <div>
          <p class="recurring-form-dialog__eyebrow">
            {{
              rule
                ? t("recurring.form.editEyebrow")
                : t("recurring.form.createEyebrow")
            }}
          </p>
          <h2>
            {{
              rule
                ? t("recurring.form.editTitle")
                : t("recurring.form.createTitle")
            }}
          </h2>
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

      <q-form ref="form" class="recurring-form" @submit="submit">
        <q-card-section class="recurring-form-dialog__body">
          <q-banner
            v-if="error"
            dense
            rounded
            class="recurring-form-dialog__error"
            role="alert"
          >
            <template #avatar><q-icon name="error_outline" /></template>
            {{ error }}
          </q-banner>

          <section class="recurring-form__section">
            <div class="recurring-form__section-heading">
              <span>{{ t("recurring.form.sections.identity") }}</span>
            </div>

            <q-input
              v-model="name"
              outlined
              autofocus
              maxlength="120"
              counter
              :label="t('recurring.form.name')"
              :rules="nameRules"
              :disable="saving"
              @update:model-value="emit('clearError')"
            />

            <fieldset class="recurring-form__fieldset">
              <legend>{{ t("recurring.form.direction") }}</legend>
              <q-btn-toggle
                v-model="direction"
                spread
                no-caps
                unelevated
                :options="directionOptions"
                :disable="saving"
                class="recurring-form__toggle"
              />
            </fieldset>

            <q-select
              v-model="categoryId"
              outlined
              emit-value
              map-options
              options-dense
              :options="categoryOptions"
              :label="t('recurring.form.category')"
              :rules="categoryRules"
              :disable="saving"
              :no-option-label="t('recurring.form.noCompatibleCategories')"
            >
              <template #prepend><q-icon name="category" /></template>
            </q-select>

            <q-banner
              v-if="categoryOptions.length === 0"
              dense
              rounded
              class="recurring-form__category-notice"
            >
              <template #avatar><q-icon name="info_outline" /></template>
              {{ t("recurring.form.categoryRequiredForDirection") }}
              <template #action>
                <q-btn
                  v-close-popup
                  flat
                  dense
                  no-caps
                  color="primary"
                  :to="{ name: 'categories' }"
                  :label="t('recurring.form.manageCategories')"
                />
              </template>
            </q-banner>
          </section>

          <q-separator />

          <section class="recurring-form__section">
            <div class="recurring-form__section-heading">
              <span>{{ t("recurring.form.sections.amount") }}</span>
            </div>

            <fieldset class="recurring-form__fieldset">
              <legend>{{ t("recurring.form.amountMode") }}</legend>
              <q-btn-toggle
                v-model="amountMode"
                spread
                no-caps
                unelevated
                :options="amountModeOptions"
                :disable="saving"
                class="recurring-form__toggle"
              />
            </fieldset>

            <q-input
              v-if="amountMode === 'fixed'"
              v-model="fixedAmount"
              outlined
              inputmode="decimal"
              :label="t('recurring.form.fixedAmount')"
              :suffix="currency"
              :rules="fixedAmountRules"
              :disable="saving"
            >
              <template #prepend><q-icon name="payments" /></template>
            </q-input>

            <div v-else class="recurring-form__variable-amounts">
              <q-banner dense rounded class="recurring-form__amount-notice">
                <template #avatar><q-icon name="tune" /></template>
                {{ t("recurring.form.variableHelp") }}
              </q-banner>
              <q-input
                v-model="estimatedAmount"
                outlined
                inputmode="decimal"
                :label="t('recurring.form.estimatedAmount')"
                :suffix="currency"
                :rules="estimatedAmountRules"
                :disable="saving"
              />
              <div class="recurring-form__range">
                <q-input
                  v-model="minAmount"
                  outlined
                  inputmode="decimal"
                  :label="t('recurring.form.minAmount')"
                  :suffix="currency"
                  :rules="minAmountRules"
                  :disable="saving"
                />
                <q-input
                  v-model="maxAmount"
                  outlined
                  inputmode="decimal"
                  :label="t('recurring.form.maxAmount')"
                  :suffix="currency"
                  :rules="maxAmountRules"
                  :disable="saving"
                />
              </div>
            </div>
          </section>

          <q-separator />

          <section class="recurring-form__section">
            <div class="recurring-form__section-heading">
              <span>{{ t("recurring.form.sections.schedule") }}</span>
            </div>

            <div class="recurring-form__schedule-grid">
              <q-input
                v-model="dayOfMonth"
                outlined
                inputmode="numeric"
                :label="t('recurring.form.dayOfMonth')"
                :rules="dayRules"
                :disable="saving"
              >
                <template #prepend><q-icon name="event_repeat" /></template>
              </q-input>
              <q-input
                v-model="startsOn"
                outlined
                type="date"
                stack-label
                :label="t('recurring.form.startsOn')"
                :rules="startsOnRules"
                :disable="saving"
              />
              <q-input
                v-model="endsOn"
                outlined
                type="date"
                stack-label
                :label="t('recurring.form.endsOn')"
                :rules="endsOnRules"
                :disable="saving"
                clearable
              />
            </div>

            <q-input
              v-model="notes"
              outlined
              type="textarea"
              autogrow
              maxlength="2000"
              counter
              :label="t('recurring.form.notes')"
              :disable="saving"
            />
          </section>
        </q-card-section>

        <q-separator />

        <q-card-actions class="recurring-form-dialog__actions">
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
              rule ? t('recurring.form.save') : t('recurring.form.create')
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

import { useAuthStore } from "@/features/auth/authStore";
import type { Category } from "@/features/categories/types";

import { isValidDateInput, todayDateInput } from "./date";
import { isValidPositiveMoney, normalizeDecimalInput } from "./money";
import type {
  RecurringAmountMode,
  RecurringRule,
  RecurringRuleInput,
  TransactionDirection
} from "./types";

const props = defineProps<{
  modelValue: boolean;
  rule: RecurringRule | null;
  categories: Category[];
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [input: RecurringRuleInput];
  clearError: [];
}>();

const auth = useAuthStore();
const form = ref<QForm | null>(null);
const name = ref("");
const direction = ref<TransactionDirection>("expense");
const categoryId = ref<string | null>(null);
const amountMode = ref<RecurringAmountMode>("fixed");
const fixedAmount = ref("");
const estimatedAmount = ref("");
const minAmount = ref("");
const maxAmount = ref("");
const dayOfMonth = ref("1");
const startsOn = ref(todayDateInput());
const endsOn = ref<string | null>("");
const notes = ref("");
const $q = useQuasar();
const { t } = useI18n();

const currency = computed(() => auth.user?.currency ?? "BRL");
const directionOptions = computed(() => [
  {
    label: t("recurring.direction.expense"),
    value: "expense",
    icon: "north_east"
  },
  {
    label: t("recurring.direction.income"),
    value: "income",
    icon: "south_west"
  }
]);
const amountModeOptions = computed(() => [
  { label: t("recurring.amount.fixed"), value: "fixed" },
  { label: t("recurring.amount.variable"), value: "variable" }
]);
const compatibleCategories = computed(() =>
  props.categories.filter(category =>
    direction.value === "expense"
      ? category.kind === "expense" || category.kind === "both"
      : category.kind === "income" || category.kind === "both"
  )
);
const categoryOptions = computed(() =>
  compatibleCategories.value.map(category => ({
    label: category.name,
    value: category.id
  }))
);

const nameRules = [
  (value: string) =>
    value.trim().length > 0 || t("recurring.form.nameRequired"),
  (value: string) =>
    [...value.trim()].length <= 120 || t("recurring.form.nameTooLong")
];
const categoryRules = [
  (value: string | null) =>
    value !== null || t("recurring.form.categoryRequired")
];
const fixedAmountRules = [
  (value: string) =>
    isValidPositiveMoney(value) || t("recurring.form.amountInvalid")
];
const optionalMoneyRule = (value: string) =>
  value.trim().length === 0 ||
  isValidPositiveMoney(value) ||
  t("recurring.form.amountInvalid");
const estimatedAmountRules = [
  optionalMoneyRule,
  (value: string) => withinVariableRange(value)
];
const minAmountRules = [
  optionalMoneyRule,
  () => validMinimumMaximum(),
  () => withinVariableRange(estimatedAmount.value)
];
const maxAmountRules = [
  optionalMoneyRule,
  () => validMinimumMaximum(),
  () => withinVariableRange(estimatedAmount.value)
];
const dayRules = [
  (value: string) => {
    const day = Number(value);
    return (
      (Number.isInteger(day) && day >= 1 && day <= 31) ||
      t("recurring.form.dayInvalid")
    );
  }
];
const startsOnRules = [
  (value: string) =>
    isValidDateInput(value) || t("recurring.form.dateRequired"),
  () => validDateRange()
];
const endsOnRules = [
  (value: string | null) =>
    value === null ||
    value.length === 0 ||
    isValidDateInput(value) ||
    t("recurring.form.dateInvalid"),
  () => validDateRange()
];

function numericValue(value: string) {
  const normalized = normalizeDecimalInput(value);
  return normalized === null ? null : Number(normalized);
}

function validMinimumMaximum() {
  const min = numericValue(minAmount.value);
  const max = numericValue(maxAmount.value);
  return min === null || max === null || min <= max
    ? true
    : t("recurring.form.rangeInvalid");
}

function withinVariableRange(value: string) {
  const estimated = numericValue(value);
  const min = numericValue(minAmount.value);
  const max = numericValue(maxAmount.value);

  if (estimated === null) {
    return true;
  }

  return (min === null || estimated >= min) &&
    (max === null || estimated <= max)
    ? true
    : t("recurring.form.estimatedOutsideRange");
}

function validDateRange() {
  return endsOn.value === null ||
    endsOn.value.length === 0 ||
    startsOn.value.length === 0 ||
    endsOn.value >= startsOn.value
    ? true
    : t("recurring.form.dateRangeInvalid");
}

watch(direction, () => {
  if (
    categoryId.value !== null &&
    !compatibleCategories.value.some(
      category => category.id === categoryId.value
    )
  ) {
    categoryId.value = null;
  }
});

watch(
  () => props.modelValue,
  open => {
    if (!open) {
      return;
    }

    const amount = props.rule?.amount;
    name.value = props.rule?.name ?? "";
    direction.value = props.rule?.direction ?? "expense";
    categoryId.value = props.rule?.categoryId ?? null;
    amountMode.value = amount?.mode ?? "fixed";
    fixedAmount.value = amount?.mode === "fixed" ? amount.amount : "";
    estimatedAmount.value =
      amount?.mode === "variable" ? (amount.estimated ?? "") : "";
    minAmount.value = amount?.mode === "variable" ? (amount.min ?? "") : "";
    maxAmount.value = amount?.mode === "variable" ? (amount.max ?? "") : "";
    dayOfMonth.value = String(props.rule?.dayOfMonth ?? 1);
    startsOn.value = props.rule?.startsOn ?? todayDateInput();
    endsOn.value = props.rule?.endsOn ?? "";
    notes.value = props.rule?.notes ?? "";
    form.value?.resetValidation();
    emit("clearError");
  }
);

function normalizedMoney(value: string) {
  return normalizeDecimalInput(value);
}

function submit() {
  if (categoryId.value === null) {
    return;
  }

  const amount =
    amountMode.value === "fixed"
      ? {
          mode: "fixed" as const,
          amount: normalizedMoney(fixedAmount.value) ?? ""
        }
      : {
          mode: "variable" as const,
          estimated: normalizedMoney(estimatedAmount.value),
          min: normalizedMoney(minAmount.value),
          max: normalizedMoney(maxAmount.value)
        };

  emit("submit", {
    categoryId: categoryId.value,
    name: name.value.trim(),
    direction: direction.value,
    amount,
    dayOfMonth: Number(dayOfMonth.value),
    startsOn: startsOn.value,
    endsOn: endsOn.value || null,
    notes: notes.value.trim() || null
  });
}
</script>

<style scoped lang="scss">
.recurring-form-dialog {
  display: flex;
  width: min(44rem, calc(100vw - 2rem));
  max-width: 44rem;
  max-height: min(92dvh, 58rem);
  flex-direction: column;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  box-shadow: var(--omc-shadow-md);
}

.recurring-form-dialog__header {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem;
}

.recurring-form-dialog__eyebrow,
.recurring-form-dialog h2 {
  margin: 0;
}

.recurring-form-dialog__eyebrow {
  margin-bottom: 0.35rem;
  color: var(--omc-color-primary);
  font-size: 0.72rem;
  font-weight: 750;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.recurring-form-dialog h2 {
  font-size: 1.4rem;
  font-weight: 740;
  letter-spacing: -0.025em;
}

.recurring-form {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
}

.recurring-form-dialog__body {
  display: grid;
  min-height: 0;
  gap: 1.5rem;
  overflow-y: auto;
  padding: 1.5rem;
}

.recurring-form-dialog__error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
  font-size: 0.86rem;
}

.recurring-form__section {
  display: grid;
  gap: 1.15rem;
}

.recurring-form__section-heading {
  color: var(--omc-color-text);
  font-size: 0.82rem;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.recurring-form__fieldset {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}

.recurring-form__fieldset legend {
  margin-bottom: 0.65rem;
  color: var(--omc-color-text-secondary);
  font-size: 0.8rem;
  font-weight: 680;
}

.recurring-form__toggle {
  overflow: hidden;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-surface-subtle);
  color: var(--omc-color-text-secondary);
}

.recurring-form__toggle :deep(.q-btn--active) {
  background: var(--omc-color-primary-soft) !important;
  color: var(--omc-color-primary) !important;
}

.recurring-form__category-notice,
.recurring-form__amount-notice {
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
  font-size: 0.82rem;
  line-height: 1.5;
}

.recurring-form__variable-amounts {
  display: grid;
  gap: 1rem;
}

.recurring-form__range,
.recurring-form__schedule-grid {
  display: grid;
  gap: 1rem;
}

.recurring-form-dialog__actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

.recurring-form-dialog__actions .q-btn {
  min-height: 2.75rem;
  padding-inline: 1.15rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

@media (min-width: 36rem) {
  .recurring-form__range {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .recurring-form__schedule-grid {
    grid-template-columns: 0.7fr 1fr 1fr;
  }
}

@media (max-width: 37.99rem) {
  .recurring-form-dialog {
    width: 100%;
    max-width: none;
    max-height: none;
    border: 0;
    border-radius: 0;
  }

  .recurring-form-dialog__header,
  .recurring-form-dialog__body {
    padding: 1.25rem;
  }
}
</style>
