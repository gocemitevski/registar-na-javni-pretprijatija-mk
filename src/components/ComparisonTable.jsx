import { useCallback, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";
import { parseDecimalNumber } from "../utils/decimalNumbers";
import { getLocalizedCompanyName } from "../utils/localizeCompanyName";
import { COMPANY_SHEET_COLUMNS } from "../utils/columns";
import { buildCompanyQuery } from "../utils/url";
import { formatComparisonPercent } from "../utils/yearComparison";
import Icon from "./Icon";

const METRICS = ["income", "expenses", "result"];
const METRIC_LABELS = {
  income: "cards.income",
  expenses: "cards.expenses",
  result: "cards.financial-result",
};
const SORTS = ["delta", "percent", "name"];

function getValueClass(value) {
  if (value == null || value === 0) return "text-body-secondary";
  return value > 0 ? "text-success" : "text-danger";
}

function compareNullableNumbers(a, b, direction) {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return (a - b) * direction;
}

export default function ComparisonTable({
  companies,
  totals,
  baseYear,
  compareYear,
  companyRows,
  currency,
  currentLang,
}) {
  const { t } = useTranslation();
  const location = useLocation();
  const [metric, setMetric] = useState("result");
  const [sortField, setSortField] = useState("delta");
  const [sortDirection, setSortDirection] = useState("desc");

  const companyRowsByName = useMemo(() => {
    const map = {};
    (companyRows || []).forEach((row) => {
      map[row[COMPANY_SHEET_COLUMNS.NAME]] = row;
    });
    return map;
  }, [companyRows]);

  const getDisplayName = useCallback(
    (name) =>
      getLocalizedCompanyName(companyRowsByName[name], currentLang) || name,
    [companyRowsByName, currentLang],
  );

  const companySearch = useMemo(
    () => buildCompanyQuery(location.search),
    [location.search],
  );

  const rows = useMemo(() => {
    const direction = sortDirection === "asc" ? 1 : -1;

    return [...(companies || [])].sort((a, b) => {
      if (sortField === "name") {
        return (
          getDisplayName(a.name).localeCompare(
            getDisplayName(b.name),
            currentLang,
          ) * direction
        );
      }

      const field = sortField === "percent" ? "percents" : "deltas";
      return compareNullableNumbers(
        a[field][metric],
        b[field][metric],
        direction,
      );
    });
  }, [
    companies,
    metric,
    sortDirection,
    sortField,
    currentLang,
    getDisplayName,
  ]);

  const formatValue = (value) =>
    value == null ? "—" : parseDecimalNumber(value, currentLang, currency);

  const getCompanyLink = (name) => {
    const slug = cleanName(transliterate(name));
    return `/${currentLang}/company/${slug}${companySearch ? `?${companySearch}` : ""}`;
  };

  return (
    <div className="my-4 my-lg-5">
      <h2 className="h5 mb-3">{t("compare.tableTitle")}</h2>
      <div className="row g-2 mb-2">
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="compare-metric"
              value={metric}
              onChange={(event) => setMetric(event.target.value)}
            >
              {METRICS.map((key) => (
                <option key={key} value={key}>
                  {t(METRIC_LABELS[key])}
                </option>
              ))}
            </select>
            <label htmlFor="compare-metric">{t("compare.metric")}</label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="compare-sort"
              value={sortField}
              onChange={(event) => setSortField(event.target.value)}
            >
              {SORTS.map((sort) => (
                <option key={sort} value={sort}>
                  {t(`compare.sort.${sort}`)}
                </option>
              ))}
            </select>
            <label htmlFor="compare-sort">{t("compare.sortBy")}</label>
          </div>
        </div>
        <div className="col-md-4">
          <div className="form-floating">
            <select
              className="form-select"
              id="compare-order"
              value={sortDirection}
              onChange={(event) => setSortDirection(event.target.value)}
            >
              <option value="desc">{t("order.desc")}</option>
              <option value="asc">{t("order.asc")}</option>
            </select>
            <label htmlFor="compare-order">{t("nav.order")}</label>
          </div>
        </div>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>{t("compare.company")}</th>
              <th className="text-end">{baseYear}</th>
              <th className="text-end">{compareYear}</th>
              <th className="text-end">{t("compare.change")}</th>
              <th className="text-end">{t("compare.changePercent")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const baseValue = row.base?.[metric] ?? null;
              const compareValue = row.compare?.[metric] ?? null;
              const delta = row.deltas[metric];
              const percent = row.percents[metric];
              const missingYear =
                row.status === "onlyBase"
                  ? compareYear
                  : row.status === "onlyCompare"
                    ? baseYear
                    : null;

              return (
                <tr key={row.name}>
                  <td>
                    <Link className="fw-semibold" to={getCompanyLink(row.name)}>
                      {getDisplayName(row.name)}
                    </Link>
                    {missingYear && (
                      <span className="badge text-bg-warning text-nowrap d-inline-flex align-items-center gap-1 ms-2">
                        <Icon name="exclamation-triangle-fill" />
                        {t("compare.missingYear", { year: missingYear })}
                      </span>
                    )}
                  </td>
                  <td className="text-end">{formatValue(baseValue)}</td>
                  <td className="text-end">{formatValue(compareValue)}</td>
                  <td className={`text-end ${getValueClass(delta)}`}>
                    {formatValue(delta)}
                  </td>
                  <td className={`text-end ${getValueClass(percent)}`}>
                    {formatComparisonPercent(percent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr>
                <th>{t("table.total")}</th>
                <th className="text-end">
                  {formatValue(totals[metric].base)}
                </th>
                <th className="text-end">
                  {formatValue(totals[metric].compare)}
                </th>
                <th className={`text-end ${getValueClass(totals[metric].delta)}`}>
                  {formatValue(totals[metric].delta)}
                </th>
                <th
                  className={`text-end ${getValueClass(totals[metric].percent)}`}
                >
                  {formatComparisonPercent(totals[metric].percent)}
                </th>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      {rows.length === 0 && (
        <div className="alert alert-secondary mb-0">
          {t("compare.noResults")}
        </div>
      )}
    </div>
  );
}
