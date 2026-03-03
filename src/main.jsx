import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import CookieConsent, { Cookies } from "react-cookie-consent";
import "./assets/scss/style.scss";
import App from "./App.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import ZaIzrabotkata from "./components/ZaIzrabotkata.jsx";
import Company from "./components/Company.jsx";
import Breadcrumbs from "./components/Breadcrumbs.jsx";

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
      <Routes>
        <Route index path="/" element={<App />} />
        <Route path="/company/:company" element={<Company />} />
        <Route path="/:year" element={<App />}>
          <Route path=":quarter" element={<App />} />
        </Route>
      </Routes>
      <Breadcrumbs />
      <Footer />
      <ZaIzrabotkata />
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
