export function parseDecimalNumber(number) {
  return number
    ? new Intl.NumberFormat("mk-MK", {
        style: "currency",
        currency: "MKD",
        maximumFractionDigits: 0,
      }).format(Math.floor(1000000 * number))
    : `Нема податоци`;
}

export function formatDecimalNumber(number) {
  return parseFloat(number?.toString().replace(",", "."));
}

export function sumDecimalNumbers(array) {
  return array.reduce((a, b) => {
    return formatDecimalNumber(a) + formatDecimalNumber(b);
  }, 0);
}
