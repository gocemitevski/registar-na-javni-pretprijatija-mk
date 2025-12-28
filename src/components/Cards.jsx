import { Fragment, useEffect, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";

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
      <div className="row row-cols-1 row-cols-lg-4 g-3 mt-2 mb-3">
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5>{totalCompanies}</h5>
              <p className="card-text">Јавни претпријатија и трговски друштва</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5>{totalIncome}</h5>
              <p className="card-text">Приходи за избраната година и квартал</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5>{totalOutcome}</h5>
              <p className="card-text">Расходи за избраната година и квартал</p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card">
            <div className="card-body">
              <h5>{totalFinancialResults}</h5>
              <p className="card-text">Финансиски резултат за избраната година и квартал</p>
            </div>
          </div>
        </div>
      </div>
      <SearchForm
        value={filters[Object.keys(filters)[7]]}
        index={Object.keys(filters)[7]}
        filters={filters}
        setFilters={setFilters}
        searchData={searchData}
      />
      <div className="row row-cols-1 g-3 mb-4">
        {results.map((row, i) => (
          row && <div className="col" key={i}>
            <Card
              row={row}
              numbers={money.filter((el) => el.Назив === row.Назив)}
            />
          </div>
        ))}
      </div>
    </Fragment>
  );
}
