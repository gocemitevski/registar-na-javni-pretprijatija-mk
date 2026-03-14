import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import About from "./About";
import ZaProektot from "./ZaProektot";

export default function AboutWrapper() {
  const { i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";

  return currentLang === "en" ? <About /> : <ZaProektot />;
}
