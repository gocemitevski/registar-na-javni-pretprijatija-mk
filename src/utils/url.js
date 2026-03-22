import { order, sorting } from "./filterDefinitions";

export const DEFAULT_SORTING = sorting[0];
export const DEFAULT_ORDER = order[0];
export const ASCENDING_ORDER = order[1];

export function buildQuery(year, quarter, sort, orderParam) {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (quarter && quarter !== 0) params.set("quarter", quarter.toString());
  if (sort && sort !== DEFAULT_SORTING) params.set("sort", sort);
  if (orderParam && orderParam !== DEFAULT_ORDER) params.set("order", orderParam);
  return params.toString();
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

export function sortByField(items, getValue, direction) {
  return [...items].sort((a, b) => {
    const keyA = getValue(a);
    const keyB = getValue(b);
    if (keyA < keyB) return -1 * direction;
    if (keyA > keyB) return 1 * direction;
    return 0;
  });
}
