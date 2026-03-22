import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useData } from "../hooks/useData";
import { useUrlParams } from "../hooks/useUrlParams";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import Cards from "./Cards";

const FILTERS = {
  "positive-result": (c) => c.totalResult > 0,
  "income": (c) => c.totalIncome > 0,
  "earned-more": (c) => c.totalIncome > c.totalExpenses * 2,
  "negative-result": (c) => c.totalResult < 0,
  "no-income": (c) => c.totalIncome <= 0,
  "spent-more": (c) => c.totalIncome <= c.totalExpenses * 2,
};

function FilteredCompanies() {
  const { filter } = useParams();
  const { pretprijatija, allMoney, availableYears } = useData();

  const money = useMemo(() => {
    return allMoney[availableYears[0]] || [];
  }, [allMoney, availableYears]);

  const availableQuarters = useMemo(() => {
    return [...new Set(money.map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]))].filter((q) => q !== 0).sort((a, b) => a - b);
  }, [money]);

  const { selectedYear, selectedQuarter } = useUrlParams(availableYears, availableQuarters);

  const yearMoney = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const filteredData = useMemo(() => {
    if (!yearMoney || yearMoney.length === 0) return { companies: [], money: [] };

    const filteredByQuarter =
      selectedQuarter > 0
        ? yearMoney.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter)
        : yearMoney;

    const companyMap = {};
    filteredByQuarter.forEach((item) => {
      const name = item[MONEY_SHEET_COLUMNS.NAME];
      if (!companyMap[name]) {
        companyMap[name] = { totalIncome: 0, totalExpenses: 0, totalResult: 0 };
      }
      companyMap[name].totalIncome += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.INCOME]);
      companyMap[name].totalExpenses += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.EXPENSES]);
      companyMap[name].totalResult += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]);
    });

    const filterFn = FILTERS[filter] || (() => true);
    const filteredCompanyNames = Object.keys(companyMap).filter((name) =>
      filterFn(companyMap[name]),
    );

    const companies = filteredCompanyNames
      .map((name) => pretprijatija.find((c) => c[MONEY_SHEET_COLUMNS.NAME] === name) || { [MONEY_SHEET_COLUMNS.NAME]: name })
      .filter(Boolean);

    const companyMoney = filteredByQuarter
      .filter((item) => filteredCompanyNames.includes(item[MONEY_SHEET_COLUMNS.NAME]))
      .sort((a, b) => {
        if (a[MONEY_SHEET_COLUMNS.YEAR] !== b[MONEY_SHEET_COLUMNS.YEAR]) return b[MONEY_SHEET_COLUMNS.YEAR].localeCompare(a[MONEY_SHEET_COLUMNS.YEAR]);
        return a[MONEY_SHEET_COLUMNS.QUARTER] - b[MONEY_SHEET_COLUMNS.QUARTER];
      });

    return { companies, money: companyMoney };
  }, [yearMoney, pretprijatija, selectedQuarter, filter]);

  const FILTER_TO_SORT = {
    "positive-result": "financial-result",
    "negative-result": "financial-result",
    "earned-more": "financial-result",
    "spent-more": "expenses",
    "income": "income",
    "no-income": "income",
  };

  const activeSort = FILTER_TO_SORT[filter] || "id";

  return (
    <Cards
      tableData={filteredData.companies}
      money={filteredData.money}
      activeSort={activeSort}
      selectedYear={selectedYear}
      selectedQuarter={selectedQuarter}
      filter={filter}
      showSearch={false}
    />
  );
}

export default FilteredCompanies;
