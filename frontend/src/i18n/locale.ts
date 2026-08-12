export const defaultAppLocale = "es";
export type AppLocale = "en" | "es" | "pt-BR";

const localeByLanguage: Readonly<Record<string, AppLocale>> = {
  en: "en",
  es: "es",
  pt: "pt-BR"
};

export function resolveAppLocale(locale: string | null | undefined) {
  if (locale === null || locale === undefined) {
    return defaultAppLocale;
  }

  const normalized = locale.trim().toLowerCase();
  const language = normalized.split("-")[0] ?? "";

  return localeByLanguage[normalized] ?? localeByLanguage[language] ?? defaultAppLocale;
}
