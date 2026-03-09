import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import { useData } from "../hooks/useData";
import TableFooterValue from "./TableFooterValue";
import { CHART_OPTIONS, INCOME_COLOR, OUTCOME_COLOR, FINRESULT_COLOR } from "../utils/charts";

const toCleanName = (name) => cleanName(transliterate(name));
const FIN_RES_KEY = "Финансиски резултат";

function Company() {
  const { company: currentCompanyParam } = useParams();
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
    () => pretprijatija.findIndex((el) => toCleanName(el.Назив) === currentCompanyParam),
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
    () => (companyIndex >= 0 && companyIndex < pretprijatija.length - 1 ? companyIndex + 1 : -1),
    [companyIndex, pretprijatija.length],
  );

  const previousCompanyName = useMemo(
    () => (previousCompanyIndex >= 0 ? pretprijatija[previousCompanyIndex].Назив : null),
    [pretprijatija, previousCompanyIndex],
  );

  const nextCompanyName = useMemo(
    () => (nextCompanyIndex >= 0 ? pretprijatija[nextCompanyIndex].Назив : null),
    [pretprijatija, nextCompanyIndex],
  );

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentCompanyParam]);

  const goToCompany = (idx) => {
    if (idx < 0 || idx >= pretprijatija.length) return;
    const path = toCleanName(pretprijatija[idx].Назив);
    if (path) {
      navigate(`/company/${path}`);
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
      outcome: sumDecimalNumbers(filteredData.map((item) => item.Расходи)),
      financialResult: sumDecimalNumbers(
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
      showQuarterly ? (k === "0" ? "Сите квартали" : k) : k,
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
          "Приходи",
          keys.map((k) => sumDecimalNumbers(grouped[k].Приходи)),
          INCOME_COLOR,
          false,
        ),
        createDataset(
          "Расходи",
          keys.map((k) => sumDecimalNumbers(grouped[k].Расходи)),
          OUTCOME_COLOR,
          false,
        ),
        createDataset(
          "Финансиски резултат",
          keys.map((k) => sumDecimalNumbers(grouped[k][FIN_RES_KEY])),
          FINRESULT_COLOR,
          true,
        ),
      ],
    };
  }, [filteredData, selectedYear]);

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
              <span className="visually-hidden">Loading...</span>
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
              Грешка при вчитување на податоците: {error}
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
            <h1 className="h4">Претпријатието не е пронајдено</h1>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container my-5 flex-fill">
      <div className="row g-5 align-items-end mb-3">
        <div className="col-lg-8 vstack">
          <h1 className="h3 mb-3">{currentCompany.Назив}</h1>
          <p>{currentCompany.Опис}</p>
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
              <option value="">Сите години</option>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <label htmlFor="years">Година</label>
          </div>
        </div>
      </div>

      {filteredData.length > 0 ? (
        <>
          {chartData && (
            <div className="my-5">
              <h2 className="h5 mb-3">
                Графички приказ на приходи, расходи и финансиски резултати низ
                годините
              </h2>
              <div style={{ height: "360px" }}>
                <canvas ref={chartRef}></canvas>
              </div>
            </div>
          )}
          <div className="table-responsive">
            <table className="table table-striped table-hover">
              <thead>
                <tr>
                  <th>Година</th>
                  <th>Квартал</th>
                  <th className="text-end">Приходи</th>
                  <th className="text-end">Расходи</th>
                  <th className="text-end">Финансиски резултат</th>
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
                        {item.Квартал === 0 ? "Сите квартали" : item.Квартал}
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
                  <th>Вкупно</th>
                  <th></th>
                  <th className="text-end">
                    <TableFooterValue
                      title="Приходи"
                      total={totals.income}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title="Расходи"
                      total={totals.outcome}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title="Финансиски резултат"
                      total={totals.financialResult}
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
                    title="Претходно претпријатие"
                    type="button"
                  >
                    <h5 className="h6 me-5">{previousCompanyName}</h5>
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
                    title="Следно претпријатие"
                    type="button"
                  >
                    <h5 className="h6 ms-5">{nextCompanyName}</h5>
                    <i className="bi bi-arrow-right text-primary"></i>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="alert alert-warning mt-5">
          Нема податоци за избраната година.
        </div>
      )}
    </div>
  );
}

export default Company;
