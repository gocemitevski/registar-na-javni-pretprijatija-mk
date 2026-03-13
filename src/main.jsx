import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import CookieConsent, { Cookies } from "react-cookie-consent";
import "./assets/scss/style.scss";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n/index.js";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";
import CompanyWrapper from "./components/CompanyWrapper.jsx";
import Loading from "./components/Loading.jsx";

const Registry = lazy(() => import("./components/Registry.jsx"));
const Overview = lazy(() => import("./components/Overview.jsx"));
const FilteredCompanies = lazy(() => import("./components/FilteredCompanies.jsx"));
const ZaIzrabotkata = lazy(() => import("./components/ZaIzrabotkata.jsx"));

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
        <Header />
        <Breadcrumbs />
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/mk" replace />} />
            <Route path="/:lang/filtered/:filter" element={<FilteredCompanies />} />
            <Route path="/:lang/registry" element={<Registry />} />
            <Route path="/:lang/company/:company" element={<CompanyWrapper />} />
            <Route path="/:lang" element={<Overview />} />
          </Routes>
        </Suspense>
        <Footer />
        <Suspense fallback={null}>
          <ZaIzrabotkata />
        </Suspense>
        <CookieConsent
          location="bottom"
          buttonText="Во ред"
          cookieName={import.meta.env.VITE_APP_GA_ID}
          containerClasses="fixed-bottom alert alert-success hstack gap-2 justify-content-between m-4 shadow"
          contentClasses="hstack my-auto py-2"
          buttonClasses="btn btn-success text-nowrap"
          disableStyles={true}
        >
          Ова мрежно место користи т.н. колачиња за подобрување на корисничкото искуство.
        </CookieConsent>
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>
);
