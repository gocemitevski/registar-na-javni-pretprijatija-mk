import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import CookieConsent, { Cookies } from "react-cookie-consent";
import "./assets/scss/style.scss";
import { BrowserRouter, Route, Routes, useParams } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";

const App = lazy(() => import("./App.jsx"));
const Company = lazy(() => import("./components/Company.jsx"));
const ZaIzrabotkata = lazy(() => import("./components/ZaIzrabotkata.jsx"));

function CompanyWrapper() {
  const { company } = useParams();
  return <Company key={company} />;
}

function Loading() {
  return (
    <div className="container my-5 text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
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
      <Header />
      <Breadcrumbs />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route index path="/" element={<App />} />
          <Route path="/company/:company" element={<CompanyWrapper />} />
          <Route path="/:year" element={<App />}>
            <Route path=":quarter" element={<App />} />
          </Route>
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
        Ова мрежно место користи т.н. колачиња за подобрување на корисничкото
        искуство.
      </CookieConsent>
    </BrowserRouter>
  </StrictMode>
);
