const monthPattern = /^(\d{4})-(\d{2})$/u;

export function isValidMonth(value: string) {
  const match = monthPattern.exec(value);

  return match !== null && Number(match[2]) >= 1 && Number(match[2]) <= 12;
}

export function currentMonth(timezone: string) {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      year: "numeric",
      month: "2-digit",
      timeZone: timezone
    }).formatToParts(new Date());
    const year = parts.find(part => part.type === "year")?.value;
    const month = parts.find(part => part.type === "month")?.value;

    if (year !== undefined && month !== undefined) {
      return `${year}-${month}`;
    }
  } catch {
    return localMonth();
  }

  return localMonth();
}

export function shiftMonth(value: string, offset: number) {
  const match = monthPattern.exec(value);

  if (match === null) {
    return value;
  }

  const date = new Date(
    Date.UTC(Number(match[1]), Number(match[2]) - 1 + offset, 1)
  );
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function formatMonth(value: string, locale: string) {
  const match = monthPattern.exec(value);

  if (match === null) {
    return value;
  }

  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));

  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      timeZone: "UTC"
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat("es", {
      year: "numeric",
      month: "long",
      timeZone: "UTC"
    }).format(date);
  }
}

export function dateTimeInputForMonth(value: string, current: string) {
  return value === current ? null : `${value}-01T12:00`;
}

function localMonth() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
