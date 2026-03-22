import { useTranslation } from "react-i18next";
import { parseDecimalNumber, formatDecimalNumber } from "../utils/decimalNumbers";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";

export default function DefinitionList({ title, total, numbers, quarter, rawValue, icon, isActive }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  const quarterNum = parseInt(quarter, 10) || 0;
  const quarterData = quarterNum !== 0 && numbers ? numbers.find((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === quarterNum) : null;

  const displayValue = quarterNum === 0
    ? (numbers ? parseDecimalNumber(total, lang) : total)
    : quarterData
      ? parseDecimalNumber(quarterData[title], lang)
      : "—";

  const colorRawValue = rawValue ?? total;
  const isFinancialResult = title === t("cards.financial-result");
  const color = isFinancialResult && colorRawValue != null
    ? formatDecimalNumber(colorRawValue) < 0 ? "danger" : "success"
    : null;

  return (
    <dl className={`hstack flex-wrap flex-xl-nowrap gap-2 mb-0 px-2 py-1 rounded ${isActive ? "bg-warning-subtle" : ""}`}>
      <dt className="hstack gap-3 mb-0">
        <i className={`bi ${icon} text-warning-emphasis`}></i>
        <span>{title}</span>
      </dt>
      <dd className={`mb-0 flex-fill text-end${color ? ` text-${color}` : ""}`}>
        {displayValue}
      </dd>
    </dl>
  );
}
