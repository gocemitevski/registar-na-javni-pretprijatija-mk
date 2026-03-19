import { Fragment, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";
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
  const { t, i18n } = useTranslation();
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
    <div className="bg-primary-subtle bg-shade-img-alt pt-4 pb-3">
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
          {results.map(
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
          )}
        </div>
      </div>
      <div className="sticky-bottom py-4">
        <div className="container bg-total totals bg-opacity-25 backdrop-blur border border-light shadow-lg py-5 rounded">
          <div className="row mx-2">
            <div className="col-lg-6 col-xl-8 vstack gap-2 justify-content-center">
              <h5 className="card-title">
                {selectedQuarter > 0
                  ? t("cards.totalQuarter", {
                      year: selectedYear,
                      quarter: selectedQuarter,
                    })
                  : t("cards.total", { year: selectedYear })}
              </h5>
              <p className="card-text mb-4 mb-lg-0">
                {totalCompanies}{" "}
                {totalCompanies % 10 === 1 && totalCompanies !== 11
                  ? t("cards.company_singular")
                  : t("cards.company_plural")}
              </p>
            </div>
            <div className="col-lg-6 col-xl-4 align-self-center vstack gap-2 ps-xl-0">
              <DefinitionList
                title={t("cards.income")}
                total={parseDecimalNumber(totals.income, lang)}
                rawValue={totals.income}
                icon="bi-arrow-down"
                isActive={activeSort === "income"}
              />
              <DefinitionList
                title={t("cards.expenses")}
                total={parseDecimalNumber(totals.expenses, lang)}
                rawValue={totals.expenses}
                icon="bi-arrow-up"
                isActive={activeSort === "expenses"}
              />
              <DefinitionList
                title={t("cards.financial-result")}
                total={parseDecimalNumber(totals["financial-result"], lang)}
                rawValue={totals["financial-result"]}
                icon="bi-arrow-down-up"
                isActive={activeSort === "financial-result"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
