import { useTranslation } from "react-i18next";
import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function TableFooterValue({ title, total, numbers, quarter }) {
  const { t } = useTranslation();

  const quarterNum = parseInt(quarter) || 0;
  const quarterData =
    quarterNum !== 0
      ? numbers.find((item) => item.Квартал === quarterNum)
      : null;

  const value =
    quarterNum === 0
      ? parseDecimalNumber(total)
      : quarterData
        ? parseDecimalNumber(quarterData[title])
        : "—";

  const isFinancialResult = title === t("sort.result");
  const numericValue =
    typeof value === "string" && value !== "—"
      ? parseDecimalNumber(value)
      : null;
  const isNegative = numericValue != null && parseInt(numericValue) < 0;

  const valueClass =
    isFinancialResult && numericValue != null
      ? `text-${isNegative ? "danger" : "success"}`
      : "";

  return <span className={valueClass}>{value}</span>;
}
