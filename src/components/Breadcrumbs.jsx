import { Link, useLocation, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";

function Breadcrumbs() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { pretprijatija, loading } = useData();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";

  const isCompanyPage = location.pathname.includes("/company/");
  const isFilteredPage = location.pathname.includes("/filtered/");

  const pathParts = location.pathname.split("/").filter(Boolean);

  const langIndex = pathParts[0] === "mk" || pathParts[0] === "en" ? 1 : 0;
  const isFilteredPageWithFilter = isFilteredPage && pathParts[langIndex + 1];
  const filter = pathParts[langIndex + 1];

  const yearParam = new URLSearchParams(location.search).get("year");
  const quarterParam = new URLSearchParams(location.search).get("quarter");

  const companySlug = isCompanyPage
    ? decodeURIComponent(location.pathname.split("/company/")[1])
    : null;

  if (!isCompanyPage && !isFilteredPageWithFilter) {
    return null;
  }

  if (isFilteredPageWithFilter && loading) {
    return null;
  }

  if (isCompanyPage && loading) {
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

  if (isFilteredPageWithFilter) {
    const filterTitle = filterTitles[filter] || filter;

    const currentYear = yearParam || "2024";
    const currentQuarter = quarterParam ? parseInt(quarterParam) : null;
    const sectionTitle = currentQuarter
      ? t("breadcrumbs.quickFactsQuarter", { year: currentYear, quarter: currentQuarter })
      : t("breadcrumbs.quickFacts", { year: currentYear });

    const queryParts = [];
    if (yearParam) queryParts.push(`year=${yearParam}`);
    if (quarterParam) queryParts.push(`quarter=${quarterParam}`);
    const queryStr = queryParts.length > 0 ? "?" + queryParts.join("&") : "";

    return (
      <div className="bg-body-tertiary">
        <div className="container py-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to={`/${currentLang}`}>{t("breadcrumbs.home")}</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/${currentLang}${queryStr}`}>{sectionTitle}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {filterTitle}
              </li>
            </ol>
          </nav>
        </div>
      </div>
    );
  }

  const currentCompany = pretprijatija.find(
    (el) => cleanName(transliterate(el.Назив)) === companySlug,
  );

  const companyName = getLocalizedCompanyName(currentCompany, currentLang) || companySlug || "...";

  return (
    <div className="bg-light">
      <div className="container py-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to={`/${currentLang}`}>{t("breadcrumbs.home")}</Link>
            </li>
            <li className="breadcrumb-item">
              <Link to={`/${currentLang}/registry`}>{t("breadcrumbs.registry")}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {companyName || "..."}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

export default Breadcrumbs;
