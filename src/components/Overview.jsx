import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import Navbar from "./Navbar";
import SummaryCards from "./SummaryCards";
import TopLists from "./TopLists";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import { order, sorting } from "../utils/filterDefinitions";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

const DEFAULT_SORTING = cleanName(transliterate(sorting[0]));
const DEFAULT_ORDER = cleanName(transliterate(order[0]));

function Overview() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { allMoney, availableYears, pretprijatija } = useData();

  const currentLang = lang || "mk";

  const yearParam = new URLSearchParams(location.search).get("year");
  const quarterParam = new URLSearchParams(location.search).get("quarter");
  const sortingParam = new URLSearchParams(location.search).get("sort");
  const orderParam = new URLSearchParams(location.search).get("order");

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    if (!latestYear) return "";
    return !yearParam || parseInt(yearParam) === 0 ? latestYear : yearParam;
  }, [yearParam, availableYears]);

  const selectedQuarter = useMemo(() => {
    const q = quarterParam ? parseInt(quarterParam) : 0;
    return isNaN(q) ? 0 : q;
  }, [quarterParam]);

  const selectedSorting = useMemo(() => {
    return sortingParam || DEFAULT_SORTING;
  }, [sortingParam]);

  const selectedOrder = useMemo(() => {
    return orderParam || DEFAULT_ORDER;
  }, [orderParam]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }
    if (!availableYears.length) return;
    const params = new URLSearchParams();
    params.set("year", selectedYear);
    if (selectedQuarter !== 0) params.set("quarter", selectedQuarter.toString());
    if (selectedSorting !== DEFAULT_SORTING) params.set("sort", selectedSorting);
    if (selectedOrder !== DEFAULT_ORDER) params.set("order", selectedOrder);

    const targetPath = `/${currentLang}?${params.toString()}`;
    const currentPath = location.pathname + location.search;

    if (currentPath !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, { replace: true });
    }
  }, [currentLang, selectedYear, selectedQuarter, selectedSorting, selectedOrder, navigate, location.pathname, location.search, availableYears]);

  const filteredMoney = useMemo(() => {
    if (!selectedYear) return [];
    if (parseInt(selectedQuarter) !== 0) {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    return money;
  }, [money, selectedQuarter, selectedYear]);

  const topLists = useMemo(() => {
    if (!filteredMoney || filteredMoney.length === 0)
      return {
        expenses: [],
        worstExpenses: [],
        income: [],
        worstIncome: [],
        result: [],
        worstResult: [],
      };
    const map = {};
    filteredMoney.forEach((m) => {
      const name = m.Назив;
      if (!map[name]) map[name] = { expense: 0, income: 0, result: 0 };
      map[name].expense += formatDecimalNumber(m.Расходи);
      map[name].income += formatDecimalNumber(m.Приходи);
      map[name].result += formatDecimalNumber(m["Финансиски резултат"]);
    });
    const toArray = (field) =>
      Object.entries(map).map(([name, v]) => [name, v[field]]);
    const sortDesc = (arr) => arr.sort((a, b) => b[1] - a[1]).slice(0, 5);
    const sortAsc = (arr) => arr.sort((a, b) => a[1] - b[1]).slice(0, 5);
    return {
      expenses: sortDesc(toArray("expense")),
      worstExpenses: sortAsc(toArray("expense")),
      income: sortDesc(toArray("income")),
      worstIncome: sortAsc(toArray("income")),
      result: sortDesc(toArray("result")),
      worstResult: sortAsc(toArray("result")),
    };
  }, [filteredMoney]);

  return (
    <>
      <Navbar showSortingFilters={false} />
      <SummaryCards
        money={filteredMoney}
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
      />
      <TopLists
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        companies={pretprijatija}
        topExpenses={topLists.expenses}
        worstExpenses={topLists.worstExpenses}
        topIncome={topLists.income}
        worstIncome={topLists.worstIncome}
        topResult={topLists.result}
        worstResult={topLists.worstResult}
      />
    </>
  );
}

export default Overview;
