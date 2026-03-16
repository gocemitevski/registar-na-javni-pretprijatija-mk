import { useEffect, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";
import { INCOME_COLOR, EXPENSES_COLOR, FINRESULT_COLOR, createHorizontalChartOptions, CHART_HEIGHT, dashedBorderPlugin } from "../utils/charts";

export default function FilteredChart({ tableData, money, activeSort, selectedYear, selectedQuarter, filter }) {
  const { t } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || "mk";
  const chartRef = useRef(null);

  const getChartTitle = () => {
    const count = tableData?.length || 0;
    const isSingular = count % 10 === 1 && count !== 11;
    const singularKey = isSingular ? `${filter}_singular` : filter;
    const filterTitle = t(`filteredChart.${singularKey}`);

    const filterColorMap = {
      "positive-result": "success",
      "income": "success",
      "earned-more": "success",
      "negative-result": "danger",
      "no-income": "danger",
      "spent-more": "danger",
    };
    const colorClass = filterColorMap[filter] || "primary";

    const yearPart = selectedQuarter > 0
      ? t("filteredChart.quarterTitle", { year: selectedYear, quarter: selectedQuarter })
      : t("filteredChart.yearTitle", { year: selectedYear });
    return (
      <div className="hstack gap-4">
        <strong className={`fw-bold display-4 text-${colorClass}`}>{count}</strong>
        <span className="fw-light fs-4 text-uppercase">{filterTitle.toLowerCase()} {yearPart}</span>
      </div>
    );
  };

  const chartData = useMemo(() => {
    if (!money || money.length === 0 || !tableData || tableData.length === 0) return null;

    const companyTotals = {};
    money.forEach((item) => {
      const name = item.Назив;
      if (!companyTotals[name]) {
        companyTotals[name] = { income: 0, expenses: 0, result: 0 };
      }
      companyTotals[name].income += formatDecimalNumber(item.Приходи);
      companyTotals[name].expenses += formatDecimalNumber(item.Расходи);
      companyTotals[name].result += formatDecimalNumber(item["Финансиски резултат"]);
    });

    const companyNameMap = {};
    tableData.forEach((c) => {
      companyNameMap[c.Назив] = getLocalizedCompanyName(c, currentLang) || c.Назив;
    });

    if (activeSort === "income") {
      const sortedEntries = Object.entries(companyTotals).sort((a, b) => b[1].income - a[1].income);
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
      const sortedEntries = Object.entries(companyTotals).sort((a, b) => b[1].expenses - a[1].expenses);
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

    const sortedEntries = Object.entries(companyTotals).sort((a, b) => b[1].result - a[1].result);
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
    () => createHorizontalChartOptions(currentLang, chartData?.labels, false, 360),
    [currentLang, chartData]
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
    <div className="card border-primary-subtle mt-4 mb-3">
      <div className="card-body">
        <h2 className={`${currentLang === "mk" ? `w-75`: `w-50`} mb-4`}>
          {getChartTitle()}
        </h2>
        <div style={{ height: CHART_HEIGHT }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
