import { useEffect, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useData } from "../hooks/useData";
import { useComparisonParams } from "../hooks/useComparisonParams";
import { buildYearComparison, getYearStats } from "../utils/yearComparison";
import { buildComparisonQuery, URL_NORMALIZATION_STATE } from "../utils/url";
import ComparisonChart from "./ComparisonChart";
import ComparisonSummary from "./ComparisonSummary";
import ComparisonTable from "./ComparisonTable";
import DataErrorView from "./DataErrorView";
import Icon from "./Icon";
import Loading from "./Loading";
import Navbar from "./Navbar";

function YearComparison() {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const currentLang = lang || i18n.language || "mk";
  const location = useLocation();
  const navigate = useNavigate();
  const isNavigating = useRef(false);
  const {
    pretprijatija,
    allMoney,
    availableYears,
    loading,
    hasError,
    errorInfo,
    retry,
  } = useData();
  const { baseYear, compareYear, selectedCurrency } = useComparisonParams(
    availableYears,
    allMoney,
  );

  const comparison = useMemo(() => {
    if (!baseYear || !compareYear) return null;
    return buildYearComparison(allMoney, baseYear, compareYear);
  }, [allMoney, baseYear, compareYear]);

  const partialYears = useMemo(() => {
    return [...new Set([baseYear, compareYear])]
      .filter(Boolean)
      .map((year) => ({ year, stats: getYearStats(allMoney, year) }))
      .filter(({ stats }) => stats.isPartial);
  }, [allMoney, baseYear, compareYear]);

  useEffect(() => {
    if (loading || hasError) return;
    if (!baseYear || !compareYear) return;

    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }

    const query = buildComparisonQuery(
      baseYear,
      compareYear,
      location.search,
    );
    const targetPath = `${location.pathname}${query ? `?${query}` : ""}`;
    const currentPath = `${location.pathname}${location.search}`;

    if (currentPath !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, {
        replace: true,
        state: URL_NORMALIZATION_STATE,
      });
    }
  }, [
    loading,
    hasError,
    baseYear,
    compareYear,
    location.pathname,
    location.search,
    navigate,
  ]);

  if (loading) {
    return <Loading />;
  }

  if (hasError) {
    return <DataErrorView errorInfo={errorInfo} onRetry={retry} />;
  }

  if (availableYears.length < 2) {
    return (
      <>
        <Navbar showFilters={false} />
        <main className="container my-5 flex-fill">
          <div className="alert alert-warning mb-0">
            {t("compare.notEnoughYears")}
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar showComparisonFilters={true} />
      <main className="container my-5 flex-fill">
        <div className="vstack">
          <h1 className="h3 mb-3">{t("compare.title")}</h1>
          <p className="mb-0">{t("compare.intro")}</p>
        </div>
        {partialYears.length > 0 && (
          <div
            className="alert alert-warning hstack gap-2 align-items-start mt-4"
            role="alert"
          >
            <Icon
              name="exclamation-triangle-fill"
              className="flex-shrink-0 mt-1"
            />
            <div className="vstack gap-1">
              {partialYears.map(({ year, stats }) => (
                <p key={year} className="mb-0">
                  {stats.quarters.length > 0
                    ? t("compare.partialYear", {
                        year,
                        quarters: stats.quarters.join(", "),
                      })
                    : t("compare.noYearData", { year })}
                </p>
              ))}
            </div>
          </div>
        )}
        {comparison && (
          <ComparisonSummary
            totals={comparison.totals}
            baseYear={baseYear}
            compareYear={compareYear}
            currency={selectedCurrency}
          />
        )}
        {comparison && (
          <>
            <ComparisonChart
              totals={comparison.totals}
              baseYear={baseYear}
              compareYear={compareYear}
              currency={selectedCurrency}
            />
            <ComparisonTable
              companies={comparison.companies}
              totals={comparison.totals}
              baseYear={baseYear}
              compareYear={compareYear}
              companyRows={pretprijatija}
              currency={selectedCurrency}
              currentLang={currentLang}
            />
          </>
        )}
      </main>
    </>
  );
}

export default YearComparison;
