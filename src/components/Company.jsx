import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Chart from "chart.js/auto";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import { useData } from "../hooks/useData";
import TableFooterValue from "./TableFooterValue";

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

  const currentCompany = pretprijatija.find(
    (el) => cleanName(transliterate(el.Назив)) === currentCompanyParam,
  );

  const companyIndex = pretprijatija.findIndex(
    (el) => cleanName(transliterate(el.Назив)) === currentCompanyParam,
  );
  const previousCompanyIndex = companyIndex > 0 ? companyIndex - 1 : -1;
  const nextCompanyIndex =
    companyIndex >= 0 && companyIndex < pretprijatija.length - 1
      ? companyIndex + 1
      : -1;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentCompanyParam]);

  const toCleanName = (name) => cleanName(transliterate(name));

  const goToCompany = (idx) => {
    if (idx < 0 || idx >= pretprijatija.length) return;
    const company = pretprijatija[idx];
    const path = toCleanName(company.Назив);
    if (path) {
      navigate(`/company/${path}`);
    }
  };

  const previousCompanyName =
    previousCompanyIndex >= 0 && previousCompanyIndex < pretprijatija.length
      ? pretprijatija[previousCompanyIndex].Назив
      : null;
  const nextCompanyName =
    nextCompanyIndex >= 0 && nextCompanyIndex < pretprijatija.length
      ? pretprijatija[nextCompanyIndex].Назив
      : null;

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

  const totalIncome = useMemo(() => {
    return sumDecimalNumbers(filteredData.map((item) => item.Приходи));
  }, [filteredData]);

  const totalOutcome = useMemo(() => {
    return sumDecimalNumbers(filteredData.map((item) => item.Расходи));
  }, [filteredData]);

  const totalFinancialResults = useMemo(() => {
    return sumDecimalNumbers(
      filteredData.map((item) => item["Финансиски резултат"]),
    );
  }, [filteredData]);

  const chartData = useMemo(() => {
    if (!filteredData || filteredData.length === 0) return null;

    const showQuarterly = selectedYear && selectedYear !== "";

    if (showQuarterly) {
      const quarters = [
        ...new Set(filteredData.map((item) => item.Квартал)),
      ].sort((a, b) => a - b);

      const incomeByQuarter = quarters.map((q) => {
        const quarterData = filteredData.filter((item) => item.Квартал === q);
        return sumDecimalNumbers(quarterData.map((item) => item.Приходи));
      });

      const outcomeByQuarter = quarters.map((q) => {
        const quarterData = filteredData.filter((item) => item.Квартал === q);
        return sumDecimalNumbers(quarterData.map((item) => item.Расходи));
      });

      const finResultByQuarter = quarters.map((q) => {
        const quarterData = filteredData.filter((item) => item.Квартал === q);
        return sumDecimalNumbers(
          quarterData.map((item) => item["Финансиски резултат"]),
        );
      });

      return {
        labels: quarters.map((q) => (q === 0 ? "Сите квартали" : `${q}`)),
        datasets: [
          {
            label: "Приходи",
            data: incomeByQuarter,
            borderColor: "#198754",
            backgroundColor: "rgba(25, 135, 84, 0.5)",
            tension: 0.5,
          },
          {
            label: "Расходи",
            data: outcomeByQuarter,
            borderColor: "#dc3545",
            backgroundColor: "rgba(220, 53, 69, 0.5)",
            tension: 0.5,
          },
          {
            label: "Финансиски резултат",
            data: finResultByQuarter,
            borderColor: "#0dcaf0",
            backgroundColor: "rgba(13, 202, 240, 0.5)",
            borderDash: [5, 5],
            tension: 0.5,
          },
        ],
      };
    }

    const years = [...new Set(filteredData.map((item) => item.Година))].sort();

    const incomeByYear = years.map((y) => {
      const yearData = filteredData.filter((item) => item.Година === y);
      return sumDecimalNumbers(yearData.map((item) => item.Приходи));
    });

    const outcomeByYear = years.map((y) => {
      const yearData = filteredData.filter((item) => item.Година === y);
      return sumDecimalNumbers(yearData.map((item) => item.Расходи));
    });

    const finResultByYear = years.map((y) => {
      const yearData = filteredData.filter((item) => item.Година === y);
      return sumDecimalNumbers(
        yearData.map((item) => item["Финансиски резултат"]),
      );
    });

    return {
      labels: years,
      datasets: [
        {
          label: "Приходи",
          data: incomeByYear,
          borderColor: "#198754",
          backgroundColor: "rgba(25, 135, 84, 0.5)",
          tension: 0.5,
        },
        {
          label: "Расходи",
          data: outcomeByYear,
          borderColor: "#dc3545",
          backgroundColor: "rgba(220, 53, 69, 0.5)",
          tension: 0.5,
        },
        {
          label: "Финансиски резултат",
          data: finResultByYear,
          borderColor: "#0dcaf0",
          backgroundColor: "rgba(13, 202, 240, 0.5)",
          borderDash: [5, 5],
          tension: 0.5,
        },
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
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return new Intl.NumberFormat("mk-MK", {
                  style: "currency",
                  currency: "MKD",
                  maximumFractionDigits: 0,
                }).format(value * 1000000);
              },
            },
          },
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.parsed.y;
                return (
                  context.dataset.label +
                  ": " +
                  new Intl.NumberFormat("mk-MK", {
                    style: "currency",
                    currency: "MKD",
                    maximumFractionDigits: 0,
                  }).format(value * 1000000)
                );
              },
            },
          },
        },
      },
    });
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
          <p>{currentCompany.Опис}.</p>
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

      {filteredData.length > 0 && (
        <>
          {chartData && (
            <div className="my-5">
              <h2 className="h5 mb-3">Промени низ годините</h2>
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
                  const finResult = item["Финансиски резултат"];
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
                      total={totalIncome}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title="Расходи"
                      total={totalOutcome}
                      numbers={filteredData}
                      quarter={0}
                    />
                  </th>
                  <th className="text-end">
                    <TableFooterValue
                      title="Финансиски резултат"
                      total={totalFinancialResults}
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
              {previousCompanyIndex >= 0 &&
                previousCompanyIndex < pretprijatija.length && (
                  <div className="list-group flex-fill">
                    <button
                      className="list-group-item list-group-item-action p-4 flex-fill"
                      onClick={() => goToCompany(previousCompanyIndex)}
                      title="Претходно претпријатие"
                      type="button"
                    >
                      <h5 className="h6">{previousCompanyName}</h5>
                      <i className="bi bi-arrow-left text-primary"></i>
                    </button>
                  </div>
                )}
            </div>
            <div className="col vstack">
              {nextCompanyIndex >= 0 &&
                nextCompanyIndex < pretprijatija.length && (
                  <div className="list-group flex-fill text-end">
                    <button
                      className="list-group-item list-group-item-action p-4 flex-fill"
                      onClick={() => goToCompany(nextCompanyIndex)}
                      title="Претходно претпријатие"
                      type="button"
                    >
                      <h5 className="h6">{nextCompanyName}</h5>
                      <i className="bi bi-arrow-right text-primary"></i>
                    </button>
                  </div>
                )}
            </div>
          </div>
        </>
      )}

      {filteredData.length === 0 && (
        <div className="alert alert-warning mt-5">
          Нема податоци за избраната година.
        </div>
      )}
    </div>
  );
}

export default Company;
