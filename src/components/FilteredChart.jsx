import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";
import {
  INCOME_COLOR,
  EXPENSES_COLOR,
  FINRESULT_COLOR,
  createHorizontalChartOptions,
  CHART_HEIGHT,
  dashedBorderPlugin,
} from "../utils/charts";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../utils/columns";

export default function FilteredChart({
  tableData,
  money,
  activeSort,
  selectedYear,
  selectedQuarter,
  filter,
}) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || "mk";
  const chartRef = useRef(null);

  const chartTitle = useMemo(() => {
    const count = tableData?.length || 0;
    const isSingular = count % 10 === 1 && count !== 11;
    const singularKey = isSingular ? `${filter}_singular` : filter;
    const filterTitle = t(`filteredChart.${singularKey}`);

    const filterColorMap = {
      "positive-result": "success",
      income: "success",
      "earned-more": "success",
      "negative-result": "danger",
      "no-income": "danger",
      "spent-more": "danger",
    };
    const colorClass = filterColorMap[filter] || "primary";

    const yearPart =
      selectedQuarter > 0
        ? t("filteredChart.quarterTitle", {
            year: selectedYear,
            quarter: selectedQuarter,
          })
        : t("filteredChart.yearTitle", { year: selectedYear });
    return (
      <div className="hstack flex-wrap flex-lg-nowrap gap-2 gap-lg-3">
        <strong className={`fw-bold display-4 text-${colorClass}`}>
          {count}
        </strong>
        <span className="fw-light fs-5 text-uppercase">
          {filterTitle.toLowerCase()} {yearPart}
        </span>
      </div>
    );
  }, [tableData, filter, selectedYear, selectedQuarter, t]);

  const chartData = useMemo(() => {
    if (!money || money.length === 0 || !tableData || tableData.length === 0)
      return null;

    const companyTotals = {};
    money.forEach((item) => {
      const name = item[MONEY_SHEET_COLUMNS.NAME];
      if (!companyTotals[name]) {
        companyTotals[name] = { income: 0, expenses: 0, result: 0 };
      }
      companyTotals[name].income += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.INCOME]);
      companyTotals[name].expenses += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.EXPENSES]);
      companyTotals[name].result += formatDecimalNumber(
        item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT],
      );
    });

    const companyNameMap = {};
    tableData.forEach((c) => {
      companyNameMap[c[COMPANY_SHEET_COLUMNS.NAME]] =
        getLocalizedCompanyName(c, currentLang) || c[COMPANY_SHEET_COLUMNS.NAME];
    });

    if (activeSort === "income") {
      const sortedEntries = Object.entries(companyTotals).sort(
        (a, b) => b[1].income - a[1].income,
      );
      return {
        labels: sortedEntries.map(([name]) => companyNameMap[name]),
        datasets: [
          {
            label: t("cards.income"),
            data: sortedEntries.map(([, totals]) => totals.income),
            backgroundColor: INCOME_COLOR.bg,
            borderColor: INCOME_COLOR.border,
            borderWidth: 1,
          },
        ],
      };
    }

    if (filter === "spent-more") {
      const sortedEntries = Object.entries(companyTotals).sort(
        (a, b) => b[1].expenses - a[1].expenses,
      );
      return {
        labels: sortedEntries.map(([name]) => companyNameMap[name]),
        datasets: [
          {
            label: t("cards.expenses"),
            data: sortedEntries.map(([, totals]) => totals.expenses),
            backgroundColor: EXPENSES_COLOR.bg,
            borderColor: EXPENSES_COLOR.border,
            borderWidth: 1,
          },
        ],
      };
    }

    const sortedEntries = Object.entries(companyTotals).sort(
      (a, b) => b[1].result - a[1].result,
    );
    return {
      labels: sortedEntries.map(([name]) => companyNameMap[name]),
      datasets: [
        {
          label: t("cards.financial-result"),
          data: sortedEntries.map(([, totals]) => totals.result),
          backgroundColor: FINRESULT_COLOR.bg,
          borderColor: "transparent",
          borderWidth: 0,
          dashedBarIndex: -1,
          dashedBorderColor: FINRESULT_COLOR.border,
        },
      ],
    };
  }, [tableData, money, activeSort, filter, t, currentLang]);

  const chartOptions = useMemo(
    () =>
      createHorizontalChartOptions(currentLang, chartData?.labels, false, 360),
    [currentLang, chartData],
  );

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    chartRef.current.chart = new Chart(chartRef.current, {
      type: "bar",
      data: chartData,
      options: chartOptions,
      plugins: [dashedBorderPlugin],
    });

    const chartNode = chartRef.current;

    return () => {
      if (chartNode?.chart) {
        chartNode.chart.destroy();
        chartNode.chart = null;
      }
    };
  }, [chartData, chartOptions]);

  if (!chartData) return null;

  return (
    <div className="card border-primary-subtle my-3 d-none d-md-flex">
      <div className="card-body">
        <div className="row">
          <div className="col-lg-10 col-xxl-8">
            <h2 className={`mb-4`}>
              {chartTitle}
            </h2>
          </div>
        </div>
        <div style={{ height: CHART_HEIGHT * 1.75 }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
