import { CURRENCIES } from "./currencies";
import { DEFAULT_CURRENCY } from "./url";

export function parseDecimalNumber(number, lang, currency = DEFAULT_CURRENCY) {
  if (number == null) return "—";
  let num;
  if (typeof number === "string") {
    const cleanNumber = number.replace(/[^\d,-.]/g, "").replace(",", ".");
    num = parseFloat(cleanNumber);
    if (isNaN(num)) return "—";
  } else {
    num = number;
  }
  if (isNaN(num)) return "—";

  const rate = CURRENCIES[currency]?.rate || 1;
  const convertedValue = num * rate;

  const currencyConfig = CURRENCIES[currency] || CURRENCIES.MKD;
  const suffix =
    currency === "MKD"
      ? lang === "mk"
        ? " ден."
        : " MKD"
      : ` ${currencyConfig.symbol}`;

  return (
    new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(convertedValue * 1000000) + suffix
  );
}

export function formatDecimalNumber(number) {
  if (number == null) return 0;
  const result = parseFloat(number.toString().replace(",", "."));
  if (isNaN(result)) return 0;
  return result;
}

export function sumDecimalNumbers(array) {
  return array.reduce((a, b) => {
    const val = formatDecimalNumber(b);
    return a + (isNaN(val) ? 0 : val);
  }, 0);
}
