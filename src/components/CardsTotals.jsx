import { useTranslation } from "react-i18next";
import DefinitionList from "./DefinitionList";
import { parseDecimalNumber } from "../utils/decimalNumbers";

export default function CardsTotals({
  totalCompanies,
  totals,
  selectedYear,
  selectedQuarter,
  activeSort,
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  return (
    <div className="sticky-xxl-bottom py-4">
      <aside className="container bg-total totals bg-opacity-25 backdrop-blur border border-light shadow-lg py-5 rounded">
        <div className="row mx-2">
          <div className="col-lg-6 col-xl-8 vstack gap-2 justify-content-center">
            <h1 className="card-title fs-5">
              {selectedQuarter > 0
                ? t("cards.totalQuarter", {
                    year: selectedYear,
                    quarter: selectedQuarter,
                  })
                : t("cards.total", { year: selectedYear })}
            </h1>
            <p className="card-text mb-4 mb-lg-0">
              {totalCompanies}{" "}
              {totalCompanies % 10 === 1 && totalCompanies !== 11
                ? t("cards.company_singular")
                : t("cards.company_plural")}
            </p>
          </div>
          <div className="col-lg-6 col-xl-4 align-self-center vstack gap-2 ps-xl-0">
            <DefinitionList
              title={t("cards.income")}
              total={parseDecimalNumber(totals.income, lang)}
              rawValue={totals.income}
              icon="bi-arrow-down"
              isActive={activeSort === "income"}
            />
            <DefinitionList
              title={t("cards.expenses")}
              total={parseDecimalNumber(totals.expenses, lang)}
              rawValue={totals.expenses}
              icon="bi-arrow-up"
              isActive={activeSort === "expenses"}
            />
            <DefinitionList
              title={t("cards.financial-result")}
              total={parseDecimalNumber(totals["financial-result"], lang)}
              rawValue={totals["financial-result"]}
              icon="bi-arrow-down-up"
              isActive={activeSort === "financial-result"}
            />
          </div>
        </div>
      </aside>
    </div>
  );
}
