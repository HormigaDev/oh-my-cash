const fallbackCurrencyCodes = [
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "GBP",
  "GEL",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "INR",
  "IQD",
  "IRR",
  "ISK",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KMF",
  "KPW",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "PEN",
  "PGK",
  "PHP",
  "PKR",
  "PLN",
  "PYG",
  "QAR",
  "RON",
  "RSD",
  "RUB",
  "RWF",
  "SAR",
  "SBD",
  "SCR",
  "SDG",
  "SEK",
  "SGD",
  "SHP",
  "SLE",
  "SOS",
  "SRD",
  "SSP",
  "STN",
  "SVC",
  "SYP",
  "SZL",
  "THB",
  "TJS",
  "TMT",
  "TND",
  "TOP",
  "TRY",
  "TTD",
  "TWD",
  "TZS",
  "UAH",
  "UGX",
  "USD",
  "UYU",
  "UZS",
  "VES",
  "VND",
  "VUV",
  "WST",
  "XAF",
  "XCD",
  "XOF",
  "XPF",
  "YER",
  "ZAR",
  "ZMW",
  "ZWG"
] as const;

export const currencyCodes: readonly string[] = fallbackCurrencyCodes;

function resolveSymbol(currency: string) {
  try {
    const currencyPart = new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol"
    })
      .formatToParts(0)
      .find(part => part.type === "currency");
    return currencyPart?.value ?? currency;
  } catch {
    return currency;
  }
}

/** ISO 4217 identifier -> compact, human-readable monetary symbol. */
export const currencySymbols: Readonly<Record<string, string>> = Object.freeze(
  Object.fromEntries(currencyCodes.map(code => [code, resolveSymbol(code)]))
);

export function currencySymbol(currency: string | null | undefined) {
  const code = currency?.trim().toUpperCase() || "BRL";
  return currencySymbols[code] ?? resolveSymbol(code);
}

export function currencyName(currency: string, locale: string) {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "currency" }).of(currency) ??
      currency
    );
  } catch {
    return currency;
  }
}

export function formatCurrency(
  value: number,
  currency: string,
  locale: string
) {
  const symbol = currencySymbol(currency);
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol"
    })
      .formatToParts(value)
      .map(part => (part.type === "currency" ? symbol : part.value))
      .join("");
  } catch {
    return `${symbol} ${new Intl.NumberFormat("es", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(value)}`;
  }
}
