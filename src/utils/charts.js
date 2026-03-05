const CURRENCY_FORMATTER = new Intl.NumberFormat("mk-MK", {
  style: "currency",
  currency: "MKD",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value) => CURRENCY_FORMATTER.format(value * 1000000);

export const CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: { callback: formatCurrency },
    },
  },
  plugins: {
    legend: { display: true, position: "top", align: "end" },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
      },
    },
  },
};

export const INCOME_COLOR = { border: "#198754", bg: "rgba(25, 135, 84, 0.5)" };
export const OUTCOME_COLOR = { border: "#dc3545", bg: "rgba(220, 53, 69, 0.5)" };
export const FINRESULT_COLOR = { border: "#0dcaf0", bg: "rgba(13, 202, 240, 0.5)" };
