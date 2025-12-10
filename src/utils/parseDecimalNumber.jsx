export function parseDecimalNumber(number) {
  return number
    ? new Intl.NumberFormat("mk-MK", {
        style: "currency",
        currency: "MKD",
        maximumFractionDigits: 0,
      }).format(
        Math.floor(
          1000000 * parseFloat(number.replace(".", "").replace(",", "."))
        )
      )
    : `Нема податоци`;
}
