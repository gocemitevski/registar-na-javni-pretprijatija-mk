import { StrictMode, Suspense, lazy, useEffect, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./assets/scss/style.scss";
import { Route, Routes, Navigate, BrowserRouter, Outlet, useParams } from "react-router-dom";
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
import NotFound from "./components/NotFound.jsx";
import ScrollToTop from "./components/ScrollToTop.jsx";

export const Registry = lazy(() => import("./components/Registry.jsx"));
export const Overview = lazy(() => import("./components/Overview.jsx"));
export const FilteredCompanies = lazy(() => import("./components/FilteredCompanies.jsx"));
export const YearComparison = lazy(() => import("./components/YearComparison.jsx"));
export const CompanyWrapper = lazy(() => import("./components/CompanyWrapper.jsx"));

document.documentElement.lang = i18n.language;

function LangLayout() {
  const { lang } = useParams();

  if (lang !== "mk" && lang !== "en") {
    return <NotFound />;
  }

  return <Outlet />;
}

function AppContent() {
  const { lang } = useParams();

  usePageTitle();

  useEffect(() => {
    if (
      lang &&
      (lang === "mk" || lang === "en") &&
      lang !== i18n.language
    ) {
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
          <Route path="/:lang" element={<LangLayout />}>
            <Route path="filtered/:filter" element={<FilteredCompanies />} />
            <Route path="registry" element={<Registry />} />
            <Route path="compare" element={<YearComparison />} />
            <Route path="company/:company" element={<CompanyWrapper />} />
            <Route path="about" element={<About />} />
            <Route index element={<Overview />} />
          </Route>
          <Route path="*" element={<NotFound />} />
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

// A new deployment replaces the hashed lazy chunks. A tab that was opened
// before the deploy can still request an old chunk and fail until the page is
// reloaded. Reload once when Vite reports that a dynamic import failed.
const CHUNK_RELOAD_KEY = "chunk-reload-at";

function getLastChunkReload() {
  try {
    const stored = Number(window.sessionStorage.getItem(CHUNK_RELOAD_KEY));
    if (stored) return stored;
  } catch {
    // Fall through to window.name when storage is unavailable.
  }
  return Number(window.name) || 0;
}

function setLastChunkReload(value) {
  try {
    window.sessionStorage.setItem(CHUNK_RELOAD_KEY, String(value));
  } catch {
    // Ignore storage failures; window.name still prevents a reload loop.
  }
  window.name = String(value);
}

window.addEventListener("vite:preloadError", (event) => {
  const now = Date.now();
  if (now - getLastChunkReload() < 10000) return;

  event.preventDefault();
  setLastChunkReload(now);
  window.location.reload();
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
