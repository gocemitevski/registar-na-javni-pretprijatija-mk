import { useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
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

  const searchData = useCallback((e, column) => {
    const searchColumn = column || searchColumns[0];
    setFilters((prev) => ({ ...prev, [searchColumn]: e.target.value }));
  }, [searchColumns]);

  const setFilterValue = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredData = useMemo(() => tableData || [], [tableData]);

  const hasSearch = useMemo(() =>
    Object.values(filters).some((v) => v && v.trim()),
    [filters]
  );

  const results = useMemo(() => {
    if (!filteredData.length) return [];
    const searchColumn = Object.keys(filters).find((key) => filters[key]);
    if (searchColumn) {
      const searchTerm = filters[searchColumn]?.trim().toLowerCase() || "";
      return filteredData.filter((item) => {
        if (!item) return false;
        if (searchColumns.includes(searchColumn)) {
          return searchColumns.some((col) =>
            item[col]?.toString().toLowerCase().includes(searchTerm)
          );
        }
        return Object.values(item)
          .toString()
          .toLowerCase()
          .includes(searchTerm);
      });
    } else {
      return filteredData.filter((row) => {
        if (!row) return false;
        return Object.keys(filters).every((column) => {
          if (!filters[column]) return true;
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

  const activeFilter =
    Object.keys(filters).find((key) => filters[key]) || searchColumns[0];

  return (
    <div className="bg-primary-subtle bg-shade-img-alt pt-4 pb-3 flex-fill">
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
          value={filters[activeFilter]}
          filters={filters}
          setFilterValue={setFilterValue}
          searchData={searchData}
          searchColumns={searchColumns}
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
    </div>
  );
}
