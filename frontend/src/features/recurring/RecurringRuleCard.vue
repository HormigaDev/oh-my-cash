<template>
  <q-card flat class="recurring-card">
    <q-card-section class="recurring-card__content">
      <div class="recurring-card__topline">
        <div
          class="recurring-card__direction-icon"
          :class="`recurring-card__direction-icon--${rule.direction}`"
          aria-hidden="true"
        >
          <q-icon
            :name="rule.direction === 'income' ? 'south_west' : 'north_east'"
            size="1.35rem"
          />
        </div>
        <div class="recurring-card__identity">
          <h2>{{ rule.name }}</h2>
          <span
            class="recurring-card__direction"
            :class="`recurring-card__direction--${rule.direction}`"
          >
            {{ t(`recurring.direction.${rule.direction}`) }}
          </span>
        </div>
        <q-btn
          flat
          round
          dense
          icon="more_vert"
          class="recurring-card__menu"
          :aria-label="t('recurring.actions.open', { name: rule.name })"
        >
          <q-menu anchor="bottom right" self="top right">
            <q-list class="recurring-card__actions">
              <q-item v-close-popup clickable @click="emit('edit', rule)">
                <q-item-section avatar><q-icon name="edit" /></q-item-section>
                <q-item-section>{{
                  t("recurring.actions.edit")
                }}</q-item-section>
              </q-item>
              <q-item
                v-close-popup
                clickable
                class="recurring-card__deactivate-action"
                @click="emit('deactivate', rule)"
              >
                <q-item-section avatar>
                  <q-icon name="event_busy" />
                </q-item-section>
                <q-item-section>
                  {{ t("recurring.actions.deactivate") }}
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>

      <div class="recurring-card__amount">
        <strong>{{ primaryAmount }}</strong>
        <span>{{ amountCaption }}</span>
      </div>

      <q-separator />

      <dl class="recurring-card__details">
        <div>
          <dt><q-icon name="calendar_month" aria-hidden="true" /></dt>
          <dd>
            {{ t("recurring.schedule.monthlyDay", { day: rule.dayOfMonth }) }}
          </dd>
        </div>
        <div>
          <dt><q-icon name="label_outline" aria-hidden="true" /></dt>
          <dd>{{ category?.name ?? t("recurring.categoryUnavailable") }}</dd>
        </div>
        <div>
          <dt><q-icon name="date_range" aria-hidden="true" /></dt>
          <dd>{{ validity }}</dd>
        </div>
      </dl>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import { useFinancialFormat } from "@/composables/useFinancialFormat";
import type { Category } from "@/features/categories/types";

import { decimalToNumber } from "./money";
import type { RecurringRule } from "./types";

const props = defineProps<{
  rule: RecurringRule;
  category: Category | null;
}>();

const emit = defineEmits<{
  edit: [rule: RecurringRule];
  deactivate: [rule: RecurringRule];
}>();

const { formatMoney, formatDateOnly } = useFinancialFormat();
const { t } = useI18n();

function money(value: string) {
  return formatMoney(decimalToNumber(value));
}

const primaryAmount = computed(() => {
  if (props.rule.amount.mode === "fixed") {
    return money(props.rule.amount.amount);
  }

  if (props.rule.amount.estimated !== null) {
    return money(props.rule.amount.estimated);
  }

  return t("recurring.amount.variable");
});

const amountCaption = computed(() => {
  const amount = props.rule.amount;

  if (amount.mode === "fixed") {
    return t("recurring.amount.fixed");
  }

  if (amount.min !== null && amount.max !== null) {
    return t("recurring.amount.range", {
      min: money(amount.min),
      max: money(amount.max)
    });
  }

  if (amount.min !== null) {
    return t("recurring.amount.from", { amount: money(amount.min) });
  }

  if (amount.max !== null) {
    return t("recurring.amount.upTo", { amount: money(amount.max) });
  }

  return t("recurring.amount.noRange");
});

const validity = computed(() => {
  const start = formatDateOnly(props.rule.startsOn);

  return props.rule.endsOn === null
    ? t("recurring.schedule.fromDate", { date: start })
    : t("recurring.schedule.dateRange", {
        start,
        end: formatDateOnly(props.rule.endsOn)
      });
});
</script>

<style scoped lang="scss">
.recurring-card {
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.recurring-card:hover {
  border-color: var(--omc-color-primary);
  box-shadow: var(--omc-shadow-sm);
  transform: translateY(-0.125rem);
}

.recurring-card__content {
  padding: 1.25rem;
}

.recurring-card__topline {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.recurring-card__direction-icon {
  display: grid;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
}

.recurring-card__direction-icon--income {
  background: var(--omc-color-positive-soft);
  color: var(--omc-color-positive);
}

.recurring-card__direction-icon--expense {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}

.recurring-card__identity {
  min-width: 0;
}

.recurring-card h2 {
  margin: 0;
  overflow: hidden;
  color: var(--omc-color-text);
  font-size: 1rem;
  font-weight: 710;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recurring-card__direction {
  display: inline-block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 650;
}

.recurring-card__direction--income {
  color: var(--omc-color-positive);
}

.recurring-card__direction--expense {
  color: var(--omc-color-negative);
}

.recurring-card__menu {
  flex: 0 0 auto;
  margin-left: auto;
  color: var(--omc-color-text-muted);
}

.recurring-card__amount {
  display: grid;
  margin: 1.35rem 0 1.1rem;
}

.recurring-card__amount strong {
  color: var(--omc-color-text);
  font-size: 1.55rem;
  font-weight: 750;
  letter-spacing: -0.03em;
}

.recurring-card__amount span {
  margin-top: 0.25rem;
  color: var(--omc-color-text-muted);
  font-size: 0.78rem;
}

.recurring-card__details {
  display: grid;
  gap: 0.6rem;
  margin: 1rem 0 0;
}

.recurring-card__details > div {
  display: grid;
  grid-template-columns: 1.35rem minmax(0, 1fr);
  align-items: center;
  gap: 0.45rem;
}

.recurring-card__details dt,
.recurring-card__details dd {
  margin: 0;
  color: var(--omc-color-text-muted);
  font-size: 0.76rem;
  line-height: 1.35;
}

.recurring-card__details dt {
  display: flex;
  font-size: 1rem;
}

.recurring-card__actions {
  min-width: 12rem;
  padding: 0.5rem;
}

.recurring-card__actions .q-item {
  min-height: 2.75rem;
  border-radius: var(--omc-radius-sm);
}

.recurring-card__deactivate-action {
  color: var(--omc-color-negative);
}
</style>
