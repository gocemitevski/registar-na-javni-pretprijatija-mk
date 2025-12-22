import { useParams } from "react-router-dom";
import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function DefinitionList({ title, total, numbers, icon, color }) {
  const { quarter } = useParams();

  return (
    <dl className="hstack gap-2 mb-0">
      <dt className="hstack gap-2 mb-0">
        <i className={`bi ${icon} text-${color}`}></i>
        <span>{title}</span>
      </dt>
      <dd className="mb-0 flex-fill text-end">
        {parseInt(quarter) !== 0
          ? parseDecimalNumber(total)
          : parseDecimalNumber(
              numbers.find((item) => item.Квартал === parseInt(quarter))[title]
            )}
      </dd>
    </dl>
  );
}
