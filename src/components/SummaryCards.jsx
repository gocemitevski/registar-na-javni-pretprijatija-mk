import { useMemo } from "react";
import { Link, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDecimalNumber } from "../utils/decimalNumbers";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";

function SummaryCards({ money, selectedYear, selectedQuarter }) {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const location = useLocation();
  const currentLang = lang || i18n.language || "mk";

  const summaryData = useMemo(() => {
    if (!money || money.length === 0) return null;

    const filteredMoney =
      selectedQuarter > 0 ? money.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter) : money;

    const companyMap = {};
    filteredMoney.forEach((item) => {
      const name = item[MONEY_SHEET_COLUMNS.NAME];
      if (!companyMap[name]) {
        companyMap[name] = {
          totalIncome: 0,
          totalExpenses: 0,
          totalResult: 0,
        };
      }
      companyMap[name].totalIncome += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.INCOME]);
      companyMap[name].totalExpenses += formatDecimalNumber(item[MONEY_SHEET_COLUMNS.EXPENSES]);
      companyMap[name].totalResult += formatDecimalNumber(
        item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT],
      );
    });

    let positiveResults = 0;
    let negativeResults = 0;
    let companiesWithIncome = 0;
    let companiesWithoutIncome = 0;
    let earningMoreThanSpending = 0;
    let spendingMoreThanIncome = 0;

    Object.values(companyMap).forEach((company) => {
      if (company.totalResult > 0) positiveResults++;
      else negativeResults++;
      if (company.totalIncome > 0) companiesWithIncome++;
      else companiesWithoutIncome++;
      if (company.totalIncome > company.totalExpenses * 2)
        earningMoreThanSpending++;
      else spendingMoreThanIncome++;
    });

    return {
      positiveResults,
      negativeResults,
      companiesWithIncome,
      companiesWithoutIncome,
      spendingMoreThanIncome,
      earningMoreThanSpending,
    };
  }, [money, selectedQuarter]);

  if (!summaryData) return null;

  const getTitle = (singularKey, pluralKey, count) => {
    return count % 10 === 1 && count !== 11 ? t(singularKey) : t(pluralKey);
  };

  const CARDS = [
    {
      title: getTitle(
        "summary.income_singular",
        "summary.income",
        summaryData.companiesWithIncome,
      ),
      color: "success",
      filter: "income",
    },
    {
      title: getTitle(
        "summary.positiveResult_singular",
        "summary.positiveResult",
        summaryData.positiveResults,
      ),
      color: "success",
      filter: "positive-result",
    },
    {
      title: getTitle(
        "summary.earnedMore_singular",
        "summary.earnedMore",
        summaryData.earningMoreThanSpending,
      ),
      color: "success",
      filter: "earned-more",
    },
    {
      title: getTitle(
        "summary.noIncome_singular",
        "summary.noIncome",
        summaryData.companiesWithoutIncome,
      ),
      color: "danger",
      filter: "no-income",
    },
    {
      title: getTitle(
        "summary.negativeResult_singular",
        "summary.negativeResult",
        summaryData.negativeResults,
      ),
      color: "danger",
      filter: "negative-result",
    },
    {
      title: getTitle(
        "summary.spentMore_singular",
        "summary.spentMore",
        summaryData.spendingMoreThanIncome,
      ),
      color: "danger",
      filter: "spent-more",
    },
  ];

  const getLink = (filter) => {
    const params = new URLSearchParams(location.search);
    params.set("year", selectedYear);
    if (selectedQuarter > 0) {
      params.set("quarter", selectedQuarter.toString());
    } else {
      params.delete("quarter");
    }
    return `/${currentLang}/filtered/${filter}?${params.toString()}`;
  };

  const cardValues = [
    summaryData.companiesWithIncome,
    summaryData.positiveResults,
    summaryData.earningMoreThanSpending,
    summaryData.companiesWithoutIncome,
    summaryData.negativeResults,
    summaryData.spendingMoreThanIncome,
  ];

  return (
    <div className="bg-primary-subtle bg-shade-img pt-4 pt-lg-5">
      <div className="container">
        <h1 className="fw-light m-3 text-secondary">
          {selectedQuarter > 0
            ? t("summary.quickFactsQuarter", { year: selectedYear, quarter: selectedQuarter })
            : t("summary.quickFacts", { year: selectedYear })}
        </h1>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 py-2 py-lg-4">
          {CARDS.map((card, index) => (
            <div key={index} className="col">
              <div className={`card h-100 shadow ${cardValues[index] !== 0 ? `btn-link-arrow btn-link-shadow` : ``}`}>
                <div className="card-body hstack gap-3">
                  <div className="flex-fill vstack gap-3">
                    <h2
                      className={`card-text mb-0 fw-light text-uppercase order-1 fs-6`}
                    >
                      {card.title}
                    </h2>
                    <p
                      className={`order-0 flex-fill card-text display-6 fw-bold text-${cardValues[index] === 0 ? `muted opacity-75` : card.color}`}
                    >
                      {cardValues[index]}
                    </p>
                  </div>
                  {cardValues[index] !== 0 && (
                    <Link
                      to={getLink(card.filter)}
                      className={`btn btn-link link-${card.color} stretched-link align-self-end`}
                    >
                      <span className="visually-hidden">
                        {t("summary.explore")}
                      </span>
                      <i className="bi bi-arrow-right fs-3"></i>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SummaryCards;
