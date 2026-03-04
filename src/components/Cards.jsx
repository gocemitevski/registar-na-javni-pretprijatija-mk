import { Fragment, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionListTotal from "./DefinitionListTotal";

export default function Cards({ tableData, money }) {
  const [filters, setFilters] = useState(filterDefinitions);
  const [searchColumn, setSearchColumn] = useState(null);

  const searchData = (e, column) => {
    setSearchColumn(column);
    setFilters({ ...filters, [column]: e.target.value });
  };

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

  const filteredNames = useMemo(() => {
    if (!results.length) return [];
    const names = new Set(results.map((row) => row.Назив).filter(Boolean));
    const filteredMoney = money ?? [];
    return filteredMoney.filter((item) => names.has(item.Назив));
  }, [results, money]);

  const totalIncome = useMemo(
    () =>
      parseDecimalNumber(
        sumDecimalNumbers(filteredNames.map((item) => item.Приходи)),
      ),
    [filteredNames],
  );

  const totalOutcome = useMemo(
    () =>
      parseDecimalNumber(
        sumDecimalNumbers(filteredNames.map((item) => item.Расходи)),
      ),
    [filteredNames],
  );

  const totalFinancialResults = useMemo(
    () =>
      parseDecimalNumber(
        sumDecimalNumbers(
          filteredNames.map((item) => item[`Финансиски резултат`]),
        ),
      ),
    [filteredNames],
  );

  return (
    <Fragment>
      <div className="bg-light py-3">
        <div className="container">
          <SearchForm
            value={filters[searchColumn]}
            index={searchColumn}
            filters={filters}
            setFilters={setFilters}
            searchData={searchData}
          />
          <div className="row row-cols-1 g-3">
            {results.map(
              (row, i) =>
                row && (
                  <div className="col" key={i}>
                    <Card
                      row={row}
                      numbers={money.filter((el) => el.Назив === row.Назив)}
                    />
                  </div>
                ),
            )}
          </div>
        </div>
      </div>
      <div className="bg-light pt-4 pb-5">
        <div className="container">
          <div className="row mx-2 mb-3">
            <div className="col-lg-8 vstack gap-2 justify-content-center">
              <h5 className="card-title">Вкупно</h5>
              <p className="card-text mb-0">
                {totalCompanies} јавни претпријатија и трговски друштва
              </p>
            </div>
            <div className="col-lg-4 align-self-center vstack gap-2">
              <DefinitionListTotal
                title={`Приходи`}
                total={totalIncome}
                icon={`bi-arrow-down`}
                color={`success`}
              />
              <DefinitionListTotal
                title={`Расходи`}
                total={totalOutcome}
                icon={`bi-arrow-up`}
                color={`danger`}
              />
              <DefinitionListTotal
                title={`Финансиски резултат`}
                total={totalFinancialResults}
                icon={`bi-arrow-down-up`}
                color={
                  parseInt(totalFinancialResults) < 0 ? `danger` : `success`
                }
              />
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
