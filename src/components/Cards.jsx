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
      if (!map[item.Назив]) {
        map[item.Назив] = [];
      }
      map[item.Назив].push(item);
    });
    return map;
  }, [money]);

  const searchColumns = useMemo(() =>
    lang === "en" ? ["Title", "Description"] : ["Назив", "Опис"],
    [lang]
  );

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
      results.map((row) => row.Назив).filter(Boolean),
    );
    const relevantMoney = money.filter((item) => companyNames.has(item.Назив));

    return {
      income: sumDecimalNumbers(relevantMoney.map((item) => item.Приходи)),
      expenses: sumDecimalNumbers(relevantMoney.map((item) => item.Расходи)),
      "financial-result": sumDecimalNumbers(
        relevantMoney.map((item) => item["Финансиски резултат"]),
      ),
    };
  }, [results, money]);

  return (
    <main className="bg-primary-subtle bg-shade-img-alt pt-4 pb-3 flex-fill">
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
                      numbers={companyMoneyMap[row.Назив] || []}
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
