import { useTranslation } from "react-i18next";
import { useNavigate, useLocation } from "react-router-dom";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const languages = ["mk", "en"];

  const changeLanguage = (lng) => {
    const pathParts = location.pathname.split("/").filter(Boolean);
    const currentLang = pathParts[0];

    if (currentLang === "mk" || currentLang === "en") {
      pathParts[0] = lng;
      const newPath = "/" + pathParts.join("/");
      navigate(newPath + location.search);
    } else {
      navigate(`/${lng}${location.search}`);
    }
    i18n.changeLanguage(lng);
  };

  return (
    <div className="btn-group" role="group">
      {languages.map((lng) => (
        <button
          type="button"
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`btn btn-sm ${i18n.language === lng ? "btn-light" : "btn-outline-light"}`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
