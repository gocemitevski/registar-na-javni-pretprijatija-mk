import { useTranslation } from "react-i18next";

export default function DefinitionListTotal({ title, total, rawValue, icon, isActive }) {
  const { t } = useTranslation();

  const isFinancialResult = title === t("cards.financial-result");
  const color = isFinancialResult && rawValue != null
    ? rawValue < 0 ? "danger" : "success"
    : null;

  return (
    <dl className={`hstack gap-2 mb-0 px-2 rounded ${isActive ? "bg-warning-subtle" : ""}`}>
      <dt className="hstack gap-3 mb-0">
        <i className={`bi ${icon} text-warning-emphasis`}></i>
        <span>{title}</span>
      </dt>
      <dd className={`mb-0 flex-fill text-end${color ? ` text-${color}` : ""}`}>
        {total}
      </dd>
    </dl>
  );
}
