import { useMemo } from "react";
import { useLocation } from "react-router-dom";

export function useUrlParams(availableYears = [], availableQuarters = []) {
  const location = useLocation();

  const params = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return {
      yearParam: searchParams.get("year"),
      quarterParam: searchParams.get("quarter"),
      sortParam: searchParams.get("sort"),
      orderParam: searchParams.get("order"),
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

  return {
    ...params,
    selectedYear,
    selectedQuarter,
  };
}
