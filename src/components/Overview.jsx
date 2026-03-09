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
  const {
    year,
    quarter,
    sorting: sortingParam,
    order: orderParam,
  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { allMoney, availableYears } = useData();

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    return year === undefined || parseInt(year) === 0 ? latestYear : year;
  }, [year, availableYears]);

  const selectedQuarter = useMemo(() => {
    return quarter ? parseInt(quarter) : 0;
  }, [quarter]);

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
    const targetPath = `/${selectedYear}/${selectedQuarter}/${selectedSorting}/${selectedOrder}`;

    if (location.pathname !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, { replace: true });
    }
  }, [
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
    navigate,
    location.pathname,
  ]);

  const filteredMoney = useMemo(() => {
    if (parseInt(selectedQuarter) !== 0) {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    return money;
  }, [money, selectedQuarter]);

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
