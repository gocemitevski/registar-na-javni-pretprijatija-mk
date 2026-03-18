import { useTranslation } from "react-i18next";
import { formatDecimalNumber, parseDecimalNumber } from "../utils/decimalNumbers";

export default function TableFooterValue({ title, total, numbers, quarter }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  const quarterNum = parseInt(quarter) || 0;
  const quarterData =
    quarterNum !== 0
      ? numbers.find((item) => item.Квартал === quarterNum)
      : null;

  const value =
    quarterNum === 0
      ? parseDecimalNumber(total, lang)
      : quarterData
        ? parseDecimalNumber(quarterData[title], lang)
        : "—";

  const isFinancialResult = title === t("sort.result");
  const numericValue =
    typeof value === "string" && value !== "—"
      ? formatDecimalNumber(value)
      : null;
  const isNegative = numericValue != null && numericValue < 0;

  const valueClass =
    isFinancialResult && numericValue != null
      ? `text-${isNegative ? "danger" : "success"}`
      : "";

  return <span className={valueClass}>{value}</span>;
}
