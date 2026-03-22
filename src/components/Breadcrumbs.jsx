import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { useUrlParams } from "../hooks/useUrlParams";

function Breadcrumbs() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { pretprijatija, loading, availableYears } = useData();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";

  const { selectedYear, selectedQuarter } = useUrlParams(availableYears, []);

  const isCompanyPage = location.pathname.includes("/company/");
  const isFilteredPage = location.pathname.includes("/filtered/");

  const pathParts = location.pathname.split("/").filter(Boolean);

  const langIndex = pathParts[0] === "mk" || pathParts[0] === "en" ? 1 : 0;
  const isFilteredPageWithFilter = isFilteredPage && pathParts[langIndex + 1];
  const filter = pathParts[langIndex + 1];

  const companySlug = isCompanyPage
    ? decodeURIComponent(location.pathname.split("/company/")[1])
    : null;

  if (!isCompanyPage && !isFilteredPageWithFilter) {
    return null;
  }

  if ((isFilteredPageWithFilter || isCompanyPage) && loading) {
    return null;
  }

  const filterTitles = {
    "positive-result": t("summary.positiveResult"),
    "income": t("summary.income"),
    "earned-more": t("summary.earnedMore"),
    "negative-result": t("summary.negativeResult"),
    "no-income": t("summary.noIncome"),
    "spent-more": t("summary.spentMore"),
  };

  const breadcrumbs = [
    { label: t("breadcrumbs.home"), href: `/${currentLang}` },
  ];

  if (isFilteredPageWithFilter) {
    const currentYear = selectedYear || availableYears[0];
    const sectionTitle = selectedQuarter
      ? t("breadcrumbs.quickFactsQuarter", { year: currentYear, quarter: selectedQuarter })
      : t("breadcrumbs.quickFacts", { year: currentYear });

    breadcrumbs.push({ label: sectionTitle, href: `/${currentLang}${location.search}` });
    breadcrumbs.push({ label: filterTitles[filter] || filter, href: null });
  } else if (isCompanyPage) {
    const currentCompany = pretprijatija.find(
      (el) => cleanName(transliterate(el[MONEY_SHEET_COLUMNS.NAME])) === companySlug,
    );
    const companyName = getLocalizedCompanyName(currentCompany, currentLang) || companySlug || "...";
    breadcrumbs.push({ label: t("breadcrumbs.registry"), href: `/${currentLang}/registry${location.search}` });
    breadcrumbs.push({ label: companyName, href: null });
  }

  return (
    <div className="bg-body-tertiary sticky-top shadow-lg">
      <div className="container py-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            {breadcrumbs.map((crumb, idx) => (
              <li
                key={idx}
                className={`breadcrumb-item ${idx === breadcrumbs.length - 1 ? "active" : ""}`}
                aria-current={idx === breadcrumbs.length - 1 ? "page" : undefined}
              >
                {crumb.href ? (
                  <Link to={crumb.href}>{crumb.label}</Link>
                ) : (
                  crumb.label
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

export default Breadcrumbs;
