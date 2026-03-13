import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";
import { getLocalizedCompanyName, getLocalizedCompanyDescription } from "../utils/localizeCompanyName";

export default function Card({ row, numbers, activeSort }) {
  const { t, i18n } = useTranslation();
  const { lang, quarter } = useParams();
  const currentLang = lang || i18n.language || "mk";
  const quarterNum = parseInt(quarter) || 0;

const SORT_KEYS = {
    income: t("cards.income"),
    expenses: t("cards.expenses"),
    "financial-result": t("cards.financial-result"),
  };
  const activeTitle = SORT_KEYS[activeSort] || null;

  const totalIncome = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item.Приходи)),
    [numbers]
  );
  const totalExpenses = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item.Расходи)),
    [numbers]
  );
  const totalFinancialResults = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item["Финансиски резултат"])),
    [numbers]
  );

  const financialResultColor = useMemo(() => {
    if (quarterNum === 0) {
      return parseInt(parseDecimalNumber(totalFinancialResults, currentLang)) < 0 ? "danger" : "success";
    }
    const q = numbers.find((item) => item.Квартал === quarterNum);
    if (!q) return "success";
    return parseInt(parseDecimalNumber(q["Финансиски резултат"], currentLang)) < 0 ? "danger" : "success";
  }, [quarterNum, numbers, totalFinancialResults, currentLang]);

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row g-5">
          <div className="col-lg-8 vstack">
            <h5 className="card-title">
              <Link to={`/${currentLang}/company/${cleanName(transliterate(row.Назив))}`}>
                {getLocalizedCompanyName(row, currentLang)}
              </Link>
            </h5>
            <p className="card-text flex-fill">{getLocalizedCompanyDescription(row, currentLang)}</p>
            <a
              title={`Мрежно место на ${row.Назив}`}
              target="_blank"
              className="btn btn-sm btn-outline-secondary me-auto"
              href={row["Мрежно место"]}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
          <div className="col-lg-4 align-self-center vstack gap-1">
            <DefinitionList
              title={t("cards.income")}
              total={totalIncome}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down"
              color="success"
              isActive={activeTitle === t("cards.income")}
            />
            <DefinitionList
              title={t("cards.expenses")}
              total={totalExpenses}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-up"
              color="danger"
              isActive={activeTitle === t("cards.expenses")}
            />
            <DefinitionList
              title={t("cards.financial-result")}
              total={totalFinancialResults}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down-up"
              color={financialResultColor}
              isActive={activeTitle === t("cards.financial-result")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
