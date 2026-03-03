import { Fragment, useEffect, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionListTotal from "./DefinitionListTotal";

export default function Cards({ tableData, money }) {
  const [filters, setFilters] = useState(filterDefinitions);
  const [filteredData, setFilteredData] = useState([]);

  const searchData = (e, column) => {
    setFilters({ ...filters, [column]: e.target.value });
  };

  const results = useMemo(() => {
    if (filters[Object.keys(filters)[7]]) {
      return filteredData.filter((item) => {
        return Object.values(item)
          .toString()
          .toLowerCase()
          .includes(filters[Object.keys(filters)[7]].trim().toLowerCase());
      });
    } else {
      return filteredData.filter((row) =>
        Object.keys(filters).every((column) => {
          if (!filters[column]) return true; // If filter is empty, include the row
          return (
            row[column] &&
            row[column]
              .toString()
              .trim()
              .toLowerCase()
              .includes(filters[column].trim().toLowerCase())
          );
        })
      );
    }
  }, [filteredData, filters]);

  useEffect(() => {
    setFilteredData(tableData);
  }, [tableData]);

  let totalCompanies = [...new Set(money.map((item) => item.Назив))].length;
  let totalIncome = parseDecimalNumber(
    sumDecimalNumbers(money.map((item) => item.Приходи))
  );
  let totalOutcome = parseDecimalNumber(
    sumDecimalNumbers(money.map((item) => item.Расходи))
  );
  let totalFinancialResults = parseDecimalNumber(
    sumDecimalNumbers(money.map((item) => item[`Финансиски резултат`]))
  );

  return (
    <Fragment>
      <div className="bg-light py-3">
        <div className="container">
          <SearchForm
            value={filters[Object.keys(filters)[7]]}
            index={Object.keys(filters)[7]}
            filters={filters}
            setFilters={setFilters}
            searchData={searchData}
          />
          <div className="row row-cols-1 g-3">
            {results
              .map(
                (row, i) =>
                  row && (
                    <div className="col" key={i}>
                      <Card
                        row={row}
                        numbers={money.filter((el) => el.Назив === row.Назив)}
                      />
                    </div>
                  )
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
