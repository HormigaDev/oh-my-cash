<template>
  <div class="dashboard-charts">
    <section class="dashboard-chart-card">
      <header>
        <div>
          <h2>{{ t("dashboard.charts.cashFlow.title") }}</h2>
          <p>{{ t("dashboard.charts.cashFlow.description") }}</p>
        </div>
      </header>
      <div
        class="dashboard-chart-card__canvas dashboard-chart-card__canvas--bar"
      >
        <canvas
          ref="cashFlowCanvas"
          :aria-label="t('dashboard.charts.cashFlow.label')"
          role="img"
        />
      </div>
    </section>

    <section class="dashboard-chart-card">
      <header>
        <div>
          <h2>{{ t("dashboard.charts.spending.title") }}</h2>
          <p>{{ t("dashboard.charts.spending.description") }}</p>
        </div>
      </header>
      <div v-if="chartSpending.length > 0" class="dashboard-chart-card__canvas">
        <canvas
          ref="spendingCanvas"
          :aria-label="t('dashboard.charts.spending.label')"
          role="img"
        />
      </div>
      <div v-else class="dashboard-chart-card__empty">
        <q-icon name="donut_large" size="2rem" aria-hidden="true" />
        <span>{{ t("dashboard.charts.spending.empty") }}</span>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch
} from "vue";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import {
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip,
  type ChartConfiguration
} from "chart.js";

import { useFinancialFormat } from "@/composables/useFinancialFormat";
import { decimalToNumber } from "@/features/recurring/money";

import type { CategorySpending, DashboardSummary } from "./types";

Chart.register(
  ArcElement,
  BarController,
  BarElement,
  CategoryScale,
  DoughnutController,
  Legend,
  LinearScale,
  Tooltip
);

const props = defineProps<{
  summary: DashboardSummary;
  spending: CategorySpending[];
}>();

const $q = useQuasar();
const { t } = useI18n();
const { formatMoney } = useFinancialFormat();
const cashFlowCanvas = ref<HTMLCanvasElement | null>(null);
const spendingCanvas = ref<HTMLCanvasElement | null>(null);
let cashFlowChart: Chart<"bar"> | null = null;
let spendingChart: Chart<"doughnut"> | null = null;
const chartSpending = computed(() =>
  props.spending.filter(item => decimalToNumber(item.projectedAmount) > 0)
);

function color(name: string) {
  return getComputedStyle(document.body).getPropertyValue(name).trim();
}

function categoryColor(value: string | null) {
  return color(`--omc-category-${value ?? "neutral"}`);
}

function cashFlowConfiguration(): ChartConfiguration<"bar"> {
  return {
    type: "bar",
    data: {
      labels: [
        t("dashboard.charts.cashFlow.income"),
        t("dashboard.charts.cashFlow.expenses")
      ],
      datasets: [
        {
          label: t("dashboard.charts.cashFlow.actual"),
          data: [
            decimalToNumber(props.summary.incomeReceived),
            decimalToNumber(props.summary.expensesPaid)
          ],
          backgroundColor: [
            color("--omc-color-positive"),
            color("--omc-color-negative")
          ],
          borderRadius: 8,
          borderSkipped: false
        },
        {
          label: t("dashboard.charts.cashFlow.projected"),
          data: [
            decimalToNumber(props.summary.projectedIncome),
            decimalToNumber(props.summary.projectedExpenses)
          ],
          backgroundColor: [
            color("--omc-color-positive-soft"),
            color("--omc-color-negative-soft")
          ],
          borderColor: [
            color("--omc-color-positive"),
            color("--omc-color-negative")
          ],
          borderWidth: 1,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 260 },
      plugins: {
        legend: {
          labels: {
            color: color("--omc-color-text-secondary"),
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          callbacks: {
            label: context =>
              `${context.dataset.label}: ${formatMoney(context.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: color("--omc-color-text-muted") },
          border: { display: false }
        },
        y: {
          beginAtZero: true,
          grid: { color: color("--omc-color-divider") },
          ticks: {
            color: color("--omc-color-text-muted"),
            callback: value => formatMoney(Number(value))
          },
          border: { display: false }
        }
      }
    }
  };
}

function spendingConfiguration(): ChartConfiguration<"doughnut"> {
  return {
    type: "doughnut",
    data: {
      labels: chartSpending.value.map(item => item.category.name),
      datasets: [
        {
          data: chartSpending.value.map(item =>
            decimalToNumber(item.projectedAmount)
          ),
          backgroundColor: chartSpending.value.map(item =>
            categoryColor(item.category.color)
          ),
          borderColor: color("--omc-color-surface"),
          borderWidth: 3,
          hoverOffset: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "68%",
      animation: { duration: 260 },
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: color("--omc-color-text-secondary"),
            usePointStyle: true,
            boxWidth: 8,
            padding: 16
          }
        },
        tooltip: {
          callbacks: {
            label: context => `${context.label}: ${formatMoney(context.parsed)}`
          }
        }
      }
    }
  };
}

async function renderCharts() {
  await nextTick();
  cashFlowChart?.destroy();
  spendingChart?.destroy();
  cashFlowChart = cashFlowCanvas.value
    ? new Chart(cashFlowCanvas.value, cashFlowConfiguration())
    : null;
  spendingChart =
    spendingCanvas.value && chartSpending.value.length > 0
      ? new Chart(spendingCanvas.value, spendingConfiguration())
      : null;
}

watch(
  () => [props.summary, props.spending, $q.dark.isActive],
  () => void renderCharts(),
  { deep: true }
);
onMounted(() => void renderCharts());
onBeforeUnmount(() => {
  cashFlowChart?.destroy();
  spendingChart?.destroy();
});
</script>

<style scoped lang="scss">
.dashboard-charts {
  display: grid;
  gap: 1rem;
}

.dashboard-chart-card {
  min-width: 0;
  padding: 1.25rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.dashboard-chart-card h2,
.dashboard-chart-card p {
  margin: 0;
}

.dashboard-chart-card h2 {
  font-size: 1rem;
  font-weight: 710;
}

.dashboard-chart-card p {
  margin-top: 0.25rem;
  color: var(--omc-color-text-muted);
  font-size: 0.76rem;
}

.dashboard-chart-card__canvas {
  position: relative;
  width: 100%;
  min-width: 0;
  height: 18rem;
  margin-top: 1rem;
  overflow: hidden;
}

.dashboard-chart-card__canvas canvas {
  display: block;
  max-width: 100%;
}

.dashboard-chart-card__canvas--bar {
  height: 16rem;
}

.dashboard-chart-card__empty {
  display: grid;
  height: 18rem;
  place-items: center;
  align-content: center;
  gap: 0.5rem;
  color: var(--omc-color-text-muted);
  text-align: center;
}

@media (min-width: 62rem) {
  .dashboard-charts {
    grid-template-columns: minmax(0, 1.25fr) minmax(20rem, 0.75fr);
  }
}
</style>
