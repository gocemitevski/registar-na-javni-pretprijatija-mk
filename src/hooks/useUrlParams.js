import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { DEFAULT_CURRENCY } from "../utils/url";

export function useUrlParams(availableYears = [], availableQuarters = []) {
  const location = useLocation();

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      yearParam: searchParams.get("year"),
      quarterParam: searchParams.get("quarter"),
      sortParam: searchParams.get("sort"),
      orderParam: searchParams.get("order"),
      currencyParam: searchParams.get("currency"),
    };
  }, [location.search]);

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    if (!latestYear) return "";
    if (!params.yearParam || parseInt(params.yearParam, 10) === 0) return latestYear;
    return availableYears.includes(params.yearParam) ? params.yearParam : latestYear;
  }, [params.yearParam, availableYears]);

  const selectedQuarter = useMemo(() => {
    const q = params.quarterParam ? parseInt(params.quarterParam, 10) : 0;
    if (isNaN(q)) return 0;
    if (availableQuarters.length > 0 && !availableQuarters.includes(q)) return 0;
    return q;
  }, [params.quarterParam, availableQuarters]);

  const selectedCurrency = useMemo(() => {
    if (!params.currencyParam) return DEFAULT_CURRENCY;
    if (["MKD", "EUR", "USD", "GBP"].includes(params.currencyParam)) return params.currencyParam;
    return DEFAULT_CURRENCY;
  }, [params.currencyParam]);

  return {
    ...params,
    selectedYear,
    selectedQuarter,
    selectedCurrency,
  };
}
