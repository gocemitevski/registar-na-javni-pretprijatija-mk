import { parseDecimalNumber } from "../utils/decimalNumbers";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";
import { COMPANY_SHEET_COLUMNS } from "../utils/columns";
import { useUrlParams } from "../hooks/useUrlParams";

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
  const location = useLocation();
  const currentLang = lang || i18n.language || "mk";
  const { selectedCurrency: currency } = useUrlParams([], []);

  const renderList = (title, items, icon) => (
    <div className="col">
      <div className="card text-bg-light vstack h-100 shadow">
        <div className="card-body flex-grow-0">
          <h2 className="card-title fs-5 hstack gap-3 mb-0">
            <i className={`text-warning-emphasis bi bi-${icon}`}></i>
            <span>
              {title} {selectedQuarter > 0 ? t("toplists.titleQuarter", { year: selectedYear, quarter: selectedQuarter }) : t("toplists.titleYear", { year: selectedYear })}
            </span>
          </h2>
        </div>
        <div className="list-group list-group-flush flex-fill">
          {items.map(([name, value], idx) => {
            const company = companies?.find((c) => c[COMPANY_SHEET_COLUMNS.NAME] === name);
            const localizedName = getLocalizedCompanyName(company, currentLang) || name;
            return (
              <Link
                key={idx}
                className="list-group-item link-primary hstack gap-3 justify-content-between align-items-center flex-fill"
                to={`/${currentLang}/company/${cleanName(transliterate(name))}${location.search}`}
              >
                <strong className="fw-bold">{localizedName}</strong>
                <span className="text-body-emphasis text-nowrap">{parseDecimalNumber(value, currentLang, currency)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-primary-subtle py-4 py-lg-5">
      <div className="container">
        <h1 className="fw-light m-3 text-secondary">
          {t("toplists.title")} {selectedQuarter > 0 ? t("toplists.titleQuarter", { year: selectedYear, quarter: selectedQuarter }) : t("toplists.titleYear", { year: selectedYear })}
        </h1>
        <div className="row row-cols-1 row-cols-xl-2 g-4 py-2 py-lg-4">
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
