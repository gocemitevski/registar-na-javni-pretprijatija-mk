import { useMemo } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { formatDecimalNumber } from "../utils/decimalNumbers";

function SummaryCards({ money, selectedYear, selectedQuarter }) {
  const { t, i18n } = useTranslation();
  const { lang } = useParams();
  const [searchParams] = useSearchParams();
  const currentLang = lang || i18n.language || "mk";

  const CARDS = [
    { title: t("summary.positiveResult"), color: "success", filter: "positive-result" },
    { title: t("summary.income"), color: "success", filter: "income" },
    { title: t("summary.earnedMore"), color: "success", filter: "earned-more" },
    { title: t("summary.negativeResult"), color: "danger", filter: "negative-result" },
    { title: t("summary.noIncome"), color: "danger", filter: "no-income" },
    { title: t("summary.spentMore"), color: "danger", filter: "spent-more" },
  ];

  const year = searchParams.get("year") || selectedYear;
  const quarter = searchParams.get("quarter") ? parseInt(searchParams.get("quarter")) : selectedQuarter;

  const summaryData = useMemo(() => {
    if (!money || money.length === 0) return null;

    const filteredMoney =
      quarter > 0
        ? money.filter((item) => item.Квартал === parseInt(quarter))
        : money;

    const companyMap = {};
    filteredMoney.forEach((item) => {
      const name = item.Назив;
      if (!companyMap[name]) {
        companyMap[name] = {
          totalIncome: 0,
          totalExpenses: 0,
          totalResult: 0,
        };
      }
      companyMap[name].totalIncome += formatDecimalNumber(item.Приходи);
      companyMap[name].totalExpenses += formatDecimalNumber(item.Расходи);
      companyMap[name].totalResult += formatDecimalNumber(item["Финансиски резултат"]);
    });

    let positiveResults = 0;
    let negativeResults = 0;
    let earningMoreThanSpending = 0;
    let spendingMoreThanIncome = 0;

    Object.values(companyMap).forEach((company) => {
      if (company.totalResult > 0) positiveResults++;
      else negativeResults++;
      if (company.totalIncome > company.totalExpenses) earningMoreThanSpending++;
      else spendingMoreThanIncome++;
    });

    return {
      positiveResults,
      negativeResults,
      profitableCompanies: positiveResults,
      unprofitableCompanies: negativeResults,
      spendingMoreThanIncome,
      earningMoreThanSpending,
    };
  }, [money, quarter]);

  if (!summaryData) return null;

  const getLink = (filter) => {
    const params = new URLSearchParams();
    params.set("year", year);
    if (quarter > 0) params.set("quarter", quarter.toString());
    return `/${currentLang}/filtered/${filter}?${params.toString()}`;
  };

  const cardValues = [
    summaryData.positiveResults,
    summaryData.profitableCompanies,
    summaryData.earningMoreThanSpending,
    summaryData.negativeResults,
    summaryData.unprofitableCompanies,
    summaryData.spendingMoreThanIncome,
  ];

  return (
    <div className="bg-primary-subtle py-5">
      <div className="container">
        <h1 className="fw-light mx-3 mt-2 text-secondary">
          {quarter > 0 ? t("summary.quickFactsQuarter", { year, quarter }) : t("summary.quickFacts", { year })}
        </h1>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 py-4">
          {CARDS.map((card, index) => (
            <div key={index} className="col">
              <div className="card h-100 shadow">
                <div className="card-body hstack gap-3">
                  <div className="flex-fill">
                  <h5 className={`card-title text-${card.color} h1 mb-2`}>
                    {cardValues[index]}
                  </h5>
                  <p className="card-text">{card.title}</p>
                  </div>
                  <Link
                    to={getLink(card.filter)}
                    className={`btn btn-sm btn-link link-${card.color} stretched-link align-self-end`}
                  >
                    <span className="visually-hidden">{t("summary.explore")}</span>
                    <i className="bi bi-arrow-right fs-3"></i>
                  </Link>
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
