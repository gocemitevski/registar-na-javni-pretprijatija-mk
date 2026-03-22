import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";
import { getLocalizedCompanyName, getLocalizedCompanyDescription } from "../utils/localizeCompanyName";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../utils/columns";

export default function Card({ row, numbers, activeSort }) {
  const { t, i18n } = useTranslation();
  const { lang, quarter } = useParams();
  const currentLang = lang || i18n.language || "mk";

  const SORT_KEYS = {
    income: t("cards.income"),
    expenses: t("cards.expenses"),
    "financial-result": t("cards.financial-result"),
  };
  const activeTitle = SORT_KEYS[activeSort] || null;

  const totalIncome = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item[MONEY_SHEET_COLUMNS.INCOME])),
    [numbers]
  );
  const totalExpenses = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item[MONEY_SHEET_COLUMNS.EXPENSES])),
    [numbers]
  );
  const totalFinancialResults = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT])),
    [numbers]
  );

  return (
    <article className="card h-100 shadow-sm">
      <div className="card-body">
        <div className="row g-3">
          <div className="col-lg-6 col-xl-8 vstack">
            <h1 className="card-title fs-5">
              <Link to={`/${currentLang}/company/${cleanName(transliterate(row[COMPANY_SHEET_COLUMNS.NAME]))}`}>
                {getLocalizedCompanyName(row, currentLang)}
              </Link>
            </h1>
            <p className="card-text flex-fill">{getLocalizedCompanyDescription(row, currentLang)}</p>
            <a
              title={`Мрежно место на ${row[COMPANY_SHEET_COLUMNS.NAME]}`}
              target="_blank"
              className="btn btn-sm btn-outline-secondary me-auto"
              href={row[COMPANY_SHEET_COLUMNS.WEBSITE]}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
          <div className="col-lg-6 col-xl-4 align-self-center vstack gap-1">
            <DefinitionList
              title={t("cards.income")}
              total={totalIncome}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down"
              isActive={activeTitle === t("cards.income")}
            />
            <DefinitionList
              title={t("cards.expenses")}
              total={totalExpenses}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-up"
              isActive={activeTitle === t("cards.expenses")}
            />
            <DefinitionList
              title={t("cards.financial-result")}
              total={totalFinancialResults}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down-up"
              isActive={activeTitle === t("cards.financial-result")}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
