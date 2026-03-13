import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();

  return (
    <div className="bg-primary text-light py-4">
      <footer className="container">
        <div className="row g-3">
          <div className="col-xxl-6">
            <a
              className="link-light"
              rel="noopener"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk"
            >
              {t("footer.sourceCode")}
            </a>{" "}
            {t("footer.availableOn")}{" "}
            <a
              className="link-light"
              rel="noopener"
              href="https://github.com/gocemitevski/registar-na-javni-pretprijatija-mk?tab=GPL-3.0-1-ov-file"
            >
              {t("footer.license")}
            </a>
            .
          </div>
          <div className="col-xxl-6 text-xxl-end">
            {t("footer.madeBy")}{" "}
            <a
              className="link-light"
              rel="noopener"
              href="https://www.gocemitevski.com/"
            >
              {t("footer.author")}
            </a>.
          </div>
        </div>
      </footer>
    </div>
  );
}
