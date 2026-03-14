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
  const isAboutPage = location.pathname.includes("/about");

  const pathParts = location.pathname.split("/").filter(Boolean);

  const langIndex = pathParts[0] === "mk" || pathParts[0] === "en" ? 1 : 0;
  const isFilteredPageWithFilter = isFilteredPage && pathParts[langIndex + 1];
  const filter = pathParts[langIndex + 1];

  const yearParam = new URLSearchParams(location.search).get("year");
  const quarterParam = new URLSearchParams(location.search).get("quarter");

  const companySlug = isCompanyPage
    ? decodeURIComponent(location.pathname.split("/company/")[1])
    : null;

  if (!isCompanyPage && !isFilteredPageWithFilter && !isAboutPage) {
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

  if (isAboutPage) {
    breadcrumbs.push({ label: t("nav.about"), href: null });
  } else if (isFilteredPageWithFilter) {
    const currentYear = yearParam || "2024";
    const currentQuarter = quarterParam ? parseInt(quarterParam) : null;
    const sectionTitle = currentQuarter
      ? t("breadcrumbs.quickFactsQuarter", { year: currentYear, quarter: currentQuarter })
      : t("breadcrumbs.quickFacts", { year: currentYear });

    const queryParts = [];
    if (yearParam) queryParts.push(`year=${yearParam}`);
    if (quarterParam) queryParts.push(`quarter=${quarterParam}`);
    const queryStr = queryParts.length > 0 ? "?" + queryParts.join("&") : "";

    breadcrumbs.push({ label: sectionTitle, href: `/${currentLang}${queryStr}` });
    breadcrumbs.push({ label: filterTitles[filter] || filter, href: null });
  } else if (isCompanyPage) {
    const currentCompany = pretprijatija.find(
      (el) => cleanName(transliterate(el.Назив)) === companySlug,
    );
    const companyName = getLocalizedCompanyName(currentCompany, currentLang) || companySlug || "...";
    breadcrumbs.push({ label: t("breadcrumbs.registry"), href: `/${currentLang}/registry` });
    breadcrumbs.push({ label: companyName, href: null });
  }

  return (
    <div className="bg-body-tertiary">
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
