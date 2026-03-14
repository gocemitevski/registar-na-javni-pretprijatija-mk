import { useTranslation } from "react-i18next";

export default function ZaProektot() {
  const { t } = useTranslation();

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
            Оваа веб-апликација е изработена со цел да го направи податокот за
            јавните претпријатија и трговските друштва во државна сопственост
            достапен на едно место.
          </p>

          <h2 className="h4 mt-5">{t("footer.sourceCode")}</h2>
          <p>
            Изворниот код на апликацијата е достапен на GitHub под лиценцата
            GPL-3.0.
          </p>

          <h2 className="h4 mt-5">{t("footer.madeBy")}</h2>
          <p>Апликацијата е изработена од {t("footer.author")}.</p>
        </div>
      </div>
      <div className="col-lg-4">slika ovde</div>
    </div>
  );
}
