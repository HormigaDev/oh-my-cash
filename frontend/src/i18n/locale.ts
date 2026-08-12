export const defaultAppLocale = "es";

const supportedAppLocales = new Set([defaultAppLocale]);

export function resolveAppLocale(locale: string | null | undefined) {
  if (locale === null || locale === undefined) {
    return defaultAppLocale;
  }

  const normalized = locale.trim().toLowerCase();
  const language = normalized.split("-")[0] ?? "";

  if (supportedAppLocales.has(normalized)) {
    return normalized;
  }

  if (supportedAppLocales.has(language)) {
    return language;
  }

  return defaultAppLocale;
}
