import { useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { useUrlParams } from "../hooks/useUrlParams";
import { useComparisonParams } from "../hooks/useComparisonParams";
import {
  buildQuery,
  buildComparisonQuery,
  DEFAULT_SORTING,
  DEFAULT_ORDER,
  DEFAULT_CURRENCY,
  parseSortingParam,
  parseOrderParam,
} from "../utils/url";
import {
  getDefaultComparisonYears,
  getYearStats,
} from "../utils/yearComparison";
import { sorting, order } from "../utils/filterDefinitions";
import CurrencySwitcher from "./CurrencySwitcher";
import Icon from "./Icon";

export default function Navbar({
  showSortingFilters = false,
  showComparisonFilters = false,
  showFilters = true,
}) {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "mk";

  const navigate = useNavigate();
  const location = useLocation();
  const { availableYears, allMoney } = useData();

  const getQuarters = useCallback(
    (year) => [
      ...new Set([
        0,
        ...(allMoney[year] || []).map(
          (item) => item[MONEY_SHEET_COLUMNS.QUARTER],
        ),
      ]),
    ].sort((a, b) => a - b),
    [allMoney],
  );

  const { selectedYear, selectedQuarter, selectedCurrency, quarters } = useUrlParams(
    availableYears,
    getQuarters,
  );

  const {
    baseYear,
    compareYear,
    setYears: setComparisonYears,
  } = useComparisonParams(availableYears, allMoney);

  const partialByYear = useMemo(() => {
    if (!showComparisonFilters) return {};
    const map = {};
    availableYears.forEach((year) => {
      map[year] = getYearStats(allMoney, year).isPartial;
    });
    return map;
  }, [showComparisonFilters, availableYears, allMoney]);

  const comparisonDefaults = useMemo(
    () => getDefaultComparisonYears(availableYears, allMoney),
    [availableYears, allMoney],
  );

  const selectedSorting = useMemo(
    () => parseSortingParam(location.search),
    [location.search],
  );
  const selectedOrder = useMemo(
    () => parseOrderParam(location.search),
    [location.search],
  );

  const isDefault = useMemo(() => {
    if (showComparisonFilters) {
      return (
        baseYear === comparisonDefaults.baseYear &&
        compareYear === comparisonDefaults.compareYear &&
        selectedCurrency === DEFAULT_CURRENCY
      );
    }

    const latestYear = availableYears[0];
    const isDefaultFilters = showSortingFilters
      ? selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER
      : true;
    return (
      selectedYear === latestYear &&
      selectedQuarter === 0 &&
      selectedCurrency === DEFAULT_CURRENCY &&
      isDefaultFilters
    );
  }, [
    baseYear,
    compareYear,
    comparisonDefaults,
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
    selectedCurrency,
    availableYears,
    showComparisonFilters,
    showSortingFilters,
  ]);

  const compareCurrency = new URLSearchParams(location.search).get("currency");
  const isComparePage = /^\/(mk|en)\/compare\/?$/.test(location.pathname);
  const comparePath = `/${currentLang}/compare${compareCurrency ? `?currency=${compareCurrency}` : ""}`;
  // The comparison page has no single year/quarter, so leaving it keeps only
  // the currency like the comparison link itself.
  const navSearch = isComparePage
    ? compareCurrency
      ? `?currency=${compareCurrency}`
      : ""
    : `?${buildQuery(selectedYear, selectedQuarter, selectedSorting, selectedOrder, location.search)}`;
  const overviewPath = `/${currentLang}${navSearch}`;
  const registryPath = `/${currentLang}/registry${navSearch}`;
  const aboutPath = `/${currentLang}/about`;

  const normalizedPath = location.pathname.replace(/\/$/, "");
  const isHomeActive = normalizedPath === `/${currentLang}`;
  const isRegistryActive = normalizedPath === `/${currentLang}/registry`;
  // Tighten the icon-only home link when neither it nor the adjacent Registry
  // link is active.
  const collapseHomeRightPadding = !isHomeActive && !isRegistryActive;

  const handleYearChange = (e) => {
    const newYear = e.target.value;
    const newYearMoney = allMoney[newYear] || [];
    const availableQuarters = new Set(
      newYearMoney.map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]),
    );
    const quarterToUse = availableQuarters.has(selectedQuarter)
      ? selectedQuarter
      : 0;
    const orderToUse =
      selectedSorting !== DEFAULT_SORTING ? selectedOrder : DEFAULT_ORDER;
    if (showSortingFilters) {
      navigate(
        `/${currentLang}/registry?${buildQuery(newYear, quarterToUse, selectedSorting, orderToUse, location.search)}`,
      );
    } else {
      navigate(
        `/${currentLang}?${buildQuery(newYear, quarterToUse, DEFAULT_SORTING, DEFAULT_ORDER, location.search)}`,
      );
    }
  };

  const handleQuarterChange = (e) => {
    const newQuarter = parseInt(e.target.value, 10);
    const orderToUse =
      selectedSorting !== DEFAULT_SORTING ? selectedOrder : DEFAULT_ORDER;
    if (showSortingFilters) {
      navigate(
        `/${currentLang}/registry?${buildQuery(selectedYear, newQuarter, selectedSorting, orderToUse, location.search)}`,
      );
    } else {
      navigate(
        `/${currentLang}?${buildQuery(selectedYear, newQuarter, DEFAULT_SORTING, DEFAULT_ORDER, location.search)}`,
      );
    }
  };

  const handleSortingChange = (e) => {
    const newSorting = e.target.value;
    navigate(
      `/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, newSorting, DEFAULT_ORDER, location.search)}`,
    );
  };

  const handleOrderChange = (e) => {
    const newOrder = e.target.value;
    navigate(
      `/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, selectedSorting, newOrder, location.search)}`,
    );
  };

  const pickAlternativeYear = (year) => {
    const completeAlternative = availableYears.find(
      (candidate) => candidate !== year && !partialByYear[candidate],
    );
    return (
      completeAlternative ??
      availableYears.find((candidate) => candidate !== year) ??
      ""
    );
  };

  const handleBaseChange = (e) => {
    const nextBase = e.target.value;
    setComparisonYears(
      nextBase,
      nextBase === compareYear ? pickAlternativeYear(nextBase) : compareYear,
    );
  };

  const handleCompareChange = (e) => {
    const nextCompare = e.target.value;
    setComparisonYears(
      nextCompare === baseYear ? pickAlternativeYear(nextCompare) : baseYear,
      nextCompare,
    );
  };

  const comparisonSelects = [
    {
      id: "compare-base",
      label: t("compare.baseYear"),
      value: baseYear,
      onChange: handleBaseChange,
    },
    {
      id: "compare-year",
      label: t("compare.compareYear"),
      value: compareYear,
      onChange: handleCompareChange,
    },
  ];

  const handleReset = () => {
    if (showComparisonFilters) {
      const query = buildComparisonQuery(
        comparisonDefaults.baseYear,
        comparisonDefaults.compareYear,
        "",
      );
      navigate(`/${currentLang}/compare${query ? `?${query}` : ""}`);
      return;
    }

    const defaultYear = availableYears[0];
    const params = new URLSearchParams();
    params.set("year", defaultYear);
    params.delete("currency");
    if (showSortingFilters) {
      navigate(`/${currentLang}/registry?${params.toString()}`);
    } else {
      navigate(`/${currentLang}/?${params.toString()}`);
    }
  };

  return (
    <nav className="navbar bg-primary py-3 sticky-top shadow-lg">
      <div className="container">
        <div
          className={`row align-items-center justify-content-between gy-2 gx-3 flex-fill nav-fill`}
        >
          <div className="col-xxl-auto">
            <ul className="nav nav-pills text-uppercase text-bg-secondary rounded gap-0">
              <li className="nav-item">
                <NavLink
                  end
                  className={`nav-link py-3${collapseHomeRightPadding ? " pe-0" : ""}`}
                  to={overviewPath}
                  title={t("nav.home")}
                >
                  <Icon name="house" />
                  <span className="visually-hidden">{t("nav.home")}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link py-3"
                  to={registryPath}
                  title={t("nav.registry")}
                >
                  <Icon name="card-list" className="d-sm-none" />
                  <span className="d-none d-sm-block">{t("nav.registry")}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link py-3"
                  to={comparePath}
                  title={t("nav.compare")}
                >
                  <Icon name="arrow-left-right" className="d-sm-none" />
                  <span className="d-none d-sm-block">{t("nav.compare")}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink
                  className="nav-link py-3"
                  to={aboutPath}
                  title={t("nav.about")}
                >
                  <Icon name="question-square" className="d-sm-none" />
                  <span className="d-none d-sm-block">{t("nav.about")}</span>
                </NavLink>
              </li>
            </ul>
          </div>
          {showFilters && (
            <div
              className={`${showSortingFilters ? `col-xxl-8` : `col-xxl-6`}`}
            >
              <div className="row g-2">
                {showComparisonFilters ? (
                  comparisonSelects.map((select) => (
                    <div className="col-md-3 flex-fill" key={select.id}>
                      <div className="form-floating flex-fill">
                        <select
                          value={select.value}
                          className="form-select"
                          id={select.id}
                          onChange={select.onChange}
                        >
                          {availableYears.map((year) => (
                            <option key={year} value={year}>
                              {year}
                              {partialByYear[year]
                                ? ` (${t("compare.partialShort")})`
                                : ""}
                            </option>
                          ))}
                        </select>
                        <label htmlFor={select.id}>{select.label}</label>
                      </div>
                    </div>
                  ))
                ) : (
                  <>
                    <div
                      className={`${showSortingFilters ? `col-md-2` : `col-md-3`} flex-fill`}
                    >
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
                    </div>
                    <div
                      className={`${showSortingFilters ? `col-md-2` : `col-md-3`} flex-fill`}
                    >
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
                    </div>
                    {showSortingFilters && (
                      <>
                        <div className="col-md-2 flex-fill">
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
                            <label htmlFor="sorting">
                              {t("nav.sorting")}
                            </label>
                          </div>
                        </div>
                        {selectedSorting !== DEFAULT_SORTING && (
                          <div className="col-md-2 flex-fill">
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
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                <div
                  className={`col-auto ${showSortingFilters ? `col-md-2` : `col-md-3`} flex-fill`}
                >
                  <CurrencySwitcher />
                </div>
                {!isDefault && (
                  <div className="col-auto">
                    <button
                      type="button"
                      className={`btn btn-outline-light p-3`}
                      onClick={handleReset}
                      title={t("nav.reset")}
                    >
                      <Icon name="arrow-counterclockwise" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
