<template>
  <q-card
    flat
    class="transaction-card"
    :class="`transaction-card--${transaction.status}`"
  >
    <q-card-section class="transaction-card__content">
      <div class="transaction-card__topline">
        <div
          class="transaction-card__category-icon"
          :class="`category-color--${category?.color ?? 'neutral'}`"
          aria-hidden="true"
        >
          <q-icon :name="category?.icon ?? 'category'" size="1.3rem" />
        </div>
        <div class="transaction-card__identity">
          <div class="transaction-card__badges">
            <span
              class="transaction-card__status"
              :class="`transaction-card__status--${transaction.status}`"
            >
              {{ t(`transactions.status.${transaction.status}`) }}
            </span>
            <span
              v-if="transaction.recurringRuleId"
              class="transaction-card__source"
            >
              <q-icon name="event_repeat" aria-hidden="true" />
              {{ t("transactions.source.recurring") }}
            </span>
          </div>
          <h2>{{ transaction.description }}</h2>
        </div>

        <q-btn
          v-if="hasActions"
          flat
          round
          dense
          icon="more_vert"
          class="transaction-card__menu"
          :aria-label="
            t('transactions.actions.open', { name: transaction.description })
          "
        >
          <q-menu anchor="bottom right" self="top right">
            <q-list class="transaction-card__actions">
              <q-item
                v-if="canEdit"
                v-close-popup
                clickable
                @click="emit('edit', transaction)"
              >
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>{{
                  t("transactions.actions.edit")
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="canPay"
                v-close-popup
                clickable
                @click="emit('pay', transaction)"
              >
                <q-item-section avatar
                  ><q-icon name="task_alt"
                /></q-item-section>
                <q-item-section>{{
                  t("transactions.actions.pay")
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="canSkip"
                v-close-popup
                clickable
                @click="emit('skip', transaction)"
              >
                <q-item-section avatar
                  ><q-icon name="skip_next"
                /></q-item-section>
                <q-item-section>{{
                  t("transactions.actions.skip")
                }}</q-item-section>
              </q-item>
              <q-item
                v-if="canCancel"
                v-close-popup
                clickable
                class="transaction-card__cancel-action"
                @click="emit('cancel', transaction)"
              >
                <q-item-section avatar><q-icon name="block" /></q-item-section>
                <q-item-section>{{
                  t("transactions.actions.cancel")
                }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div
        class="transaction-card__amount"
        :class="`transaction-card__amount--${transaction.direction}`"
      >
        <strong>{{ signedAmount }}</strong>
        <span>{{ amountCaption }}</span>
      </div>

      <q-btn
        v-if="canPay"
        unelevated
        no-caps
        color="primary"
        icon="check"
        class="transaction-card__pay"
        :label="t('transactions.actions.confirmPayment')"
        @click="emit('pay', transaction)"
      />

      <q-separator />

      <dl class="transaction-card__details">
        <div>
          <dt><q-icon name="label_outline" aria-hidden="true" /></dt>
          <dd>{{ category?.name ?? t("transactions.categoryUnavailable") }}</dd>
        </div>
        <div>
          <dt><q-icon :name="dateIcon" aria-hidden="true" /></dt>
          <dd>{{ primaryDate }}</dd>
        </div>
        <div v-if="transaction.recurrencePeriod">
          <dt><q-icon name="calendar_view_month" aria-hidden="true" /></dt>
          <dd>{{
            t("transactions.period", {
              date: formatDateOnly(transaction.recurrencePeriod)
            })
          }}</dd>
        </div>
      </dl>

      <p v-if="transaction.notes" class="transaction-card__notes">{{
        transaction.notes
      }}</p>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useFinancialFormat } from "@/composables/useFinancialFormat";
import type { Category } from "@/features/categories/types";
import { decimalToNumber } from "@/features/recurring/money";

import type { Transaction } from "./types";

const props = defineProps<{
  transaction: Transaction;
  category: Category | null;
}>();

const emit = defineEmits<{
  edit: [transaction: Transaction];
  pay: [transaction: Transaction];
  skip: [transaction: Transaction];
  cancel: [transaction: Transaction];
}>();

const { t } = useI18n();
const { formatMoney, formatDate, formatDateOnly } = useFinancialFormat();

const canEdit = computed(
  () =>
    (props.transaction.status === "paid" ||
      props.transaction.status === "pending") &&
    props.transaction.recurringRuleId === null
);
const canPay = computed(() => props.transaction.status === "pending");
const canSkip = computed(
  () =>
    props.transaction.status === "pending" &&
    props.transaction.recurringRuleId !== null
);
const canCancel = computed(() => props.transaction.status === "pending");
const hasActions = computed(
  () => canEdit.value || canPay.value || canSkip.value || canCancel.value
);
const visibleAmount = computed(
  () => props.transaction.actualAmount ?? props.transaction.expectedAmount
);
const signedAmount = computed(() => {
  if (visibleAmount.value === null) return t("common.notAvailable");

  const formatted = formatMoney(decimalToNumber(visibleAmount.value));
  return props.transaction.direction === "income"
    ? `+${formatted}`
    : `−${formatted}`;
});
const amountCaption = computed(() =>
  props.transaction.actualAmount !== null
    ? t("transactions.amount.actual")
    : props.transaction.expectedAmount !== null
      ? t("transactions.amount.expected")
      : t("transactions.amount.pendingDefinition")
);
const dateIcon = computed(() =>
  props.transaction.status === "pending" ? "event" : "schedule"
);
const primaryDate = computed(() => {
  if (
    props.transaction.status === "pending" &&
    props.transaction.dueDate !== null
  ) {
    return t("transactions.date.due", {
      date: formatDateOnly(props.transaction.dueDate)
    });
  }

  if (props.transaction.occurredAt !== null) {
    return t("transactions.date.occurred", {
      date: formatDate(props.transaction.occurredAt)
    });
  }

  if (props.transaction.dueDate !== null) {
    return t("transactions.date.scheduled", {
      date: formatDateOnly(props.transaction.dueDate)
    });
  }

  return t("transactions.date.notRecorded");
});
</script>

<style scoped lang="scss">
.transaction-card {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.transaction-card:hover {
  border-color: var(--omc-color-primary);
  box-shadow: var(--omc-shadow-sm);
  transform: translateY(-0.125rem);
}

.transaction-card--skipped,
.transaction-card--cancelled {
  opacity: 0.78;
}

.transaction-card__content {
  padding: 1.2rem;
}

.transaction-card__topline {
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
}

.transaction-card__category-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-category-color-soft);
  color: var(--omc-category-color);
}

.transaction-card__identity {
  min-width: 0;
}

.transaction-card__badges {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
}

.transaction-card__status,
.transaction-card__source {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.68rem;
  font-weight: 720;
  line-height: 1.5;
}

.transaction-card__status--pending {
  color: var(--omc-color-warning);
}

.transaction-card__status--paid {
  color: var(--omc-color-positive);
}

.transaction-card__status--skipped,
.transaction-card__status--cancelled,
.transaction-card__source {
  color: var(--omc-color-text-muted);
}

.transaction-card h2 {
  margin: 0.25rem 0 0;
  overflow: hidden;
  color: var(--omc-color-text);
  font-size: 1rem;
  font-weight: 710;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transaction-card__menu {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--omc-color-text-muted);
}

.transaction-card__amount {
  display: grid;
  margin: 1.2rem 0 1rem;
}

.transaction-card__amount strong {
  font-size: 1.45rem;
  font-weight: 760;
  letter-spacing: -0.03em;
}

.transaction-card__amount--income strong {
  color: var(--omc-color-positive);
}

.transaction-card__amount--expense strong {
  color: var(--omc-color-negative);
}

.transaction-card__amount span {
  margin-top: 0.2rem;
  color: var(--omc-color-text-muted);
  font-size: 0.75rem;
}

.transaction-card__pay {
  width: 100%;
  min-height: 2.6rem;
  margin-bottom: 1rem;
  border-radius: var(--omc-radius-md);
  font-weight: 680;
}

.transaction-card__details {
  display: grid;
  gap: 0.55rem;
  margin: 0.9rem 0 0;
}

.transaction-card__details > div {
  display: grid;
  grid-template-columns: 1.25rem minmax(0, 1fr);
  align-items: center;
  gap: 0.4rem;
}

.transaction-card__details dt,
.transaction-card__details dd {
  margin: 0;
  color: var(--omc-color-text-muted);
  font-size: 0.75rem;
  line-height: 1.35;
}

.transaction-card__details dt {
  display: flex;
  font-size: 0.95rem;
}

.transaction-card__notes {
  display: -webkit-box;
  margin: 0.9rem 0 0;
  overflow: hidden;
  color: var(--omc-color-text-secondary);
  font-size: 0.76rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.transaction-card__actions {
  min-width: 12rem;
  padding: 0.5rem;
}

.transaction-card__actions .q-item {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-sm);
}

.transaction-card__cancel-action {
  color: var(--omc-color-negative);
}
</style>
