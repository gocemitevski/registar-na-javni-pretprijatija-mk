import { useTranslation } from "react-i18next";
import { formatOdsDate } from "../utils/formatOdsDate";

const odsDate =
  typeof __ODS_DATE__ === "string" && __ODS_DATE__ !== "null"
    ? new Date(__ODS_DATE__)
    : null;

export default function LastDataUpdate() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "mk";

  if (!odsDate) return null;

  return (
    <span className="badge text-bg-secondary-dark p-2 mb-3 hstack gap-2 d-md-inline-flex">
      <i className="bi bi-activity"></i>
      <span className="fw-light text-truncate">{t("app.lastUpdated")} <strong className="fw-medium">{formatOdsDate(odsDate, lang)}</strong></span>
    </span>
  );
}
