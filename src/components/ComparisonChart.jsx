import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import Chart from "../utils/chartSetup";
import {
  CHART_HEIGHT,
  createChartOptions,
  EXPENSES_COLOR,
  FINRESULT_COLOR,
  INCOME_COLOR,
} from "../utils/charts";
import { CURRENCIES } from "../utils/currencies";
import Icon from "./Icon";

const METRICS = [
  {
    key: "income",
    labelKey: "cards.income",
    icon: "arrow-down",
    color: INCOME_COLOR,
  },
  {
    key: "expenses",
    labelKey: "cards.expenses",
    icon: "arrow-up",
    color: EXPENSES_COLOR,
  },
  {
    key: "result",
    labelKey: "cards.financial-result",
    icon: "arrow-down-up",
    color: FINRESULT_COLOR,
  },
];

// Three charts share one row, so each is shorter than a full-width chart.
const PANEL_HEIGHT = Math.round((CHART_HEIGHT * 2) / 3);

function MetricChart({
  metric,
  totals,
  baseYear,
  compareYear,
  currency,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const chartRef = useRef(null);

  const chartData = useMemo(() => {
    const rate = CURRENCIES[currency]?.rate || 1;

    return {
      labels: [baseYear, compareYear],
      datasets: [
        {
          label: t(metric.labelKey),
          data: [
            totals[metric.key].base * rate,
            totals[metric.key].compare * rate,
          ],
          backgroundColor: metric.color.bg,
          borderColor: metric.color.border,
          borderWidth: metric.key === "result" ? 2 : 1,
          borderDash: metric.key === "result" ? [5, 5] : undefined,
        },
      ],
    };
  }, [metric, totals, baseYear, compareYear, currency, t]);

  const chartOptions = useMemo(
    () => createChartOptions(lang, false, currency),
    [lang, currency],
  );

  useEffect(() => {
    if (!chartRef.current) return;

    if (chartRef.current.chart) {
      chartRef.current.chart.destroy();
    }

    chartRef.current.chart = new Chart(chartRef.current, {
      type: "bar",
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

  return (
    <>
      <h3 className="h6 hstack gap-2 mb-3">
        <Icon name={metric.icon} className="text-warning-emphasis" />
        <span>{t(metric.labelKey)}</span>
      </h3>
      <div style={{ height: PANEL_HEIGHT }}>
        <canvas ref={chartRef}></canvas>
      </div>
    </>
  );
}

export default function ComparisonChart({
  totals,
  baseYear,
  compareYear,
  currency,
}) {
  const { t } = useTranslation();

  if (!totals) return null;

  return (
    <section className="my-4 my-lg-5">
      <h2 className="h5 mt-5 mb-4">
        {t("compare.chartTitle", {
          base: baseYear,
          compare: compareYear,
        })}
      </h2>
      <div className="row row-cols-1 row-cols-lg-3 g-3 g-lg-4">
        {METRICS.map((metric) => (
          <div className="col" key={metric.key}>
            <MetricChart
              metric={metric}
              totals={totals}
              baseYear={baseYear}
              compareYear={compareYear}
              currency={currency}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
