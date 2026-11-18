import { StrictMode, Suspense, lazy, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./assets/scss/style.scss";
import { Route, Routes, Navigate, BrowserRouter, useParams } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/index.js";
import usePageTitle, { TITLE_UPDATE_EVENT } from "./hooks/usePageTitle";
import { getCurrentPath, initMatomo, trackPageView } from "./utils/matomo";
import About from "./components/About.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import DataErrorBoundary from "./components/DataErrorBoundary.jsx";
import Footer from "./components/Footer.jsx";
import Header from "./components/Header.jsx";
import Loading from "./components/Loading.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export const Registry = lazy(() => import("./components/Registry.jsx"));
export const Overview = lazy(() => import("./components/Overview.jsx"));
export const FilteredCompanies = lazy(() => import("./components/FilteredCompanies.jsx"));
export const CompanyWrapper = lazy(() => import("./components/CompanyWrapper.jsx"));

document.documentElement.lang = i18n.language;

function AppContent() {
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
    </DataErrorBoundary>
  );
}

const root = document.getElementById("root");

// Cookieless analytics: no cookies or other identifiers are stored on the
// visitor's device, so the tracker runs without a consent gate.
initMatomo();

// Page views are reported when the title for the current route is finalised.
// usePageTitle and Company.jsx both dispatch TITLE_UPDATE_EVENT once a page's
// metadata is ready, which also covers company pages whose title only resolves
// after their data has loaded. The listener is registered here, before React
// mounts, so the very first page view is not missed.
window.addEventListener(TITLE_UPDATE_EVENT, (event) => {
  trackPageView({
    path: getCurrentPath(),
    title: document.title,
    isUrlNormalization: event.detail?.isUrlNormalization === true,
  });
});

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
