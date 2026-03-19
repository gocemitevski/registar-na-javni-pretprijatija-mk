import { useTranslation } from "react-i18next";
import { parseDecimalNumber, formatDecimalNumber } from "../utils/decimalNumbers";

export default function DefinitionList({ title, total, numbers, quarter, icon, isActive }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const quarterNum = parseInt(quarter) || 0;
  const quarterData = quarterNum !== 0 ? numbers.find((item) => item.Квартал === quarterNum) : null;

  const value = quarterNum === 0
    ? total
    : quarterData ? quarterData[title] : null;

  const isFinancialResult = title === t("cards.financial-result");
  const color = isFinancialResult && value != null
    ? formatDecimalNumber(value) < 0 ? "danger" : "success"
    : null;

  return (
    <dl className={`hstack flex-wrap flex-xl-nowrap gap-2 mb-0 px-2 py-1 rounded ${isActive ? "bg-warning-subtle" : ""}`}>
      <dt className="hstack gap-2 mb-0">
        <i className={`bi ${icon} text-warning-emphasis`}></i>
        <span>{title}</span>
      </dt>
      <dd className={`mb-0 flex-fill text-end${color ? ` text-${color}` : ""}`}>
        {quarterNum === 0
          ? parseDecimalNumber(total, lang)
          : quarterData
            ? parseDecimalNumber(quarterData[title], lang)
            : "—"}
      </dd>
    </dl>
  );
}
