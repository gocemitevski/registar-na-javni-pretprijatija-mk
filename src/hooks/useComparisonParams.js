import { useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultComparisonYears } from "../utils/yearComparison";
import { buildComparisonQuery } from "../utils/url";
import { useUrlParams } from "./useUrlParams";

export function useComparisonParams(availableYears = [], allMoney = {}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCurrency } = useUrlParams([], []);

  const resolved = useMemo(() => {
    if (!availableYears.length) {
      return { baseYear: "", compareYear: "", selectedCurrency };
    }

    const defaults = getDefaultComparisonYears(availableYears, allMoney);
    const params = new URLSearchParams(location.search);
    const baseParam = params.get("base");
    const compareParam = params.get("compare");

    let baseYear = availableYears.includes(baseParam)
      ? baseParam
      : defaults.baseYear;
    let compareYear = availableYears.includes(compareParam)
      ? compareParam
      : defaults.compareYear;

    if (!availableYears.includes(baseYear)) baseYear = availableYears[0];
    if (!availableYears.includes(compareYear)) compareYear = availableYears[0];

    if (baseYear === compareYear) {
      const alternative = availableYears.find((year) => year !== baseYear);
      if (alternative) compareYear = alternative;
    }

    return { baseYear, compareYear, selectedCurrency };
  }, [availableYears, allMoney, location.search, selectedCurrency]);

  const setYears = useCallback(
    (baseYear, compareYear) => {
      const query = buildComparisonQuery(
        baseYear,
        compareYear,
        location.search,
      );
      const path = `${location.pathname}${query ? `?${query}` : ""}`;
      navigate(path, { replace: true, preventScrollReset: true });
    },
    [location.pathname, location.search, navigate],
  );

  return { ...resolved, setYears };
}
