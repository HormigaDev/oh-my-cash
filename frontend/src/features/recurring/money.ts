const decimalPattern = /^\d+(?:[.,]\d{1,2})?$/u;
const maximumAmount = 999_999_999_999.99;

export function normalizeDecimalInput(value: string): string | null {
  const normalized = value.trim().replace(",", ".");

  if (normalized.length === 0) {
    return null;
  }

  return normalized;
}

export function isValidPositiveMoney(value: string): boolean {
  const normalized = normalizeDecimalInput(value);

  return (
    normalized !== null &&
    decimalPattern.test(value.trim()) &&
    Number(normalized) > 0 &&
    Number(normalized) <= maximumAmount
  );
}

export function decimalToNumber(value: string): number {
  return Number.parseFloat(value);
}
