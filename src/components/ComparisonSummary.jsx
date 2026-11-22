import { useTranslation } from "react-i18next";
import { parseDecimalNumber } from "../utils/decimalNumbers";
import { formatComparisonPercent } from "../utils/yearComparison";
import Icon from "./Icon";

const METRICS = [
  { key: "income", labelKey: "cards.income", icon: "arrow-down" },
  { key: "expenses", labelKey: "cards.expenses", icon: "arrow-up" },
  {
    key: "result",
    labelKey: "cards.financial-result",
    icon: "arrow-down-up",
  },
];

function getValueClass(value) {
  if (value == null || value === 0) return "text-body-secondary";
  return value > 0 ? "text-success" : "text-danger";
}

export default function ComparisonSummary({
  totals,
  baseYear,
  compareYear,
  currency,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  const formatValue = (value) => parseDecimalNumber(value, lang, currency);

  return (
    <section className="my-4 my-lg-5">
      <div className="row row-cols-1 row-cols-lg-3 g-3">
        {METRICS.map((metric) => {
          const values = totals[metric.key];

          return (
            <div className="col" key={metric.key}>
              <article className="card text-bg-light vstack h-100 shadow">
                <div className="card-body flex-grow-0">
                  <h3 className="card-title fs-5 hstack gap-3 mb-0">
                    <Icon
                      name={metric.icon}
                      className="text-warning-emphasis"
                    />
                    <span>{t(metric.labelKey)}</span>
                  </h3>
                </div>
                <div className="list-group list-group-flush flex-fill">
                  <div className="list-group-item hstack flex-wrap gap-3 justify-content-between align-items-center">
                    <span className="text-body-secondary">{baseYear}</span>
                    <span className="text-body-emphasis text-nowrap">
                      {formatValue(values.base)}
                    </span>
                  </div>
                  <div className="list-group-item hstack flex-wrap gap-3 justify-content-between align-items-center">
                    <span className="text-body-secondary">{compareYear}</span>
                    <span className="text-body-emphasis text-nowrap">
                      {formatValue(values.compare)}
                    </span>
                  </div>
                  <div className="list-group-item hstack flex-wrap gap-3 justify-content-between align-items-center">
                    <span>{t("compare.change")}</span>
                    <span
                      className={`text-nowrap ${getValueClass(values.delta)}`}
                    >
                      {formatValue(values.delta)}
                    </span>
                  </div>
                  <div className="list-group-item hstack flex-wrap gap-3 justify-content-between align-items-center">
                    <span>{t("compare.changePercent")}</span>
                    <span
                      className={`text-nowrap ${getValueClass(values.percent)}`}
                    >
                      {formatComparisonPercent(values.percent)}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          );
        })}
      </div>
    </section>
  );
}
