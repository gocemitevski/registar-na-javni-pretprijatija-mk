import { useTranslation } from "react-i18next";

export default function SearchForm({
  value,
  filters,
  setFilterValue,
  searchData,
  searchColumns,
}) {
  const { t } = useTranslation();
  const activeFilter = Object.keys(filters).find((key) => filters[key]) || searchColumns[0];

  return (
    <div className="mt-2 mb-4">
      <div className="input-group flex-fill">
        <input
          id={`search`}
          className="form-control form-control-lg"
          type="text"
          placeholder={t("search.placeholder")}
          onChange={(e) => searchData(e, activeFilter)}
          value={value}
        ></input>
        {!value && (
          <span className="input-group-text">
            <i className="bi bi-search"></i>
          </span>
        )}
        {value && (
          <button
            className="btn btn-outline-secondary"
            type="button"
            title={t("search.clearTitle")}
            onClick={() => setFilterValue(activeFilter, "")}
            disabled={!value}
          >
            <i className="bi bi-x-lg"></i>
            <span className="visually-hidden">{t("search.clear")}</span>
          </button>
        )}
      </div>
      <div className="form-text mx-3 pt-2">
        {t("search.hint", { keywords: t("search.keywords") })}
      </div>
    </div>
  );
}
