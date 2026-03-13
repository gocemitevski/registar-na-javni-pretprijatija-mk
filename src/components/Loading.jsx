import { useTranslation } from "react-i18next";

export default function Loading() {
  const { t } = useTranslation();
  
  return (
    <div className="container my-5 flex-fill align-content-center text-center">
      <div className="spinner-border" role="status">
        <span className="visually-hidden">{t("common.loading")}</span>
      </div>
    </div>
  );
}
