import { order, sorting } from "./filterDefinitions";

export const DEFAULT_SORTING = sorting[0];
export const DEFAULT_ORDER = order[0];
export const ASCENDING_ORDER = order[1];
export const DEFAULT_CURRENCY = "MKD";

export function buildQuery(year, quarter, sort, orderParam, currentSearch = "") {
  const params = new URLSearchParams(currentSearch);
  params.delete("year");
  params.delete("quarter");
  params.delete("sort");
  params.delete("order");
  if (year) params.set("year", year);
  if (quarter && quarter !== 0) params.set("quarter", quarter.toString());
  if (sort && sort !== DEFAULT_SORTING) params.set("sort", sort);
  if (orderParam && orderParam !== DEFAULT_ORDER) params.set("order", orderParam);
  const sortedParams = new URLSearchParams();
  Array.from(params.keys()).sort().forEach((key) => {
    params.getAll(key).forEach((value) => sortedParams.append(key, value));
  });
  return sortedParams.toString();
}

export function parseYearParam(locationSearch, availableYears) {
  const params = new URLSearchParams(locationSearch);
  const yearParam = params.get("year");
  const latestYear = availableYears[0];
  if (!latestYear) return "";
  if (!yearParam || parseInt(yearParam, 10) === 0) return latestYear;
  return availableYears.includes(yearParam) ? yearParam : latestYear;
}

export function parseQuarterParam(locationSearch, availableQuarters) {
  const params = new URLSearchParams(locationSearch);
  const quarterParam = params.get("quarter");
  const q = quarterParam ? parseInt(quarterParam, 10) : 0;
  if (isNaN(q)) return 0;
  if (availableQuarters.length > 0 && !availableQuarters.includes(q)) return 0;
  return q;
}

export function parseSortingParam(locationSearch) {
  const params = new URLSearchParams(locationSearch);
  const sortingParam = params.get("sort");
  if (!sortingParam) return DEFAULT_SORTING;
  if (sorting.includes(sortingParam)) return sortingParam;
  return DEFAULT_SORTING;
}

export function parseOrderParam(locationSearch) {
  const params = new URLSearchParams(locationSearch);
  const orderParam = params.get("order");
  if (!orderParam) return DEFAULT_ORDER;
  if (order.includes(orderParam)) return orderParam;
  return DEFAULT_ORDER;
}

export function parseCurrencyParam(locationSearch) {
  const params = new URLSearchParams(locationSearch);
  const currencyParam = params.get("currency");
  if (!currencyParam) return DEFAULT_CURRENCY;
  if (["MKD", "EUR", "USD", "GBP"].includes(currencyParam)) return currencyParam;
  return DEFAULT_CURRENCY;
}

export function sortByField(items, getValue, direction) {
  return [...items].sort((a, b) => {
    const keyA = getValue(a);
    const keyB = getValue(b);
    if (keyA < keyB) return -1 * direction;
    if (keyA > keyB) return 1 * direction;
    return 0;
  });
}
