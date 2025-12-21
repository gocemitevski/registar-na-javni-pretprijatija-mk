import { Fragment, useEffect, useMemo, useState } from "react";
import SearchForm from "./SearchForm";
import { filterDefinitions } from "../utils/filterDefinitions";
import Card from "./Card";

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

  return (
    <Fragment>
      <SearchForm
        value={filters[Object.keys(filters)[7]]}
        index={Object.keys(filters)[7]}
        filters={filters}
        setFilters={setFilters}
        searchData={searchData}
      />
      <div className="row row-cols-1 g-3 mb-4">
        {results.map((row, i) => (
          <div className="col" key={i}>
            <Card
              row={row}
              numbers={money.filter(
                (el) => el.Назив == row.Назив
              )}
            />
          </div>
        ))}
      </div>
    </Fragment>
  );
}
