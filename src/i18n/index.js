import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import resources from "./resources";

const getInitialLanguage = () => {
  const hash = window.location.hash;
  const match = hash.match(/^#\/(mk|en)/);
  if (match) {
    return match[1];
  }
  const pathMatch = window.location.pathname.match(/^\/(mk|en)(\/|$)/);
  if (pathMatch) {
    return pathMatch[1];
  }
  return "mk";
};

i18n.use(initReactI18next).init({
  resources,
  lng: getInitialLanguage(),
  fallbackLng: "mk",
  interpolation: { escapeValue: false }
});

export default i18n;

export const getPathWithLang = (lang, path) => {
  const cleanPath = path.replace(/^\/(mk|en)\/?/, "/");
  return `/${lang}${cleanPath === "/" ? "" : cleanPath}`;
};
