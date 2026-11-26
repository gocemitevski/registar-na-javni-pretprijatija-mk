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

// Canonical URLs on the static host always end with a slash (GitHub Pages
// serves directory indexes at /mk/ and redirects /mk to it), so every
// generated path keeps that trailing slash.
export const getPathWithLang = (lang, path) => {
  const splitIndex = path.search(/[?#]/);
  const pathname = splitIndex === -1 ? path : path.slice(0, splitIndex);
  const suffix = splitIndex === -1 ? "" : path.slice(splitIndex);
  const cleanPath = pathname.replace(/^\/(mk|en)\/?/, "/");
  const normalizedPath =
    cleanPath === "/" ? "/" : `${cleanPath.replace(/\/$/, "")}/`;
  return `/${lang}${normalizedPath}${suffix}`;
};
