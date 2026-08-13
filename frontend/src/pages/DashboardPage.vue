<template>
  <q-page class="dashboard-page">
    <div class="dashboard-page__content">
      <AppPageHeader
        :eyebrow="t('dashboard.greeting', { name: firstName })"
        :title="t('dashboard.title')"
        :subtitle="t('dashboard.subtitle')"
      >
        <div class="dashboard-period">
          <q-btn
            flat
            round
            dense
            icon="chevron_left"
            :disable="loading"
            :aria-label="t('dashboard.month.previous')"
            @click="changeRange(-1)"
          />
          <div>
            <span>{{ t("dashboard.month.eyebrow") }}</span>
            <strong>{{ periodLabel }}</strong>
          </div>
          <q-btn
            flat
            round
            dense
            icon="chevron_right"
            :disable="loading"
            :aria-label="t('dashboard.month.next')"
            @click="changeRange(1)"
          />
          <AppMonthField
            v-model="startMonth"
            class="dashboard-period__picker"
            :label="t('dashboard.month.start')"
            :disable="loading"
            @update:model-value="normalizeRange('start')"
          />
          <AppMonthField
            v-model="endMonth"
            class="dashboard-period__picker"
            :label="t('dashboard.month.end')"
            :disable="loading"
            @update:model-value="normalizeRange('end')"
          />
        </div>
      </AppPageHeader>

      <section
        v-if="loadStatus === 'loading'"
        class="dashboard-loading"
        :aria-label="t('common.loading')"
        aria-busy="true"
      >
        <div class="dashboard-summary">
          <q-card
            v-for="index in 5"
            :key="index"
            flat
            class="dashboard-metric dashboard-metric--skeleton"
            ><q-skeleton type="text" width="55%" /><q-skeleton
              type="text"
              width="75%"
              height="2rem"
          /></q-card>
        </div>
        <div class="dashboard-loading__charts"
          ><q-skeleton type="rect" height="20rem" /><q-skeleton
            type="rect"
            height="20rem"
        /></div>
      </section>

      <section v-else-if="loadStatus === 'error'" class="dashboard-state">
        <div class="dashboard-state__icon dashboard-state__icon--error"
          ><q-icon name="cloud_off" size="1.8rem"
        /></div>
        <h2>{{ t("dashboard.loadError.title") }}</h2>
        <p>{{ t("dashboard.loadError.description") }}</p>
        <q-btn
          outline
          no-caps
          color="primary"
          icon="refresh"
          :label="t('common.retry')"
          @click="loadDashboard"
        />
      </section>

      <template v-else-if="dashboard">
        <section
          class="dashboard-summary"
          :aria-label="t('dashboard.summaryLabel')"
        >
          <q-card
            v-for="metric in metrics"
            :key="metric.label"
            flat
            class="dashboard-metric"
            :class="metric.className"
          >
            <div class="dashboard-metric__icon" aria-hidden="true"
              ><q-icon :name="metric.icon" size="1.3rem"
            /></div>
            <div class="dashboard-metric__content">
              <p>{{ metric.label }}</p>
              <strong>{{ metric.value }}</strong>
              <span>{{ metric.caption }}</span>
            </div>
          </q-card>
        </section>

        <q-banner
          v-if="!dashboard.summary.projectionComplete"
          dense
          rounded
          class="dashboard-notice dashboard-notice--warning"
        >
          <template #avatar><q-icon name="warning_amber" /></template>
          {{
            t("dashboard.projection.incomplete", { count: unestimatedCount })
          }}
        </q-banner>
        <q-banner
          v-if="overdueCount > 0"
          dense
          rounded
          class="dashboard-notice dashboard-notice--negative"
        >
          <template #avatar><q-icon name="notification_important" /></template>
          {{ t("dashboard.overdue.notice", { count: overdueCount }) }}
          <template #action
            ><q-btn
              flat
              dense
              no-caps
              :to="{
                name: 'transactions',
                query: {
                  overdue: '1',
                  sort_order: 'asc',
                  start_month: startMonth,
                  end_month: endMonth
                }
              }"
              :label="t('dashboard.actions.review')"
          /></template>
        </q-banner>

        <DashboardCharts
          :summary="dashboard.summary"
          :spending="dashboard.spendingByCategory"
          class="dashboard-section"
        />

        <div class="dashboard-details dashboard-section">
          <section class="dashboard-panel">
            <header class="dashboard-panel__header">
              <div
                ><h2>{{ t("dashboard.spending.title") }}</h2
                ><p>{{ t("dashboard.spending.description") }}</p></div
              >
            </header>
            <div
              v-if="dashboard.spendingByCategory.length"
              class="dashboard-category-list"
            >
              <div
                v-for="item in dashboard.spendingByCategory"
                :key="item.category.id"
                class="dashboard-category-row"
              >
                <div
                  class="dashboard-category-row__icon"
                  :class="`category-color--${item.category.color ?? 'neutral'}`"
                  ><q-icon :name="item.category.icon ?? 'category'"
                /></div>
                <div class="dashboard-category-row__identity"
                  ><strong>{{ item.category.name }}</strong
                  ><span>{{
                    t("dashboard.spending.counts", {
                      paid: item.paidCount,
                      pending: item.pendingCount
                    })
                  }}</span></div
                >
                <div class="dashboard-category-row__amount"
                  ><strong>{{ money(item.projectedAmount) }}</strong
                  ><span>{{ t("dashboard.spending.projected") }}</span></div
                >
              </div>
            </div>
            <p v-else class="dashboard-panel__empty">{{
              t("dashboard.spending.empty")
            }}</p>
          </section>

          <section class="dashboard-panel">
            <header
              class="dashboard-panel__header dashboard-panel__header--action"
            >
              <div
                ><h2>{{ t("dashboard.pending.title") }}</h2
                ><p>{{ t("dashboard.pending.description") }}</p></div
              >
              <q-btn
                flat
                dense
                no-caps
                color="primary"
                :to="{ name: 'transactions' }"
                :label="t('dashboard.actions.viewAll')"
              />
            </header>
            <div v-if="dashboard.pending.length" class="dashboard-item-list">
              <div
                v-for="item in dashboard.pending"
                :key="item.id"
                class="dashboard-item"
              >
                <div
                  class="dashboard-item__icon"
                  :class="`category-color--${item.category.color ?? 'neutral'}`"
                  ><q-icon :name="item.category.icon ?? 'category'"
                /></div>
                <div class="dashboard-item__identity"
                  ><strong>{{ item.description }}</strong
                  ><span :class="{ 'dashboard-item__overdue': item.overdue }">{{
                    pendingDate(item)
                  }}</span></div
                >
                <strong
                  class="dashboard-item__amount"
                  :class="`dashboard-item__amount--${item.direction}`"
                  >{{
                    signedMoney(item.expectedAmount, item.direction)
                  }}</strong
                >
              </div>
            </div>
            <p v-else class="dashboard-panel__empty">{{
              t("dashboard.pending.empty")
            }}</p>
          </section>
        </div>

        <section class="dashboard-panel dashboard-section">
          <header
            class="dashboard-panel__header dashboard-panel__header--action"
          >
            <div
              ><h2>{{ t("dashboard.activity.title") }}</h2
              ><p>{{ t("dashboard.activity.description") }}</p></div
            >
            <q-btn
              flat
              dense
              no-caps
              color="primary"
              :to="{ name: 'transactions' }"
              :label="t('dashboard.actions.viewAll')"
            />
          </header>
          <div
            v-if="dashboard.recentActivity.length"
            class="dashboard-activity"
          >
            <div
              v-for="item in dashboard.recentActivity"
              :key="item.id"
              class="dashboard-item"
            >
              <div
                class="dashboard-item__icon"
                :class="`category-color--${item.category.color ?? 'neutral'}`"
                ><q-icon :name="item.category.icon ?? 'category'"
              /></div>
              <div class="dashboard-item__identity"
                ><strong>{{ item.description }}</strong
                ><span
                  >{{ item.category.name }} ·
                  {{ formatDate(item.occurredAt) }}</span
                ></div
              >
              <strong
                class="dashboard-item__amount"
                :class="`dashboard-item__amount--${item.direction}`"
                >{{ signedMoney(item.amount, item.direction) }}</strong
              >
            </div>
          </div>
          <p v-else class="dashboard-panel__empty">{{
            t("dashboard.activity.empty")
          }}</p>
        </section>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute, useRouter } from "vue-router";

import AppMonthField from "@/components/AppMonthField.vue";
import AppPageHeader from "@/components/AppPageHeader.vue";
import { useAppLocale } from "@/composables/useAppLocale";
import { useFinancialFormat } from "@/composables/useFinancialFormat";
import { useAuthStore } from "@/features/auth/authStore";
import DashboardCharts from "@/features/dashboard/DashboardCharts.vue";
import { fetchDashboard } from "@/features/dashboard/api";
import type {
  Dashboard,
  DashboardPendingItem
} from "@/features/dashboard/types";
import { decimalToNumber } from "@/features/recurring/money";
import type { TransactionDirection } from "@/features/recurring/types";
import {
  currentMonth,
  formatMonthRange,
  shiftMonth
} from "@/features/transactions/month";
import { isApiError } from "@/lib/api/errors";

type LoadStatus = "loading" | "ready" | "error";

const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { locale } = useAppLocale();
const { formatMoney, formatDate, formatDateOnly } = useFinancialFormat();
const initialMonth = currentMonth(auth.user?.timezone ?? "America/Sao_Paulo");
const startMonth = ref(initialMonth);
const endMonth = ref(initialMonth);
const dashboard = ref<Dashboard | null>(null);
const loadStatus = ref<LoadStatus>("loading");
let loadSequence = 0;

const loading = computed(() => loadStatus.value === "loading");
const firstName = computed(() => {
  const identity = auth.user?.displayName?.trim() || auth.user?.email || "";
  return identity.split(/[\s@]/u)[0] || identity;
});
const periodLabel = computed(() =>
  formatMonthRange(startMonth.value, endMonth.value, locale.value)
);
const unestimatedCount = computed(() =>
  dashboard.value
    ? dashboard.value.summary.pendingIncomeWithoutEstimate +
      dashboard.value.summary.pendingExpensesWithoutEstimate
    : 0
);
const overdueCount = computed(() =>
  dashboard.value
    ? dashboard.value.summary.overdueIncome +
      dashboard.value.summary.overdueExpenses
    : 0
);

function money(value: string) {
  return formatMoney(decimalToNumber(value));
}

function signedMoney(value: string | null, direction: TransactionDirection) {
  if (value === null) return t("dashboard.pending.noEstimate");
  return `${direction === "income" ? "+" : "−"}${money(value)}`;
}

function rate(value: string | null) {
  return value === null
    ? t("common.notAvailable")
    : `${Number(value).toLocaleString(locale.value, { maximumFractionDigits: 2 })}%`;
}

const metrics = computed(() => {
  if (!dashboard.value) return [];
  const summary = dashboard.value.summary;
  return [
    {
      label: t("dashboard.metrics.globalBalance"),
      icon: "savings",
      value: money(summary.globalBalance),
      caption: t("dashboard.metrics.globalBalanceCaption"),
      className: summary.globalBalance.startsWith("-")
        ? "dashboard-metric--negative"
        : "dashboard-metric--primary"
    },
    {
      label: t("dashboard.metrics.realBalance"),
      icon: "account_balance_wallet",
      value: money(summary.realBalance),
      caption: t("dashboard.metrics.savings", {
        rate: rate(summary.actualSavingsRatePercent)
      }),
      className: summary.realBalance.startsWith("-")
        ? "dashboard-metric--negative"
        : "dashboard-metric--primary"
    },
    {
      label: t("dashboard.metrics.incomeReceived"),
      icon: "south_west",
      value: money(summary.incomeReceived),
      caption: t("dashboard.metrics.pending", {
        amount: money(summary.pendingIncome)
      }),
      className: "dashboard-metric--positive"
    },
    {
      label: t("dashboard.metrics.expensesPaid"),
      icon: "north_east",
      value: money(summary.expensesPaid),
      caption: t("dashboard.metrics.pending", {
        amount: money(summary.pendingExpenses)
      }),
      className: "dashboard-metric--negative"
    },
    {
      label: t("dashboard.metrics.projectedBalance"),
      icon: "timeline",
      value: money(summary.projectedBalance),
      caption: summary.projectionComplete
        ? t("dashboard.metrics.projectedSavings", {
            rate: rate(summary.projectedSavingsRatePercent)
          })
        : t("dashboard.metrics.incomplete"),
      className: summary.projectedBalance.startsWith("-")
        ? "dashboard-metric--negative"
        : "dashboard-metric--info"
    }
  ];
});

function pendingDate(item: DashboardPendingItem) {
  if (item.dueDate === null) return t("dashboard.pending.noDate");
  return item.overdue
    ? t("dashboard.pending.overdue", { date: formatDateOnly(item.dueDate) })
    : t("dashboard.pending.due", { date: formatDateOnly(item.dueDate) });
}

async function redirectExpiredSession(error: unknown) {
  if (!isApiError(error) || error.code !== "UNAUTHORIZED") return false;
  auth.expireSession();
  await router.replace({ name: "login", query: { redirect: route.fullPath } });
  return true;
}

async function loadDashboard() {
  const sequence = ++loadSequence;
  loadStatus.value = "loading";
  try {
    const result = await fetchDashboard(startMonth.value, endMonth.value);
    if (sequence !== loadSequence) return;
    dashboard.value = result;
    loadStatus.value = "ready";
  } catch (error) {
    if (sequence !== loadSequence) return;
    if (!(await redirectExpiredSession(error))) loadStatus.value = "error";
  }
}

function changeRange(offset: number) {
  startMonth.value = shiftMonth(startMonth.value, offset);
  endMonth.value = shiftMonth(endMonth.value, offset);
  void loadDashboard();
}

function normalizeRange(changed: "start" | "end") {
  if (startMonth.value > endMonth.value) {
    if (changed === "start") endMonth.value = startMonth.value;
    else startMonth.value = endMonth.value;
  }
  void loadDashboard();
}

onMounted(() => void loadDashboard());
</script>

<style scoped lang="scss">
.dashboard-page {
  padding: clamp(1.25rem, 4vw, 2.5rem);
}
.dashboard-page__content {
  width: 100%;
  max-width: var(--omc-content-max-width);
  margin: 0 auto;
}
.dashboard-page__content :deep(.page-header) {
  align-items: flex-start;
  flex-direction: column;
}
.dashboard-period {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.25rem;
  padding: 0.4rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}
.dashboard-period > div {
  display: grid;
  min-width: 8rem;
}
.dashboard-period span {
  color: var(--omc-color-text-muted);
  font-size: 0.68rem;
}
.dashboard-period strong {
  font-size: 0.9rem;
}
.dashboard-period__picker {
  width: 10.5rem;
}
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-top: 2rem;
}
.dashboard-metric {
  display: flex;
  min-width: 0;
  gap: 0.8rem;
  padding: 1rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}
.dashboard-metric__icon {
  display: none;
  flex: 0 0 auto;
  width: 2.7rem;
  height: 2.7rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}
.dashboard-metric--positive .dashboard-metric__icon {
  background: var(--omc-color-positive-soft);
  color: var(--omc-color-positive);
}
.dashboard-metric--negative .dashboard-metric__icon {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.dashboard-metric--info .dashboard-metric__icon {
  background: var(--omc-color-info-soft);
  color: var(--omc-color-info);
}
.dashboard-metric__content {
  min-width: 0;
}
.dashboard-metric p,
.dashboard-metric strong,
.dashboard-metric span {
  margin: 0;
}
.dashboard-metric p {
  color: var(--omc-color-text-muted);
  font-size: 0.72rem;
}
.dashboard-metric strong {
  display: block;
  margin-top: 0.25rem;
  overflow: hidden;
  font-size: clamp(1.05rem, 4vw, 1.35rem);
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dashboard-metric span {
  display: block;
  margin-top: 0.25rem;
  color: var(--omc-color-text-muted);
  font-size: 0.68rem;
  line-height: 1.35;
}
.dashboard-notice {
  margin-top: 0.75rem;
  font-size: 0.8rem;
}
.dashboard-notice--warning {
  background: var(--omc-color-warning-soft);
  color: var(--omc-color-warning);
}
.dashboard-notice--negative {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.dashboard-section {
  margin-top: 1rem;
}
.dashboard-details {
  display: grid;
  gap: 1rem;
}
.dashboard-panel {
  min-width: 0;
  padding: 1.25rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}
.dashboard-panel__header {
  margin-bottom: 1rem;
}
.dashboard-panel__header--action {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.dashboard-panel h2,
.dashboard-panel p {
  margin: 0;
}
.dashboard-panel h2 {
  font-size: 1rem;
}
.dashboard-panel__header p {
  margin-top: 0.25rem;
  color: var(--omc-color-text-muted);
  font-size: 0.75rem;
}
.dashboard-category-list,
.dashboard-item-list,
.dashboard-activity {
  display: grid;
  gap: 0.15rem;
}
.dashboard-category-row,
.dashboard-item {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.75rem;
  padding: 0.7rem 0;
  border-bottom: 0.0625rem solid var(--omc-color-divider);
}
.dashboard-category-row:last-child,
.dashboard-item:last-child {
  border-bottom: 0;
}
.dashboard-category-row__icon,
.dashboard-item__icon {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: var(--omc-radius-sm);
  background: var(--omc-category-color-soft);
  color: var(--omc-category-color);
}
.dashboard-category-row__identity,
.dashboard-category-row__amount,
.dashboard-item__identity {
  display: grid;
  min-width: 0;
}
.dashboard-category-row strong,
.dashboard-item strong {
  overflow: hidden;
  font-size: 0.8rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.dashboard-category-row span,
.dashboard-item span {
  color: var(--omc-color-text-muted);
  font-size: 0.68rem;
}
.dashboard-category-row__amount {
  text-align: right;
}
.dashboard-item__amount {
  font-size: 0.82rem;
}
.dashboard-item__amount--income {
  color: var(--omc-color-positive);
}
.dashboard-item__amount--expense,
.dashboard-item__overdue {
  color: var(--omc-color-negative) !important;
}
.dashboard-panel__empty {
  padding: 2rem 0;
  color: var(--omc-color-text-muted);
  text-align: center;
}
.dashboard-state {
  display: grid;
  justify-items: center;
  margin-top: 2rem;
  padding: 4rem 1.5rem;
  border: 0.0625rem dashed var(--omc-color-border);
  border-radius: var(--omc-radius-xl);
  background: var(--omc-color-surface);
  text-align: center;
}
.dashboard-state__icon {
  display: grid;
  width: 3.5rem;
  height: 3.5rem;
  place-items: center;
  border-radius: 50%;
}
.dashboard-state__icon--error {
  background: var(--omc-color-negative-soft);
  color: var(--omc-color-negative);
}
.dashboard-state h2 {
  margin: 1rem 0 0;
  font-size: 1.2rem;
}
.dashboard-state p {
  margin: 0.4rem 0 1.2rem;
  color: var(--omc-color-text-muted);
}
.dashboard-loading__charts {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
}
.dashboard-loading__charts :deep(.q-skeleton) {
  border-radius: var(--omc-radius-lg);
}
.dashboard-metric--skeleton {
  display: grid;
}
@media (min-width: 40rem) {
  .dashboard-metric__icon {
    display: grid;
  }
  .dashboard-loading__charts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 52rem) {
  .dashboard-page__content :deep(.page-header) {
    align-items: center;
    flex-direction: row;
  }
  .dashboard-details {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (min-width: 75rem) {
  .dashboard-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  .dashboard-metric {
    padding: 1.2rem;
  }
}
</style>
