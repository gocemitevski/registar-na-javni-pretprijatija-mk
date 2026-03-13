import i18n from "../i18n/index.js";

export function parseDecimalNumber(number) {
  if (number == null) return "—";
  let num;
  if (typeof number === "string") {
    // Remove any currency symbols and spaces, then replace comma with dot for decimal
    const cleanNumber = number.replace(/[^\d,-.]/g, '').replace(',', '.');
    num = parseFloat(cleanNumber);
    if (isNaN(num)) return "—";
  } else {
    num = number;
  }
  if (isNaN(num)) return "—";
  
  // Format with MK locale decimal/thousand separators
  const formatted = new Intl.NumberFormat("mk-MK", {
    maximumFractionDigits: 0,
  }).format(num * 1000000);
  
  const currency = i18n.language === "en" ? "MKD" : "ден.";
  return `${formatted} ${currency}`;
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