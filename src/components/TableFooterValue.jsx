import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function TableFooterValue({ title, total, numbers, quarter }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  const quarterNum = parseInt(quarter) || 0;
  const quarterData =
    quarterNum !== 0
      ? numbers.find((item) => item.Квартал === quarterNum)
      : null;

  const value = useMemo(() => {
    if (quarterNum === 0) {
      return parseDecimalNumber(total, lang);
    }
    if (quarterData) {
      return parseDecimalNumber(quarterData[title], lang);
    }
    return parseDecimalNumber(total, lang);
  }, [quarterNum, quarterData, total, title, lang]);

  const isFinancialResult = title === t("cards.financial-result");
  const isNegative = isFinancialResult && value < 0;

  const valueClass =
    isFinancialResult
      ? `text-${isNegative ? "danger" : "success"}`
      : "";

  return <span className={valueClass}>{value}</span>;
}
