import CookieConsent from "react-cookie-consent";
import { useTranslation } from "react-i18next";

export default function CookieConsentWrapper() {
  const { t } = useTranslation();

  return (
    <CookieConsent
      location="bottom"
      buttonText={t("cookieConsent.button")}
      cookieName={import.meta.env.VITE_APP_GA_ID}
      containerClasses="fixed-bottom alert alert-warning hstack gap-2 justify-content-between m-4 shadow"
      contentClasses="hstack my-auto py-2"
      buttonClasses="btn btn-warning text-nowrap"
      disableStyles={true}
    >
      {t("cookieConsent.message")}
    </CookieConsent>
  );
}
