import { Fragment, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionListTotal from "./DefinitionListTotal";
import FilteredChart from "./FilteredChart";

export default function Cards({
  tableData,
  money,
  activeSort,
  selectedYear,
  selectedQuarter,
  showChart = true,
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

  const searchData = useCallback((e, column) => {
    const searchColumn = column || "Назив";
    setFilters((prev) => ({ ...prev, [searchColumn]: e.target.value }));
  }, []);

  const setFilterValue = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const filteredData = useMemo(() => tableData || [], [tableData]);

  const results = useMemo(() => {
    if (!filteredData.length) return [];
    const searchColumn = Object.keys(filters).find((key) => filters[key]);
    if (searchColumn) {
      return filteredData.filter((item) => {
        if (!item) return false;
        return Object.values(item)
          .toString()
          .toLowerCase()
          .includes(filters[searchColumn]?.trim().toLowerCase() || "");
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
  }, [filteredData, filters]);

  const totalCompanies = useMemo(() => results.length, [results]);

  const totals = useMemo(() => {
    const companyNames = new Set(
      results.map((row) => row.Назив).filter(Boolean),
    );
    const relevantMoney = money.filter((item) => companyNames.has(item.Назив));

    return {
      income: parseDecimalNumber(
        sumDecimalNumbers(relevantMoney.map((item) => item.Приходи)),
        lang,
      ),
      expenses: parseDecimalNumber(
        sumDecimalNumbers(relevantMoney.map((item) => item.Расходи)),
        lang,
      ),
      "financial-result": parseDecimalNumber(
        sumDecimalNumbers(
          relevantMoney.map((item) => item["Финансиски резултат"]),
        ),
        lang,
      ),
    };
  }, [results, money, lang]);

  const activeFilter =
    Object.keys(filters).find((key) => filters[key]) || "Назив";

  return (
    <div className="bg-primary-subtle bg-shade pt-4 pb-3">
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
        <SearchForm
          value={filters[activeFilter]}
          filters={filters}
          setFilterValue={setFilterValue}
          searchData={searchData}
        />
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
            <div className="col-lg-8 vstack gap-2 justify-content-center">
              <h5 className="card-title">
                {selectedQuarter > 0
                  ? t("cards.totalQuarter", {
                      year: selectedYear,
                      quarter: selectedQuarter,
                    })
                  : t("cards.total", { year: selectedYear })}
              </h5>
              <p className="card-text mb-0">
                {totalCompanies}{" "}
                {totalCompanies % 10 === 1 && totalCompanies !== 11
                  ? t("cards.company_singular")
                  : t("cards.company_plural")}
              </p>
            </div>
            <div className="col-lg-4 align-self-center vstack gap-2">
              <DefinitionListTotal
                title={t("cards.income")}
                total={totals.income}
                icon={`bi-arrow-down`}
                color={`success`}
                isActive={activeSort === "income"}
              />
              <DefinitionListTotal
                title={t("cards.expenses")}
                total={totals.expenses}
                icon={`bi-arrow-up`}
                color={`danger`}
                isActive={activeSort === "expenses"}
              />
              <DefinitionListTotal
                title={t("cards.financial-result")}
                total={totals["financial-result"]}
                icon={`bi-arrow-down-up`}
                color={
                  parseInt(totals["financial-result"]) < 0
                    ? `danger`
                    : `success`
                }
                isActive={activeSort === "financial-result"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
