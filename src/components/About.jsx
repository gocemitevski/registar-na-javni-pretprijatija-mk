import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";

export default function About() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";
  const photo = `registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${lang}-1200x675.webp`;

  return (
    <>
      <Navbar showFilters={false} />
      <main className="container pt-4 py-lg-5">
      <div className="row">
        <div className="col-xl-7">
          <h1 className="mb-3 text-primary-emphasis">{t("nav.about")}</h1>
          <p className="lead">
            {t("about.intro")} <strong>{t("about.introStrong")}</strong>
          </p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.goalTitle")}</h2>
          <p>{t("about.goal")}</p>
          <p>{t("about.filters")}</p>
          <p>{t("about.visualization")}</p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.dataSourceTitle")}</h2>
          <p>
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://finance.gov.mk/mk-MK/oblasti/javni-pretprijatija-i-trgovski-drustva-vo-drzavna-sopstvenost"
            >
              {t("about.dataSourceData")}{" "}
            </a>
            {t("about.dataSource")}{" "}
            <a
              rel="noopener noreferrer"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk/tree/main/public/ods"
            >
              {t("about.dataSourceLink")}
            </a>{" "}
            {t("about.dataSourceLinkDesc")}
          </p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">
            {t("about.additionalMaterialsTitle")}
          </h2>
          <ul>
            <li>
              <a
                rel="noopener noreferrer"
                target="_blank"
                href="https://www.freepik.com/premium-photo/macedonian-money-business-background_3486152.htm#fromView=image_search_similar&page=1&position=0&uuid=0fb11170-e356-472c-a2c8-793f2ea4bb5e"
              >
                {t("about.additionalMaterials")}
              </a>
            </li>
          </ul>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.sourceCodeTitle")}</h2>
          <p>
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk"
            >
              {t("footer.sourceCode")}
            </a>{" "}
            {t("about.sourceCodeDesc")}
          </p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.licenseTitle")}</h2>
          <p>
            {t("about.licenseDesc")}{" "}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
            >
              {t("footer.license")}
            </a>
            .
          </p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.ai")}</h2>
          <p>
            {t("about.aiDesc")}{" "}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://opencode.ai/"
            >
              {t("about.opencode")}
            </a>
            .
          </p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.updatesTitle")}</h2>
          <p>{t("about.updates")}</p>
          <h2 className="h4 mt-4 mb-3 text-primary-emphasis">{t("about.responsibilityTitle")}</h2>
          <p>
            {t("about.responsibility")}{" "}
            <strong className="fw-bold">
              {t("about.responsibilityStrong")}
            </strong>{" "}
            {t("about.responsibilityFix")}{" "}
            <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk/issues/new"
            >
              {t("about.responsibilityLink")}
            </a>{" "}
            {t("about.responsibilityLinkDesc")}
          </p>
        </div>
        <div className="col-xl-5">
          <figure>
            <a href={photo}>
              <img
                className="img-thumbnail img-fluid"
                src={photo}
                alt={t("about.imageAlt")}
              />
            </a>
            <figcaption className="text-muted py-2 px-3">
              {t("about.imageAlt")}
            </figcaption>
          </figure>
        </div>
      </div>
    </main>
    </>
  );
}
