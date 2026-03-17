import { useTranslation } from "react-i18next";
import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function DefinitionList({ title, total, numbers, quarter, icon, color, isActive }) {
  const { i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const quarterNum = parseInt(quarter) || 0;
  const quarterData = quarterNum !== 0 ? numbers.find((item) => item.Квартал === quarterNum) : null;

  return (
    <dl className={`hstack flex-wrap flex-xl-nowrap gap-2 mb-0 px-2 py-1 rounded ${isActive ? "bg-warning-subtle" : ""}`}>
      <dt className="hstack gap-2 mb-0">
        <i className={`bi ${icon} text-${color}`}></i>
        <span>{title}</span>
      </dt>
      <dd className="mb-0 flex-fill text-end">
        {quarterNum === 0
          ? parseDecimalNumber(total, lang)
          : quarterData
            ? parseDecimalNumber(quarterData[title], lang)
            : "—"}
      </dd>
    </dl>
  );
}
