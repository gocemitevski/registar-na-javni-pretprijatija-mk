import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { formatDecimalNumber, parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import { useData } from "../hooks/useData";
import TableFooterValue from "./TableFooterValue";
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
} from "../utils/localizeCompanyName";
import { updateDocumentMeta } from "../hooks/usePageTitle";
import { isValidHttpUrl } from "../utils/isValidUrl";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../utils/columns";

const toCleanName = (name) => cleanName(transliterate(name));

function Company() {
  const { t, i18n } = useTranslation();
  const { company: currentCompanyParam } = useParams();
  const currentLang = i18n.language || "mk";
  const navigate = useNavigate();
  const location = useLocation();
  const {
    pretprijatija,
    allMoney,
    availableYears,
    loading: dataLoading,
    error,
  } = useData();
  const [selectedYear, setSelectedYear] = useState(null);
  const chartRef = useRef(null);

  const companyIndex = useMemo(
    () =>
      pretprijatija.findIndex(
        (el) => toCleanName(el[COMPANY_SHEET_COLUMNS.NAME]) === currentCompanyParam,
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
    window.scrollTo(0, 0);
  }, [currentCompanyParam]);

  useEffect(() => {
    if (!currentCompany) return;

    updateDocumentMeta(location, t, currentCompany, currentLang);
  }, [currentCompany, currentLang, t, location]);

  const goToCompany = (idx) => {
    if (idx < 0 || idx >= pretprijatija.length) return;
    const path = toCleanName(pretprijatija[idx][COMPANY_SHEET_COLUMNS.NAME]);
    if (path) {
      navigate(`/${currentLang}/company/${path}`);
    }
  };

  const companyData = useMemo(() => {
    if (!currentCompany || Object.keys(allMoney).length === 0) return null;

    const data = [];
    availableYears.forEach((y) => {
      const yearData = allMoney[y] || [];
      const companyYearData = yearData.filter(
        (item) => item[MONEY_SHEET_COLUMNS.NAME] === currentCompany[COMPANY_SHEET_COLUMNS.NAME],
      );
      companyYearData.forEach((item) => {
        data.push({ ...item, [MONEY_SHEET_COLUMNS.YEAR]: y });
      });
    });
    return data.sort((a, b) => {
      if (a[MONEY_SHEET_COLUMNS.YEAR] !== b[MONEY_SHEET_COLUMNS.YEAR]) return b[MONEY_SHEET_COLUMNS.YEAR].localeCompare(a[MONEY_SHEET_COLUMNS.YEAR]);
      return a[MONEY_SHEET_COLUMNS.QUARTER] - b[MONEY_SHEET_COLUMNS.QUARTER];
    });
  }, [currentCompany, allMoney, availableYears]);

  const companyYears = useMemo(() => {
    if (!companyData) return [];
    const years = [...new Set(companyData.map((item) => item[MONEY_SHEET_COLUMNS.YEAR]))];
    return years.sort((a, b) => b.localeCompare(a));
  }, [companyData]);

  const filteredData = useMemo(() => {
    if (!companyData) return [];
    if (!selectedYear || selectedYear === "") return companyData;
    return companyData.filter((item) => item[MONEY_SHEET_COLUMNS.YEAR] === selectedYear);
  }, [companyData, selectedYear]);

  const totals = useMemo(() => {
    return {
      income: sumDecimalNumbers(filteredData.map((item) => item[MONEY_SHEET_COLUMNS.INCOME])),
      expenses: sumDecimalNumbers(filteredData.map((item) => item[MONEY_SHEET_COLUMNS.EXPENSES])),
      "financial-result": sumDecimalNumbers(
        filteredData.map((item) => item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
      ),
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const showQuarterly = selectedYear && selectedYear !== "";
    const groupKey = showQuarterly ? MONEY_SHEET_COLUMNS.QUARTER : MONEY_SHEET_COLUMNS.YEAR;

    const grouped = {};
    filteredData.forEach((item) => {
      const key = item[groupKey];
      if (!grouped[key]) {
        grouped[key] = { [MONEY_SHEET_COLUMNS.INCOME]: [], [MONEY_SHEET_COLUMNS.EXPENSES]: [], [MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]: [] };
      }
      grouped[key][MONEY_SHEET_COLUMNS.INCOME].push(item[MONEY_SHEET_COLUMNS.INCOME]);
      grouped[key][MONEY_SHEET_COLUMNS.EXPENSES].push(item[MONEY_SHEET_COLUMNS.EXPENSES]);
      grouped[key][MONEY_SHEET_COLUMNS.FINANCIAL_RESULT].push(item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]);
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

    const createDataset = (label, data, color, isDashed) => ({
      label,
      data,
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
          keys.map((k) => sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.INCOME])),
          INCOME_COLOR,
          false,
        ),
        createDataset(
          t("cards.expenses"),
          keys.map((k) => sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.EXPENSES])),
          EXPENSES_COLOR,
          false,
        ),
        createDataset(
          t("cards.financial-result"),
          keys.map((k) => sumDecimalNumbers(grouped[k][MONEY_SHEET_COLUMNS.FINANCIAL_RESULT])),
          FINRESULT_COLOR,
          true,
        ),
      ],
    };
  }, [filteredData, selectedYear, t]);

  const chartOptions = useMemo(
    () => createChartOptions(currentLang, true),
    [currentLang],
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
    return (
      <div className="container my-5 flex-fill">
        <div className="row">
          <div className="col-12 text-center">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">{t("common.loading")}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-5 flex-fill">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              {t("common.error")} {error}
            </div>
          </div>
        </div>
      </div>
    );
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
          {currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE] && isValidHttpUrl(currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE]) && (
            <a
              title={`Мрежно место на ${currentCompany[COMPANY_SHEET_COLUMNS.NAME]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-secondary align-self-start"
              href={currentCompany[COMPANY_SHEET_COLUMNS.WEBSITE]}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
          )}
        </div>
        <div className="col-lg-4 align-items-end">
          <div className="form-floating">
            <select
              value={selectedYear || ""}
              className="form-select"
              id="years"
              onChange={(e) => setSelectedYear(e.target.value || null)}
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
                      ? parseDecimalNumber(finResult, currentLang)
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
                          ? parseDecimalNumber(item[MONEY_SHEET_COLUMNS.INCOME], currentLang)
                          : "—"}
                      </td>
                      <td className="text-end">
                        {item[MONEY_SHEET_COLUMNS.EXPENSES] != null
                          ? parseDecimalNumber(item[MONEY_SHEET_COLUMNS.EXPENSES], currentLang)
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
