import { useTranslation } from "react-i18next";

export default function NoResults() {
  const { t } = useTranslation();

  return (
    <div className="col-12">
      <p className="alert alert-danger">
        {t("common.noResults")}
      </p>
    </div>
  );
}
