import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { buildQuery, DEFAULT_SORTING, DEFAULT_ORDER, parseSortingParam, parseOrderParam } from "../utils/url";
import { sorting, order } from "../utils/filterDefinitions";

export default function Navbar({ showSortingFilters = false, showFilters = true }) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "mk";

  const navigate = useNavigate();
  const location = useLocation();
  const { availableYears, allMoney } = useData();

  const selectedYear = useMemo(() => {
    const yearParam = new URLSearchParams(location.search).get("year");
    const latestYear = availableYears[0];
    if (!latestYear) return "";
    if (!yearParam || parseInt(yearParam, 10) === 0) return latestYear;
    return availableYears.includes(yearParam) ? yearParam : latestYear;
  }, [availableYears, location.search]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const quarters = useMemo(
    () => [...new Set([0, ...new Set(money.map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]))])],
    [money],
  );

  const selectedQuarter = useMemo(() => {
    const quarterParam = new URLSearchParams(location.search).get("quarter");
    const q = quarterParam ? parseInt(quarterParam, 10) : 0;
    if (isNaN(q)) return 0;
    return quarters.includes(q) ? q : 0;
  }, [location.search, quarters]);

  const selectedSorting = useMemo(() => parseSortingParam(location.search), [location.search]);
  const selectedOrder = useMemo(() => parseOrderParam(location.search), [location.search]);

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

  const overviewPath = `/${currentLang}?${buildQuery(selectedYear, selectedQuarter, selectedSorting, selectedOrder)}`;
  const registryPath = `/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, selectedSorting, selectedOrder)}`;
  const aboutPath = `/${currentLang}/about`;

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    const newYearMoney = allMoney[newYear] || [];
    const availableQuarters = new Set(newYearMoney.map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]));
    const quarterToUse = availableQuarters.has(selectedQuarter) ? selectedQuarter : 0;
    const orderToUse = selectedSorting !== DEFAULT_SORTING ? selectedOrder : DEFAULT_ORDER;
    if (showSortingFilters) {
      navigate(`/${currentLang}/registry?${buildQuery(newYear, quarterToUse, selectedSorting, orderToUse)}`);
    } else {
      navigate(`/${currentLang}?${buildQuery(newYear, quarterToUse, DEFAULT_SORTING, DEFAULT_ORDER)}`);
    }
  };

  const handleQuarterChange = (e) => {
    const newQuarter = parseInt(e.target.value, 10);
    const orderToUse = selectedSorting !== DEFAULT_SORTING ? selectedOrder : DEFAULT_ORDER;
    if (showSortingFilters) {
      navigate(`/${currentLang}/registry?${buildQuery(selectedYear, newQuarter, selectedSorting, orderToUse)}`);
    } else {
      navigate(`/${currentLang}?${buildQuery(selectedYear, newQuarter, DEFAULT_SORTING, DEFAULT_ORDER)}`);
    }
  };

  const handleSortingChange = (e) => {
    const newSorting = e.target.value;
    navigate(`/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, newSorting, DEFAULT_ORDER)}`);
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    navigate(`/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, selectedSorting, newOrder)}`);
  };

  const handleReset = () => {
    const defaultYear = availableYears[0];
    if (showSortingFilters) {
      navigate(`/${currentLang}/registry?${buildQuery(defaultYear, 0, DEFAULT_SORTING, DEFAULT_ORDER)}`);
    } else {
      navigate(`/${currentLang}/?${buildQuery(defaultYear, 0, DEFAULT_SORTING, DEFAULT_ORDER)}`);
    }
  };

  return (
    <nav className="navbar bg-primary py-3 sticky-top">
      <div className="container">
        <div className={`row align-items-center justify-content-between gy-3 gx-3 flex-fill nav-fill`}>
          <div className="col-xl-5 col-xxl-4">
            <ul className="nav nav-pills text-uppercase text-bg-secondary rounded gap-2">
              <li className="nav-item">
                <NavLink end className="nav-link py-3" to={overviewPath} title={t("nav.home")}>
                  <i className="bi bi-house d-sm-none"></i>
                  <span className="d-none d-sm-block">{t("nav.home")}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link py-3" to={registryPath} title={t("nav.registry")}>
                  <i className="bi bi-card-list d-sm-none"></i>
                  <span className="d-none d-sm-block">{t("nav.registry")}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link py-3" to={aboutPath} title={t("nav.about")}>
                  <i className="bi bi-question-square d-sm-none"></i>
                  <span className="d-none d-sm-block">{t("nav.about")}</span>
                </NavLink>
              </li>
            </ul>
          </div>
          {showFilters && (
            <div className="col-xl-6 hstack flex-wrap flex-lg-nowrap gap-2">
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
                <label htmlFor="years">{t("nav.year")}</label>
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
                      {quarter === 0 ? t("nav.all") : quarter}
                    </option>
                    ))}
                </select>
                <label htmlFor="quarters">{t("nav.quarter")}</label>
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
                         <option key={key} value={sort}>
                           {t(`sort.${sort}`)}
                         </option>
                       ))}
                     </select>
                     <label htmlFor="sorting">{t("nav.sorting")}</label>
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
                             <option key={key} value={order}>
                               {t(`order.${order}`)}
                             </option>
                           ))}
                       </select>
                       <label htmlFor="order">{t("nav.order")}</label>
                     </div>
                   )}
               </>
              )}
              {!isDefault && (
                <button
                  type="button"
                  className={`btn btn-outline-light p-3`}
                  onClick={handleReset}
                  title={t("nav.reset")}
                >
                  <i className="bi bi-arrow-counterclockwise"></i>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
