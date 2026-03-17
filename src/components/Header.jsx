import { Link, useParams, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { socialLinkButtons } from "../utils/socialLinkButtons";
import { computeTitle } from "../hooks/usePageTitle";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Header() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const currentLang = lang || i18n.language || "mk";

  const pageTitle = useMemo(() => computeTitle(location, t), [location, t]);
  const socialLinks = socialLinkButtons(pageTitle, window.location.href);

  const homePath = location.search
    ? `/${currentLang}${location.search}`
    : `/${currentLang}`;

  return (
    <div className="bg-hero py-4 text-light">
      <header className="container">
        <div className="row">
          <div className="col-xl-8 col-xxl-7">
            <h1 className="h3 pt-xxl-4">
              <Link
                className="link-light link-underline link-underline-opacity-50 gap-0 gap-sm-3 link-offset-1"
                to={homePath}
              >
                {t("app.title")}
              </Link>
            </h1>
            <p className="lead pb-xl-3">
              {t("app.description")}{" "}
              <a
              className="link-light"
                target="_blank"
                href="https://finance.gov.mk/mk-MK/oblasti/javni-pretprijatija-i-trgovski-drustva-vo-drzavna-sopstvenost"
              >
                {t("app.ministry")}
              </a>
              .
            </p>
          </div>
          <div className="col-xl-4 col-xxl-5">
            <div className="hstack justify-content-xl-end gap-3">
              <LanguageSwitcher />
              {socialLinks.length ? (
                <ul className="nav justify-content-end">
                  {socialLinks.map((icon, key) => (
                    <li key={key} className="nav-item">
                      <a
                        title={t("header.shareOn", { title: icon.title })}
                        href={icon.href}
                        target="_blank"
                        rel="noopener"
                        className="nav-link link-light"
                      >
                        <i className={`bi ${icon.icon}`}></i>
                        <span className="visually-hidden">{t("header.shareOn", { title: icon.title })}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                ``
              )}
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
