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
  
  // Format as currency with MKD symbol and no decimals
  return new Intl.NumberFormat("mk-MK", {
    style: "currency",
    currency: "MKD",
    maximumFractionDigits: 0,
  }).format(num * 1000000);
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