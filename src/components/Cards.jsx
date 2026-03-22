import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import { transliterate } from "../utils/transliterate";
import Card from "./Card";
import NoResults from "./NoResults";
import { sumDecimalNumbers } from "../utils/decimalNumbers";
import CardsTotals from "./CardsTotals";
import FilteredChart from "./FilteredChart";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS, SEARCH_COLUMNS } from "../utils/columns";

export default function Cards({
  tableData,
  money,
  activeSort,
  selectedYear,
  selectedQuarter,
  showChart = true,
  showSearch = true,
  filter,
}) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const [filters, setFilters] = useState(filterDefinitions);

  const companyMoneyMap = useMemo(() => {
    const map = {};
    money.forEach((item) => {
      if (!map[item[MONEY_SHEET_COLUMNS.NAME]]) {
        map[item[MONEY_SHEET_COLUMNS.NAME]] = [];
      }
      map[item[MONEY_SHEET_COLUMNS.NAME]].push(item);
    });
    return map;
  }, [money]);

  const searchColumns = SEARCH_COLUMNS[lang.toUpperCase()] || SEARCH_COLUMNS.MK;

  const searchData = useCallback((e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
  }, []);

  const filteredData = useMemo(() => tableData || [], [tableData]);

  const results = useMemo(() => {
    if (!filteredData.length) return [];

    const rawTerm = filters.search?.trim() || "";
    const term = transliterate(rawTerm).toLowerCase();
    const hasSearch = term.length > 0;

    if (hasSearch) {
      return filteredData.filter((item) => {
        if (!item) return false;
        return searchColumns.some((col) => {
          const value = item[col]?.toString() || "";
          const normalizedValue = transliterate(value).toLowerCase();
          return normalizedValue.includes(term);
        });
      });
    } else {
      return filteredData.filter((row) => {
        if (!row) return false;
        return Object.keys(filters).every((column) => {
          if (!filters[column] || column === "search") return true;
          return (
            row[column] &&
            row[column]
              .toString()
              .trim()
              .toLowerCase()
              .includes(filters[column]?.trim().toLowerCase() || "")
          );
        });
      });
    }
  }, [filteredData, filters, searchColumns]);

  const hasSearch = (filters.search?.trim().length || 0) > 0;

  const totalCompanies = useMemo(() => results.length, [results]);

  const totals = useMemo(() => {
    const companyNames = new Set(
      results.map((row) => row[COMPANY_SHEET_COLUMNS.NAME]).filter(Boolean),
    );
    const relevantMoney = money.filter((item) => companyNames.has(item[MONEY_SHEET_COLUMNS.NAME]));

    return {
      income: sumDecimalNumbers(relevantMoney.map((item) => item[MONEY_SHEET_COLUMNS.INCOME])),
      expenses: sumDecimalNumbers(relevantMoney.map((item) => item[MONEY_SHEET_COLUMNS.EXPENSES])),
      "financial-result": sumDecimalNumbers(
        relevantMoney.map((item) => item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
      ),
    };
  }, [results, money]);

  return (
    <main className="bg-primary-subtle bg-shade-img pt-4 pb-3 flex-fill">
      <div className="container">
        {showChart && (
          <FilteredChart
            tableData={results}
            money={money}
            activeSort={activeSort}
            selectedYear={selectedYear}
            selectedQuarter={selectedQuarter}
            filter={filter}
          />
        )}
        {showSearch && (
        <SearchForm
          value={filters.search || ""}
          searchData={searchData}
        />
        )}
        <div className="row row-cols-1 g-3">
          {results.length === 0 && hasSearch ? (
            <NoResults />
          ) : (
            results.map(
              (row, i) =>
                row && (
                  <div className="col" key={i}>
                    <Card
                      row={row}
                      numbers={companyMoneyMap[row[COMPANY_SHEET_COLUMNS.NAME]] || []}
                      activeSort={activeSort}
                    />
                  </div>
                ),
            )
          )}
        </div>
      </div>
      {results.length > 0 && (
        <CardsTotals
          totalCompanies={totalCompanies}
          totals={totals}
          selectedYear={selectedYear}
          selectedQuarter={selectedQuarter}
          activeSort={activeSort}
        />
      )}
    </main>
  );
}
