import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import { useData } from "../hooks/useData";
import TableFooterValue from "./TableFooterValue";
import {
  CHART_OPTIONS,
  INCOME_COLOR,
  EXPENSES_COLOR,
  FINRESULT_COLOR,
} from "../utils/charts";
import {
  getLocalizedCompanyName,
  getLocalizedCompanyDescription,
} from "../utils/localizeCompanyName";

const toCleanName = (name) => cleanName(transliterate(name));
const FIN_RES_KEY = "Финансиски резултат";

function Company() {
  const { t, i18n } = useTranslation();
  const { lang, company: currentCompanyParam } = useParams();
  const currentLang = lang || i18n.language || "mk";
  const navigate = useNavigate();
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
        (el) => toCleanName(el.Назив) === currentCompanyParam,
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

  const goToCompany = (idx) => {
    if (idx < 0 || idx >= pretprijatija.length) return;
    const path = toCleanName(pretprijatija[idx].Назив);
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
        (item) => item.Назив === currentCompany.Назив,
      );
      companyYearData.forEach((item) => {
        data.push({ ...item, Година: y });
      });
    });
    return data.sort((a, b) => {
      if (a.Година !== b.Година) return b.Година.localeCompare(a.Година);
      return a.Квартал - b.Квартал;
    });
  }, [currentCompany, allMoney, availableYears]);

  const filteredData = useMemo(() => {
    if (!companyData) return [];
    if (!selectedYear || selectedYear === "") return companyData;
    return companyData.filter((item) => item.Година === selectedYear);
  }, [companyData, selectedYear]);

  const totals = useMemo(() => {
    return {
      income: sumDecimalNumbers(filteredData.map((item) => item.Приходи)),
      expenses: sumDecimalNumbers(filteredData.map((item) => item.Расходи)),
      "financial-result": sumDecimalNumbers(
        filteredData.map((item) => item[FIN_RES_KEY]),
      ),
    };
  }, [filteredData]);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const showQuarterly = selectedYear && selectedYear !== "";
    const groupKey = showQuarterly ? "Квартал" : "Година";

    const grouped = {};
    filteredData.forEach((item) => {
      const key = item[groupKey];
      if (!grouped[key]) {
        grouped[key] = { Приходи: [], Расходи: [], [FIN_RES_KEY]: [] };
      }
      grouped[key].Приходи.push(item.Приходи);
      grouped[key].Расходи.push(item.Расходи);
      grouped[key][FIN_RES_KEY].push(item[FIN_RES_KEY]);
    });

    const keys = Object.keys(grouped).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return showQuarterly ? numA - numB : b.localeCompare(a);
    });

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
          keys.map((k) => sumDecimalNumbers(grouped[k].Приходи)),
          INCOME_COLOR,
          false,
        ),
        createDataset(
          t("cards.expenses"),
          keys.map((k) => sumDecimalNumbers(grouped[k].Расходи)),
          EXPENSES_COLOR,
          false,
        ),
        createDataset(
          t("cards.financial-result"),
          keys.map((k) => sumDecimalNumbers(grouped[k][FIN_RES_KEY])),
          FINRESULT_COLOR,
          true,
        ),
      ],
    };
  }, [filteredData, selectedYear, t]);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    chartRef.current.chart = new Chart(chartRef.current, {
      type: "line",
      data: chartData,
      options: CHART_OPTIONS,
    });

    const chartNode = chartRef.current;

    return () => {
      if (chartNode?.chart) {
        chartNode.chart.destroy();
        chartNode.chart = null;
      }
    };
  }, [chartData]);

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
    <div className="container my-5 flex-fill">
      <div className="row g-5 align-items-end mb-3">
        <div className="col-lg-8 vstack">
          <h1 className="h3 mb-3">
            {getLocalizedCompanyName(currentCompany, currentLang)}
          </h1>
          <p>{getLocalizedCompanyDescription(currentCompany, currentLang)}</p>
          {currentCompany["Мрежно место"] && (
            <a
              title={`Мрежно место на ${currentCompany.Назив}`}
              target="_blank"
              className="btn btn-outline-secondary align-self-start"
              href={currentCompany["Мрежно место"]}
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
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label htmlFor="years">{t("nav.year")}</label>
          </div>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <>
          {chartData && (
            <div className="my-5">
              <h2 className="h5 mb-3">{t("company.chartTitle")}</h2>
              <div style={{ height: "360px" }}>
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
                  const finResult = item[FIN_RES_KEY];
                  const finResultNum =
                    finResult != null ? parseDecimalNumber(finResult) : "—";
                  const finResultColor =
                    finResult != null && parseInt(finResultNum) < 0
                      ? "danger"
                      : "success";
                  return (
                    <tr key={idx}>
                      <td>{item.Година}</td>
                      <td>
                        {item.Квартал === 0
                          ? t("company.allQuarters")
                          : item.Квартал}
                      </td>
                      <td className="text-end">
                        {item.Приходи != null
                          ? parseDecimalNumber(item.Приходи)
                          : "—"}
                      </td>
                      <td className="text-end">
                        {item.Расходи != null
                          ? parseDecimalNumber(item.Расходи)
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
                  <th>{t("cards.total")}</th>
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
          <div className="row row-cols-2 g-3 my-3">
            <div className="col vstack">
              {previousCompanyIndex >= 0 && (
                <div className="list-group flex-fill">
                  <button
                    className="list-group-item list-group-item-action p-4 flex-fill"
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
                    className="list-group-item list-group-item-action p-4 flex-fill"
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
    </div>
  );
}

export default Company;
