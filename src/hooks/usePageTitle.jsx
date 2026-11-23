import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { getLocalizedCompanyName, getLocalizedCompanyDescription } from "../utils/localizeCompanyName";
import { getCanonicalUrl } from "../utils/canonicalUrl";

export const TITLE_UPDATE_EVENT = "page-title-update";

function getAlternateUrls(location) {
  const match = location.pathname.match(/^\/(mk|en)(?=\/|$)/);
  if (!match) return null;

  const origin = window.location.origin;
  const pathWithoutLang = location.pathname.slice(match[0].length);
  const normalizedPath =
    pathWithoutLang === "" || pathWithoutLang === "/"
      ? "/"
      : `${pathWithoutLang.replace(/\/$/, "")}/`;

  return {
    mk: `${origin}/mk${normalizedPath}`,
    en: `${origin}/en${normalizedPath}`,
  };
}

function updateAlternateLinks(location) {
  const urls = getAlternateUrls(location);
  const existingLinks = document.head.querySelectorAll(
    'link[rel="alternate"][hreflang]',
  );

  if (!urls) {
    existingLinks.forEach((link) => link.remove());
    return;
  }

  const setLink = (hreflang, href) => {
    let link = document.head.querySelector(
      `link[rel="alternate"][hreflang="${hreflang}"]`,
    );
    if (!link) {
      link = document.createElement("link");
      link.setAttribute("rel", "alternate");
      link.setAttribute("hreflang", hreflang);
      document.head.appendChild(link);
    }
    link.setAttribute("href", href);
  };

  setLink("mk", urls.mk);
  setLink("en", urls.en);
  setLink("x-default", urls.mk);
}

function setMetaProperty(property, content) {
  let meta = document.head.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

export function computeMeta(location, t) {
  const searchParams = new URLSearchParams(location.search);
  const yearParam = searchParams.get("year");
  const quarterParam = searchParams.get("quarter");
  const selectedYear = yearParam || "";
  const selectedQuarter = quarterParam ? parseInt(quarterParam, 10) : 0;

  const path = location.pathname;
  let title = t("app.title");
  let description = t("app.description");
  let ogTitle = null;
  let ogDescription = null;

  if (path.includes("/company/") && location.pathname.split("/company/")[1]) {
    const companySlug = location.pathname.split("/company/")[1]?.split("/").slice(1).join(" / ");
    if (companySlug) {
      title = companySlug;
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
  } else if (path.includes("/compare")) {
    title = `${t("titles.compare")} - ${t("app.title_short")}`;
    description = t("compare.description");
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

export function updateDocumentMeta(
  location,
  t,
  company = null,
  lang = "mk",
  { title = null, isUrlNormalization = false } = {},
) {
  const meta = computeMeta(location, t);
  const imageUrl = `${window.location.origin}${import.meta.env.BASE_URL}registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${lang}-1200x675.webp`;

  if (company && location.pathname.includes("/company/")) {
    const companyName = getLocalizedCompanyName(company, lang);
    const companyDescription = getLocalizedCompanyDescription(company, lang);
    meta.title = companyName;
    meta.description = companyDescription || t("app.description");
    meta.ogTitle = companyName;
    meta.ogDescription = companyDescription;
  }

  // Callers may override the computed title (e.g. company not found, where
  // there is no company object to derive the title from).
  if (title) {
    meta.title = title;
    meta.ogTitle = title;
  }

  document.title = meta.title;

  document.querySelector('link[rel="canonical"]')?.setAttribute("href", getCanonicalUrl(location));
  document.querySelector('meta[property="og:url"]')?.setAttribute("content", getCanonicalUrl(location));
  document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.ogTitle || meta.title);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.ogDescription || meta.description);
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", imageUrl);
  document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.ogTitle || meta.title);
  document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.description);
  document.querySelector('meta[name="twitter:image"]')?.setAttribute("content", imageUrl);

  setMetaProperty("og:locale", lang === "en" ? "en_US" : "mk_MK");
  setMetaProperty(
    "og:locale:alternate",
    lang === "en" ? "mk_MK" : "en_US",
  );
  updateAlternateLinks(location);

  window.dispatchEvent(
    new CustomEvent(TITLE_UPDATE_EVENT, {
      detail: { title: meta.title, isUrlNormalization },
    }),
  );
}

export default function usePageTitle() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const lang = i18n.language || "mk";

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    // The root route immediately redirects to /mk, so the "/" render is
    // transient: tracking it would report the redirected URL with a stale
    // title. The landing page dispatch covers it.
    if (location.pathname === "/") {
      return;
    }

    // Skip company pages - Company.jsx handles those with full data
    if (location.pathname.includes("/company/")) {
      return;
    }

    updateDocumentMeta(location, t, null, lang, {
      isUrlNormalization: location.state?.urlNormalization === true,
    });
  }, [location.pathname, location.search, i18n.language, t, lang, location.state]);
}
