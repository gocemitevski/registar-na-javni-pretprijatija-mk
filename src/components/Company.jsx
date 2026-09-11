import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";
import {
  formatDecimalNumber,
  parseDecimalNumber,
  sumDecimalNumbers,
} from "../utils/decimalNumbers";
import { useData } from "../hooks/useData";
import DataErrorView from "./DataErrorView";
import Loading from "./Loading";
import TableFooterValue from "./TableFooterValue";
import CurrencySwitcher from "./CurrencySwitcher";
import {
  INCOME_COLOR,
  EXPENSES_COLOR,
  FINRESULT_COLOR,
  createChartOptions,
  CHART_HEIGHT,
} from "../utils/charts";
import {
  getLocalizedCompanyName,
  getLocalizedCompanyDescription,
  getLocalizedDirectorName,
} from "../utils/localizeCompanyName";
import { updateDocumentMeta } from "../hooks/usePageTitle";
import { isValidHttpUrl } from "../utils/isValidUrl";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../utils/columns";
import { CURRENCIES } from "../utils/currencies";
import { useUrlParams } from "../hooks/useUrlParams";

const toCleanName = (name) => cleanName(transliterate(name ?? ""));

function Company() {
  const { t, i18n } = useTranslation();
  const { company: currentCompanyParam } = useParams();
  const currentLang = i18n.language || "mk";
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedCurrency: currency } = useUrlParams([], []);
  const {
    pretprijatija,
    allMoney,
    availableYears,
    loading: dataLoading,
    hasError,
    errorInfo,
    retry,
  } = useData();
  const chartRef = useRef(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const companyIndex = useMemo(
    () =>
      pretprijatija.findIndex(
        (el) =>
          toCleanName(el[COMPANY_SHEET_COLUMNS.NAME]) === currentCompanyParam,
      ),
    [pretprijatija, currentCompanyParam],
  );

  const currentCompany = useMemo(
    () => (companyIndex >= 0 ? pretprijatija[companyIndex] : null),
    [pretprijatija, companyIndex],
  );

  const previousCompanyIndex = useMemo(
    () => (companyIndex > 0 ? companyIndex - 1 : -1),
    [companyIndex],
  );

  const nextCompanyIndex = useMemo(
    () =>
      companyIndex >= 0 && companyIndex < pretprijatija.length - 1
        ? companyIndex + 1
        : -1,
    [companyIndex, pretprijatija.length],
  );

  const previousCompany = useMemo(
    () =>
      previousCompanyIndex >= 0 ? pretprijatija[previousCompanyIndex] : null,
    [pretprijatija, previousCompanyIndex],
  );

  const nextCompany = useMemo(
    () => (nextCompanyIndex >= 0 ? pretprijatija[nextCompanyIndex] : null),
    [pretprijatija, nextCompanyIndex],
  );

  useEffect(() => {
    if (!currentCompany) return;

    updateDocumentMeta(location, t, currentCompany, currentLang);
  }, [currentCompany, currentLang, t, location]);

  const goToCompany = (idx) => {
    if (idx < 0 || idx >= pretprijatija.length) return;
    const path = toCleanName(pretprijatija[idx][COMPANY_SHEET_COLUMNS.NAME]);
    if (path) {
      window.scrollTo(0, 0);
      navigate(`/${currentLang}/company/${path}${location.search}`);
    }
  };

  const handleYearChange = (e) => {
    const newYear = e.target.value || null;
    setSelectedYear(newYear);
    const params = new URLSearchParams(location.search);
    if (!newYear) {
      params.delete("year");
    } else {
      params.set("year", newYear);
    }
    const newSearch = params.toString();
    const basePath = location.pathname;
    navigate(`${basePath}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
      preventScrollReset: true,
    });
  };

  const companyData = useMemo(() => {
    if (!currentCompany || Object.keys(allMoney).length === 0) return null;

    const data = [];
    availableYears.forEach((y) => {
      const yearData = allMoney[y] || [];
      const companyYearData = yearData.filter(
        (item) =>
          item[MONEY_SHEET_COLUMNS.NAME] ===
          currentCompany[COMPANY_SHEET_COLUMNS.NAME],
      );
      companyYearData.forEach((item) => {
        data.push({ ...item, [MONEY_SHEET_COLUMNS.YEAR]: y });
      });
    });
    return data.sort((a, b) => {
      if (a[MONEY_SHEET_COLUMNS.YEAR] !== b[MONEY_SHEET_COLUMNS.YEAR])
        return b[MONEY_SHEET_COLUMNS.YEAR].localeCompare(
          a[MONEY_SHEET_COLUMNS.YEAR],
        );
      return a[MONEY_SHEET_COLUMNS.QUARTER] - b[MONEY_SHEET_COLUMNS.QUARTER];
    });
  }, [currentCompany, allMoney, availableYears]);

  const companyYears = useMemo(() => {
    if (!companyData) return [];
    const years = [
      ...new Set(companyData.map((item) => item[MONEY_SHEET_COLUMNS.YEAR])),
    ];
    return years.sort((a, b) => b.localeCompare(a));
  }, [companyData]);

  const filteredData = useMemo(() => {
    if (!companyData) return [];
    if (!selectedYear || selectedYear === "") return companyData;
    return companyData.filter(
      (item) => item[MONEY_SHEET_COLUMNS.YEAR] === selectedYear,
    );
  }, [companyData, selectedYear]);

  const totals = useMemo(() => {
    return {
      income: sumDecimalNumbers(
        filteredData.map((item) => item[MONEY_SHEET_COLUMNS.INCOME]),
      ),
      expenses: sumDecimalNumbers(
        filteredData.map((item) => item[MONEY_SHEET_COLUMNS.EXPENSES]),
      ),
      "financial-result": sumDecimalNumbers(
        filteredData.map((item) => item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
      ),
    };
  }, [filteredData]);

  const directorsTimeline = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return [];
    const sorted = [...filteredData]
      .filter((item) =>
        item[MONEY_SHEET_COLUMNS.DIRECTOR]?.toString().trim(),
      )
      .sort((a, b) => {
        if (a[MONEY_SHEET_COLUMNS.YEAR] !== b[MONEY_SHEET_COLUMNS.YEAR])
          return a[MONEY_SHEET_COLUMNS.YEAR].localeCompare(
            b[MONEY_SHEET_COLUMNS.YEAR],
          );
        return a[MONEY_SHEET_COLUMNS.QUARTER] - b[MONEY_SHEET_COLUMNS.QUARTER];
      });
    const timeline = [];
    sorted.forEach((item) => {
      const director = item[MONEY_SHEET_COLUMNS.DIRECTOR].toString().trim();
      if (
        timeline.length > 0 &&
        timeline[timeline.length - 1].director === director
      )
        return;
      timeline.push({
        year: item[MONEY_SHEET_COLUMNS.YEAR],
        quarter: item[MONEY_SHEET_COLUMNS.QUARTER],
        director,
      });
    });
    return timeline;
  }, [filteredData]);

  const directorsMaxYear = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;
    let max = null;
    filteredData.forEach((item) => {
      // Only years backed by an actual director value count as evidence,
      // so the incumbent's end badge never outruns the data.
      if (!item[MONEY_SHEET_COLUMNS.DIRECTOR]?.toString().trim()) return;
      const year = item[MONEY_SHEET_COLUMNS.YEAR];
      if (max === null || year.localeCompare(max) > 0) max = year;
    });
    return max;
  }, [filteredData]);

  const showDirectorRanges = !selectedYear || selectedYear === "";

  const directorStats = useMemo(() => {
    if (!showDirectorRanges || directorsTimeline.length < 2) return null;
    // Attribute each change to the year the new director took over,
    // then look for 2+ changes across any two back-to-back years.
    const changeYears = [];
    for (let i = 1; i < directorsTimeline.length; i++) {
      changeYears.push(parseInt(directorsTimeline[i].year, 10));
    }
    let best = null;
    const minYear = Math.min(...changeYears);
    const maxYear = Math.max(...changeYears);
    // Windows are capped at maxYear so the warning never names a year
    // beyond the dataset (e.g. "2024–2025" when 2024 is the latest data).
    for (let from = minYear - 1; from < maxYear; from++) {
      const to = from + 1;
      const changes = changeYears.filter((y) => y === from || y === to).length;
      if (changes >= 2 && (!best || changes > best.changes)) {
        best = { changes, from, to };
      }
    }
    return best;
  }, [directorsTimeline, showDirectorRanges]);

  // Other companies each director served at, keyed by raw Cyrillic name
  // to match timeline entries before localization. One entry per stint
  // (return tenures are listed separately, not merged).
  // End year follows timeline semantics: the year the next tenure at that
  // company started (or the latest evidenced year for an ongoing tenure),
  // so details spans always agree with timeline badges.
  const directorOtherCompanies = useMemo(() => {
    if (!currentCompany || Object.keys(allMoney).length === 0) return {};
    const currentName = currentCompany[COMPANY_SHEET_COLUMNS.NAME];
    const rowsByCompany = {};
    availableYears.forEach((y) => {
      (allMoney[y] || []).forEach((item) => {
        const director = item[MONEY_SHEET_COLUMNS.DIRECTOR]
          ?.toString()
          .trim();
        const company = item[MONEY_SHEET_COLUMNS.NAME];
        if (
          !director ||
          !company ||
          company === currentName ||
          !toCleanName(company)
        )
          return;
        (rowsByCompany[company] ??= []).push({
          director,
          year: y,
          quarter: item[MONEY_SHEET_COLUMNS.QUARTER],
        });
      });
    });
    const stintsByDirector = {};
    Object.entries(rowsByCompany).forEach(([company, rows]) => {
      rows.sort(
        (a, b) =>
          a.year.localeCompare(b.year) || a.quarter - b.quarter,
      );
      const tenures = [];
      rows.forEach(({ director, year }) => {
        if (
          tenures.length > 0 &&
          tenures[tenures.length - 1].director === director
        )
          return;
        tenures.push({ director, year });
      });
      const maxEvYear = rows[rows.length - 1].year;
      tenures.forEach((tenure, i) => {
        (stintsByDirector[tenure.director] ??= []).push({
          company,
          from: tenure.year,
          to: i + 1 < tenures.length ? tenures[i + 1].year : maxEvYear,
        });
      });
    });
    const result = {};
    Object.entries(stintsByDirector).forEach(([director, stints]) => {
      result[director] = stints.sort((a, b) =>
        a.from.localeCompare(b.from),
      );
    });
    return result;
  }, [currentCompany, allMoney, availableYears]);

  const companyNameByName = useMemo(() => {
    const map = {};
    pretprijatija.forEach((row) => {
      map[row[COMPANY_SHEET_COLUMNS.NAME]] = row;
    });
    return map;
  }, [pretprijatija]);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const showQuarterly = selectedYear && selectedYear !== "";
    const groupKey = showQuarterly
      ? MONEY_SHEET_COLUMNS.QUARTER
      : MONEY_SHEET_COLUMNS.YEAR;

    const grouped = {};
    filteredData.forEach((item) => {
      const key = item[groupKey];
      if (!grouped[key]) {
        grouped[key] = {
          [MONEY_SHEET_COLUMNS.INCOME]: [],
          [MONEY_SHEET_COLUMNS.EXPENSES]: [],
          [MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]: [],
        };
      }
      grouped[key][MONEY_SHEET_COLUMNS.INCOME].push(
        item[MONEY_SHEET_COLUMNS.INCOME],
      );
      grouped[key][MONEY_SHEET_COLUMNS.EXPENSES].push(
        item[MONEY_SHEET_COLUMNS.EXPENSES],
      );
      grouped[key][MONEY_SHEET_COLUMNS.FINANCIAL_RESULT].push(
        item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT],
      );
    });

    let keys = Object.keys(grouped);
    if (showQuarterly) {
      keys = keys.sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    } else {
      keys = keys.sort((a, b) => a.localeCompare(b));
    }

    const labels = keys.map((k) =>
      showQuarterly ? (k === "0" ? t("company.allQuarters") : k) : k,
    );

    const rate = CURRENCIES[currency]?.rate || 1;

    const createDataset = (label, data, color, isDashed) => ({
      label,
      data: data.map((v) => v * rate),
      borderColor: color.border,
      backgroundColor: color.bg,
      borderDash: isDashed ? [5, 5] : undefined,
      tension: 0.5,
    });

    return {
      labels,
      datasets: [
        createDataset(
          t("cards.income"),
          keys.map((k) =>
            sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.INCOME]),
          ),
          INCOME_COLOR,
          false,
        ),
        createDataset(
          t("cards.expenses"),
          keys.map((k) =>
            sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.EXPENSES]),
          ),
          EXPENSES_COLOR,
          false,
        ),
        createDataset(
          t("cards.financial-result"),
          keys.map((k) =>
            sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
          ),
          FINRESULT_COLOR,
          true,
        ),
      ],
    };
  }, [filteredData, selectedYear, t, currency]);

  const chartOptions = useMemo(
    () => createChartOptions(currentLang, true, currency),
    [currentLang, currency],
  );

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    chartRef.current.chart = new Chart(chartRef.current, {
      type: "line",
      data: chartData,
      options: chartOptions,
    });

    const chartNode = chartRef.current;

    return () => {
      if (chartNode?.chart) {
        chartNode.chart.destroy();
        chartNode.chart = null;
      }
    };
  }, [chartData, chartOptions]);

  if (dataLoading) {
    return <Loading />;
  }

  if (hasError) {
    return <DataErrorView errorInfo={errorInfo} onRetry={retry} />;
  }

  if (!currentCompany) {
    return (
      <div className="container my-5 flex-fill">
        <div className="row">
          <div className="col-lg-8">
            <h1 className="h4 mb-3">{t("company.notFound")}</h1>
            <p className="opacity-75">{t("company.notFoundDesc")}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container my-5 flex-fill">
      <div className="row g-3 g-lg-5 align-items-end mb-xl-3">
        <div className="col-lg-8 vstack">
          <h1 className="h3 mb-3">
            {getLocalizedCompanyName(currentCompany, currentLang)}
          </h1>
          <p>{getLocalizedCompanyDescription(currentCompany, currentLang)}</p>
          {currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE] &&
            isValidHttpUrl(currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE]) && (
              <a
                title={`Мрежно место на ${currentCompany[COMPANY_SHEET_COLUMNS.NAME]}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline-secondary align-self-start"
                href={currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE]}
              >
                <i className="bi bi-box-arrow-up-right"></i>
              </a>
            )}
        </div>
        <div className="col-lg-4 align-items-end">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="form-floating">
                <select
                  value={selectedYear || ""}
                  className="form-select"
                  id="years"
                  onChange={handleYearChange}
                >
                  <option value="">{t("company.allYears")}</option>
                  {companyYears.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <label htmlFor="years">{t("nav.year")}</label>
              </div>
            </div>
            <div className="col-md-6">
              <CurrencySwitcher />
            </div>
          </div>
        </div>
      </div>

      {(filteredData?.length ?? 0) > 0 ? (
        <>
          {chartData && (
            <div className="my-4 my-lg-5">
              <h2 className="h5 mb-3">{t("company.chartTitle")}</h2>
              <div style={{ height: CHART_HEIGHT }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          )}
          <div className="my-4 my-lg-5">
            <div className="hstack flex-wrap gap-2 gap-lg-3 mb-3">
              <h2 className="h5 mb-0">{t("company.directors")}</h2>
              {directorStats && (
                <div
                  className="alert alert-warning hstack fs-sm gap-2 px-3 py-2 mb-0 ms-auto"
                  role="alert"
                >
                  <i
                    className="bi bi-exclamation-triangle-fill flex-shrink-0"
                    aria-hidden="true"
                  ></i>
                  <span>
                    {t("company.directorChanges", {
                      changes: directorStats.changes,
                      from: directorStats.from,
                      to: directorStats.to,
                    })}
                  </span>
                </div>
              )}
            </div>
            {directorsTimeline.length > 0 ? (
              <ol className="directors-timeline list-unstyled mb-0">
                {directorsTimeline.map((entry, idx) => {
                  const endYear =
                    idx < directorsTimeline.length - 1
                      ? directorsTimeline[idx + 1].year
                      : (directorsMaxYear ?? entry.year);
                  const others =
                    directorOtherCompanies[entry.director] ?? [];
                  const otherCompanyCount = new Set(
                    others.map((o) => o.company),
                  ).size;
                  return (
                    <li
                      key={`${entry.year}-${entry.quarter}-${entry.director}-${idx}`}
                      className={`d-flex position-relative directors-timeline-item ${idx === directorsTimeline.length - 1 ? "pb-0" : "pb-3"}`}
                    >
                      <div
                        className="directors-timeline-rail flex-shrink-0"
                        aria-hidden="true"
                      >
                        <span className="directors-timeline-dot d-block mx-auto flex-shrink-0 position-relative z-1 rounded-circle bg-secondary"></span>
                      </div>
                      <div className="ms-3 flex-fill hstack flex-wrap gap-2 gap-lg-3 align-items-center">
                        {showDirectorRanges ? (
                          <span className="hstack gap-2 flex-shrink-0">
                            <span className="badge text-bg-light">
                              {entry.year}
                            </span>
                            <span className="hstack gap-2 me-1">
                              <span>–</span>
                              <span className="badge text-bg-light">
                                {endYear}
                              </span>
                            </span>
                          </span>
                        ) : (
                          <span className="badge text-bg-light flex-shrink-0 me-1">
                            {entry.year}
                          </span>
                        )}
                        <div className="border rounded px-3 py-2 shadow-sm bg-body flex-fill">
                          {others.length > 0 ? (
                            <details className="director-details">
                              <summary className="hstack flex-wrap gap-2">
                                <strong className="fw-semibold me-auto">
                                  {getLocalizedDirectorName(
                                    entry.director,
                                    currentLang,
                                  )}
                                </strong>
                                <span className="badge text-bg-success fw-normal text-wrap">
                                  {otherCompanyCount === 1
                                    ? t("company.directorAlsoIn_singular", {
                                        count: otherCompanyCount,
                                      })
                                    : t("company.directorAlsoIn", {
                                        count: otherCompanyCount,
                                      })}
                                  <i
                                    className="bi bi-chevron-down ms-1 director-details-chevron"
                                    aria-hidden="true"
                                  ></i>
                                </span>
                              </summary>
                              <ul className="list-unstyled vstack gap-1 mt-2 mb-0 small">
                                {others.map((o, oIdx) => {
                                  const row = companyNameByName[o.company];
                                  return (
                                    <li
                                      key={`${o.company}-${o.from}-${o.to}-${oIdx}`}
                                      className="hstack flex-wrap gap-2"
                                    >
                                      {row ? (
                                        <Link
                                          className="fw-bolder"
                                          to={`/${currentLang}/company/${toCleanName(o.company)}${location.search}`}
                                        >
                                          {getLocalizedCompanyName(
                                            row,
                                            currentLang,
                                          )}
                                        </Link>
                                      ) : (
                                        <span className="fw-bolder">
                                          {o.company}
                                        </span>
                                      )}
                                      <span className="ms-auto hstack gap-2 flex-shrink-0">
                                        <span className="badge text-bg-light">
                                          {o.from}
                                        </span>
                                        <span>–</span>
                                        <span className="badge text-bg-light">
                                          {o.to}
                                        </span>
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </details>
                          ) : (
                            <strong className="fw-semibold">
                              {getLocalizedDirectorName(
                                entry.director,
                                currentLang,
                              )}
                            </strong>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            ) : (
              <div className="alert alert-secondary">
                {t("company.noDirectors")}
              </div>
            )}
          </div>
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>{t("company.year")}</th>
                  <th>{t("company.quarter")}</th>
                  <th className="text-end">{t("cards.income")}</th>
                  <th className="text-end">{t("cards.expenses")}</th>
                  <th className="text-end">{t("cards.financial-result")}</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((item, idx) => {
                  const finResult = item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT];
                  const finResultNum =
                    finResult != null
                      ? parseDecimalNumber(finResult, currentLang, currency)
                      : "—";
                  const finResultColor =
                    finResult != null && formatDecimalNumber(finResult) < 0
                      ? "danger"
                      : "success";
                  return (
                    <tr key={idx}>
                      <td>{item[MONEY_SHEET_COLUMNS.YEAR]}</td>
                      <td>
                        {item[MONEY_SHEET_COLUMNS.QUARTER] === 0
                          ? t("company.allQuarters")
                          : item[MONEY_SHEET_COLUMNS.QUARTER]}
                      </td>
                      <td className="text-end">
                        {item[MONEY_SHEET_COLUMNS.INCOME] != null
                          ? parseDecimalNumber(
                              item[MONEY_SHEET_COLUMNS.INCOME],
                              currentLang,
                              currency,
                            )
                          : "—"}
                      </td>
                      <td className="text-end">
                        {item[MONEY_SHEET_COLUMNS.EXPENSES] != null
                          ? parseDecimalNumber(
                              item[MONEY_SHEET_COLUMNS.EXPENSES],
                              currentLang,
                              currency,
                            )
                          : "—"}
                      </td>
                      <td className={`text-end text-${finResultColor}`}>
                        {finResultNum}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th>{t("table.total")}</th>
                  <th></th>
                  <th className="text-end">
                    <TableFooterValue
                      title={t("cards.income")}
                      total={totals.income}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title={t("cards.expenses")}
                      total={totals.expenses}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title={t("cards.financial-result")}
                      total={totals["financial-result"]}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="row row-cols-1 row-cols-md-2 g-3 my-1 my-xl-3">
            <div className="col vstack">
              {previousCompanyIndex >= 0 && (
                <div className="list-group flex-fill">
                  <button
                    className="list-group-item list-group-item-action btn-link-arrow-prev p-4 flex-fill shadow-sm"
                    onClick={() => goToCompany(previousCompanyIndex)}
                    title={t("company.prevCompany")}
                    type="button"
                  >
                    <h5 className="h6 me-5">
                      {getLocalizedCompanyName(previousCompany, currentLang)}
                    </h5>
                    <i className="bi bi-arrow-left text-primary"></i>
                  </button>
                </div>
              )}
            </div>
            <div className="col vstack">
              {nextCompanyIndex >= 0 && (
                <div className="list-group flex-fill text-end">
                  <button
                    className="list-group-item list-group-item-action btn-link-arrow-next p-4 flex-fill shadow-sm"
                    onClick={() => goToCompany(nextCompanyIndex)}
                    title={t("company.nextCompany")}
                    type="button"
                  >
                    <h5 className="h6 ms-5">
                      {getLocalizedCompanyName(nextCompany, currentLang)}
                    </h5>
                    <i className="bi bi-arrow-right text-primary"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-warning mt-5">{t("company.noData")}</div>
      )}
    </main>
  );
}

export default Company;
