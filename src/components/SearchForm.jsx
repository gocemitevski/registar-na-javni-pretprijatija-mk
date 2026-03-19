import { useTranslation } from "react-i18next";

export default function SearchForm({ value, searchData }) {
  const { t } = useTranslation();

  return (
    <div className="mt-2 mb-4">
      <div className="input-group flex-fill">
        <input
          id="search"
          className="form-control form-control-lg"
          type="text"
          placeholder={t("search.placeholder")}
          onChange={searchData}
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
            onClick={() => searchData({ target: { value: "" } })}
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
