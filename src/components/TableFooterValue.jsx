import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { formatDecimalNumber, parseDecimalNumber } from "../utils/decimalNumbers";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { useUrlParams } from "../hooks/useUrlParams";

export default function TableFooterValue({ title, total, numbers, quarter }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const { selectedCurrency: currency } = useUrlParams([], []);

  const quarterNum = parseInt(quarter, 10) || 0;
  const quarterData =
    quarterNum !== 0
      ? numbers.find((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === quarterNum)
      : null;

  const valueData = useMemo(() => {
    if (quarterNum === 0) {
      return { formatted: parseDecimalNumber(total, lang, currency), raw: total };
    }
    if (quarterData) {
      return { formatted: parseDecimalNumber(quarterData[title], lang, currency), raw: quarterData[title] };
    }
    return { formatted: parseDecimalNumber(total, lang, currency), raw: total };
  }, [quarterNum, quarterData, total, title, lang, currency]);

  const isFinancialResult = title === t("cards.financial-result");
  const isNegative = isFinancialResult && formatDecimalNumber(valueData.raw) < 0;

  const valueClass =
    isFinancialResult
      ? `text-${isNegative ? "danger" : "success"}`
      : "";

  return <span className={valueClass}>{valueData.formatted}</span>;
}
