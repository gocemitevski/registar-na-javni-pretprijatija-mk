import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import { Cookies } from "react-cookie-consent";
import "./assets/scss/style.scss";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/index.js";

import usePageTitle from "./hooks/usePageTitle";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import CompanyWrapper from "./components/CompanyWrapper.jsx";
import Loading from "./components/Loading.jsx";
import CookieConsentWrapper from "./components/CookieConsentWrapper.jsx";

const Registry = lazy(() => import("./components/Registry.jsx"));
const Overview = lazy(() => import("./components/Overview.jsx"));
const FilteredCompanies = lazy(() => import("./components/FilteredCompanies.jsx"));
const AboutWrapper = lazy(() => import("./components/AboutWrapper.jsx"));

// eslint-disable-next-line react-refresh/only-export-components
function AppContent() {
  usePageTitle();

  return (
    <>
      <Header />
      <Breadcrumbs />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/mk" replace />} />
          <Route path="/:lang/filtered/:filter" element={<FilteredCompanies />} />
          <Route path="/:lang/registry" element={<Registry />} />
          <Route path="/:lang/company/:company" element={<CompanyWrapper />} />
          <Route path="/:lang/about" element={<AboutWrapper />} />
          <Route path="/:lang" element={<Overview />} />
        </Routes>
      </Suspense>
      <Footer />
      <CookieConsentWrapper />
    </>
  );
}

const root = document.getElementById("root");

if (Cookies.get(import.meta.env.VITE_APP_GA_ID) === "true") {
  import.meta.env.VITE_APP_GA &&
    ReactGA.initialize(import.meta.env.VITE_APP_GA, {
      debug: false,
      gaOptions: { cookieDomain: "gocemitevski.github.io" },
    });
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
