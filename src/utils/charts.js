export const INCOME_COLOR = { border: "#198754", bg: "rgba(25, 135, 84, 0.5)" };
export const EXPENSES_COLOR = { border: "#dc3545", bg: "rgba(220, 53, 69, 0.5)" };
export const FINRESULT_COLOR = { border: "#fd7e14", bg: "rgba(253,126,20, 0.5)" };
export const CHART_HEIGHT = "360px";

export function createChartOptions(lang, showLegend = true) {
  const currencySuffix = lang === "mk" ? " ден." : " MKD";
  const formatValue = (value) =>
    new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value * 1000000) + currencySuffix;

  return {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        ticks: { callback: formatValue },
        grid: {
          color: (ctx) => {
            if (ctx.tick.value === 0) {
              return "#343a40";
            }
            return "#e5e5e5";
          },
        },
      },
    },
    plugins: {
      legend: { display: showLegend, position: "top", align: "end" },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            `${showLegend ? ctx.dataset.label + ": " : ctx.label + ": "}${formatValue(ctx.parsed.y)}`,
        },
      },
    },
  };
}
