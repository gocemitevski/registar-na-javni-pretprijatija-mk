import { StrictMode, Suspense, lazy, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import { Cookies } from "react-cookie-consent";
import "./assets/scss/style.scss";
import { Route, Routes, Navigate, BrowserRouter, useLocation, useParams } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/index.js";
import usePageTitle from "./hooks/usePageTitle";
import About from "./components/About.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import CompanyWrapper from "./components/CompanyWrapper.jsx";
import CookieConsentWrapper from "./components/CookieConsentWrapper.jsx";
import DataErrorBoundary from "./components/DataErrorBoundary.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Loading from "./components/Loading.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export const Registry = lazy(() => import("./components/Registry.jsx"));
export const Overview = lazy(() => import("./components/Overview.jsx"));
export const FilteredCompanies = lazy(() => import("./components/FilteredCompanies.jsx"));

document.documentElement.lang = i18n.language;

function AppContent() {
  const location = useLocation();
  const { lang } = useParams();

  usePageTitle();

  useEffect(() => {
    if (lang && lang !== i18n.language) {
      i18n.changeLanguage(lang);
    }
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const updateLang = () => {
      document.documentElement.lang = i18n.language;
    };
    i18n.on("languageChanged", updateLang);
    return () => i18n.off("languageChanged", updateLang);
  }, []);

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  // Render errors (chunk/Chart) need hard reload to re-fetch chunks
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <DataErrorBoundary onRetry={handleRetry}>
      <ScrollToTop />
      <Header />
      <Breadcrumbs />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/mk" replace />} />
          <Route path="/:lang/filtered/:filter" element={<FilteredCompanies />} />
          <Route path="/:lang/registry" element={<Registry />} />
          <Route path="/:lang/company/:company" element={<CompanyWrapper />} />
          <Route path="/:lang/about" element={<About />} />
          <Route path="/:lang" element={<Overview />} />
        </Routes>
      </Suspense>
      <Footer />
      <CookieConsentWrapper />
    </DataErrorBoundary>
  );
}

const root = document.getElementById("root");

if (Cookies.get(import.meta.env.VITE_APP_GA_ID) === "true") {
  import.meta.env.VITE_APP_GA &&
    ReactGA.initialize(import.meta.env.VITE_APP_GA, {
      debug: false,
      gaOptions: { cookieDomain: "pretprijatija.gocemitevski.com" },
    });
}

if (window.location.hash.startsWith("#/")) {
  const cleanPath = window.location.hash.slice(1);
  window.history.replaceState(null, "", cleanPath + window.location.search);
}

createRoot(root).render(
  <StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n}>
        <AppContent />
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>
);
