export const INCOME_COLOR = { border: "#198754", bg: "rgba(25, 135, 84, 0.5)" };
export const EXPENSES_COLOR = { border: "#dc3545", bg: "rgba(220, 53, 69, 0.5)" };
export const FINRESULT_COLOR = { border: "#fd7e14", bg: "rgba(253,126,20, 0.5)" };
export const CHART_HEIGHT = 360;

export const dashedBorderPlugin = {
  id: "dashedBorderPlugin",
  afterDatasetsDraw(chart, args, options) {
    const { ctx } = chart;
    const dataset = chart.data.datasets[0];

    if (dataset.dashedBarIndex === undefined) return;

    const meta = chart.getDatasetMeta(0);
    const dashedIndex = dataset.dashedBarIndex;
    const dashPattern = options.dashPattern || [5, 5];
    const isHorizontal = chart.options.indexAxis === "y";

    ctx.save();

    meta.data.forEach((bar, index) => {
      if (index === dashedIndex || dashedIndex === -1) {
        const view = bar;

        let borderColor;
        if (dataset.dashedBorderColor) {
          borderColor = Array.isArray(dataset.dashedBorderColor)
            ? dataset.dashedBorderColor[index]
            : dataset.dashedBorderColor;
        } else {
          borderColor = FINRESULT_COLOR.border;
        }

        const borderWidth = 2;

        let x, y, width, height;

        if (isHorizontal) {
          x = Math.min(view.x, view.base);
          y = view.y - bar.height / 2;
          width = Math.abs(view.base - view.x);
          height = bar.height;
        } else {
          x = view.x - view.width / 2;
          y = Math.min(view.y, view.base);
          width = view.width;
          height = Math.abs(view.base - view.y);
        }

        ctx.strokeStyle = borderColor;
        ctx.lineWidth = borderWidth;
        ctx.setLineDash(dashPattern);
        ctx.strokeRect(x, y, width, height);
      }
    });

    ctx.restore();
  },
};

dashedBorderPlugin.defaults = {
  dashPattern: [5, 5],
};

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

export function createHorizontalChartOptions(lang, labels, showLegend = false, labelWidth = 360) {
  const currencySuffix = lang === "mk" ? " ден." : " MKD";
  const formatValue = (value) =>
    new Intl.NumberFormat("de-DE", {
      style: "decimal",
      maximumFractionDigits: 0,
    }).format(value * 1000000) + currencySuffix;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: "y",
    scales: {
      x: {
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
      y: {
        afterFit: (axis) => {
          axis.width = labelWidth;
        },
        ticks: {
          callback: (value) => {
            const label = labels?.[value];
            if (label && label.length > 50) {
              return label.substring(0, 47) + "...";
            }
            return label || "";
          },
        },
      },
    },
    plugins: {
      legend: { display: showLegend, position: "top", align: "end" },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const label = ctx.dataset.label || "";
            return `${label}: ${formatValue(ctx.parsed.x)}`;
          },
        },
      },
    },
  };

  return options;
}
