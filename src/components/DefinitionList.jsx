import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function DefinitionList({ title, total, numbers, quarter, icon, color }) {
  const quarterNum = parseInt(quarter) || 0;
  const quarterData = quarterNum !== 0 ? numbers.find((item) => item.Квартал === quarterNum) : null;

  return (
    <dl className="hstack gap-2 mb-0">
      <dt className="hstack gap-2 mb-0">
        <i className={`bi ${icon} text-${color}`}></i>
        <span>{title}</span>
      </dt>
      <dd className="mb-0 flex-fill text-end">
        {quarterNum === 0
          ? parseDecimalNumber(total)
          : quarterData
            ? parseDecimalNumber(quarterData[title])
            : "—"}
      </dd>
    </dl>
  );
}
