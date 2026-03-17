import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLocalizedCompanyName, getLocalizedCompanyDescription } from "../utils/localizeCompanyName";

export function computeMeta(location, t) {
  const searchParams = new URLSearchParams(location.search);
  const yearParam = searchParams.get("year");
  const quarterParam = searchParams.get("quarter");
  const selectedYear = yearParam || "";
  const selectedQuarter = quarterParam ? parseInt(quarterParam) : 0;

  const path = location.pathname;
  let title = t("app.title");
  let description = t("app.description");
  let ogTitle = null;
  let ogDescription = null;

  if (path.includes("/company/") && location.pathname.split("/company/")[1]) {
    const companySlug = location.pathname.split("/company/")[1]?.split("/").slice(1).join(" / ");
    if (companySlug) {
      title = `${companySlug} - ${t("app.title_short")}`;
      ogTitle = companySlug;
    }
  } else if (path.includes("/filtered/")) {
    const filter = path.split("/filtered/")[1]?.split("/")[0];
    if (filter) {
      const filterTitle = t(`titles.${filter}`);
      let yearQuarterTitle = "";
      if (selectedQuarter > 0) {
        yearQuarterTitle = t("titles.yearQuarterQuarter", { quarter: selectedQuarter, year: selectedYear });
      } else if (selectedYear) {
        yearQuarterTitle = t("titles.yearQuarter", { year: selectedYear });
      }
      title = `${filterTitle} ${yearQuarterTitle} - ${t("app.title_short")}`;
    }
  } else if (path.includes("/registry")) {
    title = `${t("titles.registry")} - ${t("app.title_short")}`;
  } else if (path.includes("/about")) {
    title = `${t("titles.about")} - ${t("app.title_short")}`;
  } else if (path.match(/^\/(mk|en)$/)) {
    title = `${t("titles.home")} - ${t("app.title_short")}`;
  }

  return { title, description, ogTitle, ogDescription };
}

export function computeTitle(location, t) {
  const meta = computeMeta(location, t);
  return meta.title;
}

export function updateDocumentMeta(location, t, company = null, lang = "mk") {
  const meta = computeMeta(location, t);
  const imageUrl = `${window.location.origin}/img/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${lang}-1200x675.webp`;

  if (company && location.pathname.includes("/company/")) {
    const companyName = getLocalizedCompanyName(company, lang);
    const companyDescription = getLocalizedCompanyDescription(company, lang);
    const siteName = t("app.title_short");
    meta.title = `${companyName} - ${siteName}`;
    meta.description = companyDescription || t("app.description");
    meta.ogTitle = companyName;
    meta.ogDescription = companyDescription;
  }

  document.title = meta.title;

  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.ogTitle || meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.ogDescription || meta.description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", imageUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.ogTitle || meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", imageUrl);
}

export default function usePageTitle() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // Skip company pages - Company.jsx handles those with full data
    if (location.pathname.includes("/company/")) {
      return;
    }

    const meta = computeMeta(location, t);
    const lang = i18n.language || "mk";
    const imageUrl = `${window.location.origin}/img/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${lang}-1200x675.webp`;

    document.title = meta.title;

    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[property="og:image"]')?.setAttribute("content", imageUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", imageUrl);
  }, [location.pathname, location.search, i18n.language, t]);
}
