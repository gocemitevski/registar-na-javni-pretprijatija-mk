import { useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Chart from "chart.js/auto";
import { createChartOptions, CHART_HEIGHT, dashedBorderPlugin } from "../utils/charts";

function OverviewChart({ chartData, selectedYear, selectedQuarter }) {
  const { t, i18n } = useTranslation();
  const chartRef = useRef(null);

  const chartOptions = useMemo(
    () => createChartOptions(i18n.language || "mk", false),
    [i18n.language]
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

  return (
    <div className="bg-primary-subtle flex-fill">
      <div className="container mt-4">
        <div className="card border-primary-subtle">
          <div className="card-body">
            <h2 className="h5 mb-4">
              {selectedQuarter > 0
                ? t("overview.chartTitleQuarter", {
                    year: selectedYear,
                    quarter: selectedQuarter,
                  })
                : t("overview.chartTitle", { year: selectedYear })}
            </h2>
            <div style={{ height: CHART_HEIGHT }}>
              <canvas ref={chartRef}></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewChart;
