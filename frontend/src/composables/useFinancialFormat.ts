import { useI18n } from "vue-i18n";

import { useAuthStore } from "@/features/auth/authStore";

const defaultCurrency = "BRL";
const defaultLocale = "es";
const defaultTimezone = "America/Sao_Paulo";

export function useFinancialFormat() {
  const auth = useAuthStore();
  const { t } = useI18n();

  function formatMoney(value: number | null | undefined) {
    if (value === null || value === undefined) {
      return t("common.notAvailable");
    }

    const currency = auth.user?.currency ?? defaultCurrency;
    const locale = auth.user?.locale ?? defaultLocale;

    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency
      }).format(value);
    } catch {
      return new Intl.NumberFormat(defaultLocale, {
        style: "currency",
        currency: defaultCurrency
      }).format(value);
    }
  }

  function formatDate(value: Date | number | string | null | undefined) {
    if (value === null || value === undefined) {
      return t("common.notAvailable");
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return t("common.notAvailable");
    }

    try {
      return new Intl.DateTimeFormat(auth.user?.locale ?? defaultLocale, {
        dateStyle: "medium",
        timeZone: auth.user?.timezone ?? defaultTimezone
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat(defaultLocale, {
        dateStyle: "medium",
        timeZone: defaultTimezone
      }).format(date);
    }
  }

  function formatDateOnly(value: string | null | undefined) {
    if (value === null || value === undefined) {
      return t("common.notAvailable");
    }

    const match = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(value);

    if (match === null) {
      return t("common.notAvailable");
    }

    const date = new Date(
      Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    );

    try {
      return new Intl.DateTimeFormat(auth.user?.locale ?? defaultLocale, {
        dateStyle: "medium",
        timeZone: "UTC"
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat(defaultLocale, {
        dateStyle: "medium",
        timeZone: "UTC"
      }).format(date);
    }
  }

  return { formatMoney, formatDate, formatDateOnly };
}
