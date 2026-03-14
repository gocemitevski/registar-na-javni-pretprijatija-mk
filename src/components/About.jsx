import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-lg-8">
          <h1 className="mb-4">{t("nav.about")}</h1>

          <p className="lead">
            {t("app.description")}{" "}
            <a
              target="_blank"
              href="https://finance.gov.mk/mk-MK/oblasti/javni-pretprijatija-i-trgovski-drustva-vo-drzavna-sopstvenost"
            >
              {t("app.ministry")}
            </a>
            .
          </p>

          <h2 className="h4 mt-5">{t("header.project")}</h2>
          <p>
            This web application was created with the aim of making the data on public enterprises and commercial companies in state ownership available in one place.
          </p>

          <h2 className="h4 mt-5">{t("footer.sourceCode")}</h2>
          <p>
            The source code of the application is available on GitHub under the GPL-3.0 license.
          </p>

          <h2 className="h4 mt-5">{t("footer.madeBy")}</h2>
          <p>
            Application created by {t("footer.author")}.
          </p>

          <div className="mt-5">
            <Link to={`/${currentLang}`} className="btn btn-primary">
              {t("nav.home")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
