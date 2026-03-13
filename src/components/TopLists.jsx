import { parseDecimalNumber } from "../utils/decimalNumbers";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";

function TopLists({
  topExpenses,
  topIncome,
  topResult,
  worstResult,
  worstIncome,
  worstExpenses,
  selectedYear,
  selectedQuarter,
  companies,
}) {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";

  const renderList = (title, items, icon) => (
    <div className="col">
      <div className="card text-bg-light vstack h-100 shadow">
        <div className="card-body flex-grow-0">
          <h5 className="card-title hstack gap-3 mb-0">
            <i className={`text-warning-emphasis bi bi-${icon}`}></i>
            <span>
              {title} {selectedQuarter > 0 ? t("toplists.titleQuarter", { year: selectedYear, quarter: selectedQuarter }) : t("toplists.titleYear", { year: selectedYear })}
            </span>
          </h5>
        </div>
        <div className="list-group list-group-flush flex-fill">
          {items.map(([name, value], idx) => {
            const company = companies?.find((c) => c.Назив === name);
            const localizedName = getLocalizedCompanyName(company, currentLang);
            return (
              <Link
                key={idx}
                className="list-group-item link-primary hstack gap-3 justify-content-between align-items-center flex-fill"
                to={`/${currentLang}/company/${cleanName(transliterate(name))}`}
              >
                <strong className="fw-bold">{localizedName}</strong>
                <span className="text-body-emphasis text-nowrap">{parseDecimalNumber(value)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-primary-subtle pb-5">
      <div className="container">
        <h1 className="fw-light mx-3 text-secondary">
          {t("toplists.title")} {selectedQuarter > 0 ? t("toplists.titleQuarter", { year: selectedYear, quarter: selectedQuarter }) : t("toplists.titleYear", { year: selectedYear })}
        </h1>
        <div className="row row-cols-1 row-cols-xl-2 g-4 py-4">
          {renderList(t("toplists.highestIncome"), topIncome, "box-arrow-in-up-right")}
          {renderList(t("toplists.lowestIncome"), worstIncome, "box-arrow-in-down-right")}
          {renderList(t("toplists.highestExpenses"), topExpenses, "box-arrow-up-right")}
          {renderList(t("toplists.lowestExpenses"), worstExpenses, "box-arrow-down-right")}
          {renderList(t("toplists.bestResult"), topResult, "graph-up-arrow")}
          {renderList(t("toplists.worstResult"), worstResult, "graph-down-arrow")}
        </div>
      </div>
    </div>
  );
}

export default TopLists;
