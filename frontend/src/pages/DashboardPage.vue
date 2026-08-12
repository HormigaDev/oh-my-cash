<template>
  <q-page class="dashboard-page">
    <div class="dashboard-page__content">
      <AppPageHeader
        :eyebrow="t('dashboard.greeting', { name: firstName })"
        :title="t('dashboard.title')"
        :subtitle="t('dashboard.subtitle')"
      />

      <section
        class="dashboard-summary"
        :aria-label="t('dashboard.summaryLabel')"
      >
        <q-card
          v-for="metric in metrics"
          :key="metric.labelKey"
          flat
          class="dashboard-metric"
        >
          <div class="dashboard-metric__icon" aria-hidden="true">
            <q-icon :name="metric.icon" size="1.35rem" />
          </div>
          <div>
            <p>{{ t(metric.labelKey) }}</p>
            <strong>{{ metric.value }}</strong>
          </div>
        </q-card>
      </section>

      <EmptyState
        icon="insights"
        :title="t('dashboard.empty.title')"
        :description="t('dashboard.empty.description')"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

import AppPageHeader from "@/components/AppPageHeader.vue";
import EmptyState from "@/components/EmptyState.vue";
import { useFinancialFormat } from "@/composables/useFinancialFormat";
import { useAuthStore } from "@/features/auth/authStore";

const auth = useAuthStore();
const { formatMoney } = useFinancialFormat();
const { t } = useI18n();

const firstName = computed(() => {
  const identity = auth.user?.displayName?.trim() || auth.user?.email || "";
  return identity.split(/[\s@]/u)[0] || identity;
});

const metrics = computed(() => [
  {
    labelKey: "dashboard.metrics.monthlyBalance" as const,
    icon: "account_balance_wallet",
    value: formatMoney(null)
  },
  {
    labelKey: "dashboard.metrics.income" as const,
    icon: "south_west",
    value: formatMoney(null)
  },
  {
    labelKey: "dashboard.metrics.expenses" as const,
    icon: "north_east",
    value: formatMoney(null)
  },
  {
    labelKey: "dashboard.metrics.projectedBalance" as const,
    icon: "timeline",
    value: formatMoney(null)
  }
]);
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

.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin: 2rem 0 1.25rem;
}

.dashboard-metric {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 0.85rem;
  padding: 1rem;
  border: 0.0625rem solid var(--omc-color-border);
  border-radius: var(--omc-radius-lg);
  background: var(--omc-color-surface);
}

.dashboard-metric__icon {
  display: none;
  flex: 0 0 auto;
  width: 2.75rem;
  height: 2.75rem;
  place-items: center;
  border-radius: var(--omc-radius-md);
  background: var(--omc-color-primary-soft);
  color: var(--omc-color-primary);
}

.dashboard-metric p,
.dashboard-metric strong {
  margin: 0;
}

.dashboard-metric p {
  overflow: hidden;
  color: var(--omc-color-text-muted);
  font-size: 0.75rem;
  line-height: 1.3;
  text-overflow: ellipsis;
}

.dashboard-metric strong {
  display: block;
  margin-top: 0.3rem;
  color: var(--omc-color-text);
  font-size: 1.35rem;
  font-weight: 720;
  letter-spacing: -0.02em;
}

@media (min-width: 40rem) {
  .dashboard-summary {
    gap: 1rem;
  }

  .dashboard-metric {
    padding: 1.25rem;
  }

  .dashboard-metric__icon {
    display: grid;
  }
}

@media (min-width: 75rem) {
  .dashboard-summary {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
