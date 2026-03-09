import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { order, sorting } from "../utils/filterDefinitions";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

const DEFAULT_SORTING = cleanName(transliterate(sorting[0]));
const DEFAULT_ORDER = cleanName(transliterate(order[0]));

export default function Navbar({ showSortingFilters = false }) {
  const navigate = useNavigate();
  const {
    year: yearParam,
    quarter: quarterParam,
    sorting: sortingParam,
    order: orderParam,
  } = useParams();
  const { availableYears, allMoney } = useData();

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    return yearParam === undefined || parseInt(yearParam) === 0
      ? latestYear
      : yearParam;
  }, [yearParam, availableYears]);

  const selectedQuarter = useMemo(() => {
    return quarterParam ? parseInt(quarterParam) : 0;
  }, [quarterParam]);

  const selectedSorting = useMemo(() => {
    return sortingParam || DEFAULT_SORTING;
  }, [sortingParam]);

  const selectedOrder = useMemo(() => {
    return orderParam || DEFAULT_ORDER;
  }, [orderParam]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const quarters = useMemo(
    () => [...new Set([0, ...new Set(money.map((item) => item.Квартал))])],
    [money],
  );

  const isDefault = useMemo(() => {
    const latestYear = availableYears[0];
    if (showSortingFilters) {
      return (
        selectedYear === latestYear &&
        selectedQuarter === 0 &&
        selectedSorting === DEFAULT_SORTING &&
        selectedOrder === DEFAULT_ORDER
      );
    }
    return selectedYear === latestYear && selectedQuarter === 0;
  }, [
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
    availableYears,
    showSortingFilters,
  ]);

  const buildPath = (targetBase, year, quarter, sort, ord) => {
    let path = targetBase === "/" ? "" : targetBase;
    path += `/${year}/${quarter}/${sort}/${ord}`;
    return path || "/";
  };

  const overviewPath = buildPath(
    "/",
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
  );
  const registryPath = buildPath(
    "/registry",
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
  );

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    if (showSortingFilters) {
      navigate(buildPath("/registry", newYear, selectedQuarter, selectedSorting, selectedOrder));
    } else {
      navigate(buildPath("/", newYear, 0, DEFAULT_SORTING, DEFAULT_ORDER));
    }
  };

  const handleQuarterChange = (e) => {
    const newQuarter = e.target.value;
    if (showSortingFilters) {
      navigate(buildPath("/registry", selectedYear, newQuarter, selectedSorting, selectedOrder));
    } else {
      navigate(buildPath("/", selectedYear, newQuarter, DEFAULT_SORTING, DEFAULT_ORDER));
    }
  };

  const handleSortingChange = (e) => {
    const newSorting = e.target.value;
    navigate(
      buildPath(
        "/registry",
        selectedYear,
        selectedQuarter,
        newSorting,
        DEFAULT_ORDER,
      ),
    );
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    navigate(
      buildPath(
        "/registry",
        selectedYear,
        selectedQuarter,
        selectedSorting,
        newOrder,
      ),
    );
  };

  const handleReset = () => {
    const defaultYear = availableYears[0];
    if (showSortingFilters) {
      navigate(`/registry/${defaultYear}`);
    } else {
      navigate(`/${defaultYear}`);
    }
  };

  return (
    <nav className="navbar bg-primary py-3 sticky-top">
      <div className="container">
        <div className={`row align-items-center gy-2 gx-3 flex-fill`}>
          <div className="col-xl-6">
            <ul className="nav nav-pills text-uppercase gap-2">
              <li className="nav-item">
                <NavLink className="nav-link" to={overviewPath}>
                  Почетна
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to={registryPath}>
                  Регистар
                </NavLink>
              </li>
            </ul>
          </div>
          <div className="col-xl-6 hstack gap-3">
            <div className="form-floating flex-fill">
              <select
                value={selectedYear}
                className="form-select"
                id="years"
                onChange={handleYearChange}
              >
                {availableYears.map((year, key) => (
                  <option key={key} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <label htmlFor="years">Година</label>
            </div>
            <div className="form-floating flex-fill">
              <select
                value={selectedQuarter}
                className="form-select"
                id="quarters"
                onChange={handleQuarterChange}
              >
                {quarters.map((quarter, key) => (
                  <option key={key} value={quarter}>
                    {quarter === 0 ? `Сите` : quarter}
                  </option>
                ))}
              </select>
              <label htmlFor="quarters">Квартал</label>
            </div>
            {showSortingFilters && (
              <>
                <div className="form-floating flex-fill">
                  <select
                    value={selectedSorting}
                    className="form-select"
                    id="sorting"
                    onChange={handleSortingChange}
                  >
                    {sorting.map((sort, key) => (
                      <option key={key} value={cleanName(transliterate(sort))}>
                        {sort}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="sorting">Подредување</label>
                </div>
                {selectedSorting !== DEFAULT_SORTING && (
                  <div className="form-floating flex-fill">
                    <select
                      value={selectedOrder}
                      className="form-select"
                      id="order"
                      onChange={handleOrderChange}
                    >
                      {order.map((order, key) => (
                        <option key={key} value={cleanName(transliterate(order))}>
                          {order}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="order">Редослед</label>
                  </div>
                )}
              </>
            )}
            {!isDefault && (
              <button
                type="button"
                className={`btn btn-outline-light p-3`}
                onClick={handleReset}
                title="Врати ги основните вредности"
              >
                <i className="bi bi-arrow-counterclockwise"></i>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
