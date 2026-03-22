import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import Navbar from "./Navbar";
import SummaryCards from "./SummaryCards";
import TopLists from "./TopLists";
import OverviewChart from "./OverviewChart";
import {
  formatDecimalNumber,
  sumDecimalNumbers,
} from "../utils/decimalNumbers";
import { buildQuery } from "../utils/url";
import { INCOME_COLOR, EXPENSES_COLOR, FINRESULT_COLOR } from "../utils/charts";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { CURRENCIES } from "../utils/currencies";
import { useUrlParams } from "../hooks/useUrlParams";

function Overview() {
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { allMoney, availableYears, pretprijatija } = useData();

  const quarters = useMemo(() => {
    return [...new Set((allMoney[availableYears[0]] || []).map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]))].filter((q) => q !== 0).sort((a, b) => a - b);
  }, [allMoney, availableYears]);

  const { selectedYear, selectedQuarter, selectedCurrency: currency } = useUrlParams(availableYears, quarters);

  const currentLang = lang || "mk";

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }
    if (!availableYears.length) return;

    const targetPath = `/${currentLang}?${buildQuery(selectedYear, selectedQuarter, null, null, location.search)}`;
    const currentPath = location.pathname + location.search;

    if (currentPath !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, { replace: true });
    }
  }, [
    currentLang,
    selectedYear,
    selectedQuarter,
    navigate,
    location.pathname,
    location.search,
    availableYears,
  ]);

  const filteredMoney = useMemo(() => {
    if (!selectedYear) return [];
    if (selectedQuarter !== 0) {
      return money.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter);
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
      const name = m[MONEY_SHEET_COLUMNS.NAME];
      if (!map[name]) map[name] = { expense: 0, income: 0, result: 0 };
      map[name].expense += formatDecimalNumber(m[MONEY_SHEET_COLUMNS.EXPENSES]);
      map[name].income += formatDecimalNumber(m[MONEY_SHEET_COLUMNS.INCOME]);
      map[name].result += formatDecimalNumber(m[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]);
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

  const chartData = useMemo(() => {
    if (!allMoney || Object.keys(allMoney).length === 0) return null;
    if (!selectedYear) return null;

    let allData = [];

    if (selectedQuarter > 0) {
      const yearData = allMoney[selectedYear] || [];
      allData = yearData.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter);
    } else if (selectedYear) {
      allData = allMoney[selectedYear] || [];
    } else {
      Object.values(allMoney).forEach((yearData) => {
        allData = allData.concat(yearData);
      });
    }

    const rate = CURRENCIES[currency]?.rate || 1;
    const totalIncome = sumDecimalNumbers(allData.map((d) => d[MONEY_SHEET_COLUMNS.INCOME])) * rate;
    const totalExpenses = sumDecimalNumbers(allData.map((d) => d[MONEY_SHEET_COLUMNS.EXPENSES])) * rate;
    const totalResult = sumDecimalNumbers(
      allData.map((d) => d[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
    ) * rate;

    return {
      labels: [
        t("cards.income"),
        t("cards.expenses"),
        t("cards.financial-result"),
      ],
      datasets: [
        {
          data: [totalIncome, totalExpenses, totalResult],
          backgroundColor: [
            INCOME_COLOR.bg,
            EXPENSES_COLOR.bg,
            FINRESULT_COLOR.bg,
          ],
          borderColor: [
            INCOME_COLOR.border,
            EXPENSES_COLOR.border,
            FINRESULT_COLOR.border,
          ],
          borderWidth: [2, 2, 0],
          dashedBarIndex: 2,
        },
      ],
    };
  }, [allMoney, selectedYear, selectedQuarter, t, currency]);

  return (
    <>
      <Navbar showSortingFilters={false} />
      <main className="vstack gap-0">
        <SummaryCards
          money={filteredMoney}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
        />
        {chartData && (
          <OverviewChart
            chartData={chartData}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter}
          />
        )}
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
      </main>
    </>
  );
}

export default Overview;
