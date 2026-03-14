import { useMemo } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import Cards from "./Cards";

const FILTERS = {
  "positive-result": (c) => c.totalResult > 0,
  "income": (c) => c.totalIncome > 0,
  "earned-more": (c) => c.totalIncome > c.totalExpenses,
  "negative-result": (c) => c.totalResult < 0,
  "no-income": (c) => c.totalIncome <= 0,
  "spent-more": (c) => c.totalExpenses > c.totalIncome,
};

function FilteredCompanies() {
  const { filter } = useParams();
  const location = useLocation();
  const { pretprijatija, allMoney, availableYears } = useData();

  const yearParam = new URLSearchParams(location.search).get("year");
  const quarterParam = new URLSearchParams(location.search).get("quarter");

  const selectedYear = yearParam || availableYears?.[0] || "";
  const selectedQuarter = quarterParam ? parseInt(quarterParam) : 0;

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const filteredData = useMemo(() => {
    if (!money || money.length === 0) return { companies: [], money: [] };

    const filteredByQuarter =
      selectedQuarter > 0
        ? money.filter((item) => item.Квартал === selectedQuarter)
        : money;

    const companyMap = {};
    filteredByQuarter.forEach((item) => {
      const name = item.Назив;
      if (!companyMap[name]) {
        companyMap[name] = { totalIncome: 0, totalExpenses: 0, totalResult: 0 };
      }
      companyMap[name].totalIncome += formatDecimalNumber(item.Приходи);
      companyMap[name].totalExpenses += formatDecimalNumber(item.Расходи);
      companyMap[name].totalResult += formatDecimalNumber(item["Финансиски резултат"]);
    });

    const filterFn = FILTERS[filter] || (() => true);
    const filteredCompanyNames = Object.keys(companyMap).filter((name) =>
      filterFn(companyMap[name]),
    );

    const companies = filteredCompanyNames
      .map((name) => pretprijatija.find((c) => c.Назив === name) || { Назив: name })
      .filter(Boolean);

    const companyMoney = filteredByQuarter
      .filter((item) => filteredCompanyNames.includes(item.Назив))
      .sort((a, b) => {
        if (a.Година !== b.Година) return b.Година.localeCompare(a.Година);
        return a.Квартал - b.Квартал;
      });

    return { companies, money: companyMoney };
  }, [money, pretprijatija, selectedQuarter, filter]);

  const FILTER_TO_SORT = {
    "positive-result": "financial-result",
    "negative-result": "financial-result",
    "earned-more": "financial-result",
    "spent-more": "financial-result",
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
    />
  );
}

export default FilteredCompanies;
