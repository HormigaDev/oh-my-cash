<template>
  <q-dialog
    :model-value="modelValue"
    :persistent="saving"
    :maximized="$q.screen.lt.sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card class="pay-dialog">
      <q-card-section class="pay-dialog__header">
        <div class="pay-dialog__icon" aria-hidden="true">
          <q-icon name="task_alt" size="1.5rem" />
        </div>
        <div>
          <p>{{ t("transactions.pay.eyebrow") }}</p>
          <h2>{{ transaction?.description }}</h2>
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

      <q-form ref="form" @submit="submit">
        <q-card-section class="pay-dialog__body">
          <q-banner
            v-if="error"
            dense
            rounded
            class="pay-dialog__error"
            role="alert"
          >
            <template #avatar><q-icon name="error_outline" /></template>
            {{ error }}
          </q-banner>

          <q-banner dense rounded class="pay-dialog__notice">
            <template #avatar><q-icon name="tune" /></template>
            {{ t("transactions.pay.help") }}
          </q-banner>

          <q-input
            v-model="amount"
            outlined
            autofocus
            inputmode="decimal"
            :label="t('transactions.pay.amount')"
            :suffix="currency"
            :rules="amountRules"
            :disable="saving"
            @update:model-value="emit('clearError')"
          >
            <template #prepend><q-icon name="payments" /></template>
          </q-input>

          <q-input
            v-model="occurredAt"
            outlined
            type="datetime-local"
            stack-label
            :label="t('transactions.pay.occurredAt')"
            :rules="occurredAtRules"
            :disable="saving"
          />
        </q-card-section>

        <q-separator />

        <q-card-actions class="pay-dialog__actions">
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
            icon="check"
            :label="t('transactions.pay.confirm')"
            :loading="saving"
            :disable="saving"
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
import {
  isValidPositiveMoney,
  normalizeDecimalInput
} from "@/features/recurring/money";

import { isValidDateTimeInput, nowDateTimeInput, toRfc3339 } from "./datetime";
import type { PayTransactionInput, Transaction } from "./types";

const props = defineProps<{
  modelValue: boolean;
  transaction: Transaction | null;
  saving: boolean;
  error: string | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  submit: [input: PayTransactionInput];
  clearError: [];
}>();

const auth = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();
const form = ref<QForm | null>(null);
const amount = ref("");
const occurredAt = ref(nowDateTimeInput());

const currency = computed(() => auth.user?.currency ?? "BRL");
const amountRules = [
  (value: string) =>
    isValidPositiveMoney(value) || t("transactions.form.amountInvalid")
];
const occurredAtRules = [
  (value: string) =>
    isValidDateTimeInput(value) || t("transactions.form.dateInvalid")
];

watch(
  () => [props.modelValue, props.transaction] as const,
  ([open, transaction]) => {
    if (!open) return;

    amount.value = transaction?.expectedAmount ?? "";
    occurredAt.value = nowDateTimeInput();
    form.value?.resetValidation();
  }
);

async function submit() {
  if (!(await form.value?.validate())) return;

  const normalizedAmount = normalizeDecimalInput(amount.value);
  if (normalizedAmount === null) return;

  emit("submit", {
    amount: normalizedAmount,
    occurredAt: toRfc3339(occurredAt.value)
  });
}
</script>

<style scoped lang="scss">
.pay-dialog {
  width: min(32rem, calc(100vw - 2rem));
  max-width: 32rem;
  border-radius: var(--omc-radius-xl);
}

.pay-dialog__header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 0.9rem;
  padding: 1.5rem 1.5rem 1rem;
}

.pay-dialog__icon {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-positive-soft);
  color: var(--omc-color-positive);
}

.pay-dialog__header p,
.pay-dialog__header h2 {
  margin: 0;
}

.pay-dialog__header p {
  color: var(--omc-color-primary);
  font-size: 0.72rem;
  font-weight: 720;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.pay-dialog__header h2 {
  margin-top: 0.25rem;
  font-size: 1.2rem;
}

.pay-dialog__body {
  display: grid;
  gap: 1.1rem;
  padding: 1rem 1.5rem 1.5rem;
}

.pay-dialog__notice {
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
}

.pay-dialog__error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.pay-dialog__actions {
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
}

@media (max-width: 37.49rem) {
  .pay-dialog {
    width: 100%;
    max-width: none;
    border-radius: 0;
  }
}
</style>
