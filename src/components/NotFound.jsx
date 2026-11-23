import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang =
    lang === "mk" || lang === "en" ? lang : i18n.language || "mk";

  useEffect(() => {
    if (document.head.querySelector('meta[name="robots"]')) return undefined;

    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex";
    document.head.appendChild(meta);
    return () => meta.remove();
  }, []);

  return (
    <main className="container my-5 flex-fill">
      <h1 className="h3 mb-3">{t("notFound.title")}</h1>
      <p className="mb-4">{t("notFound.description")}</p>
      <Link className="btn btn-primary" to={`/${currentLang}`}>
        {t("notFound.home")}
      </Link>
    </main>
  );
}
