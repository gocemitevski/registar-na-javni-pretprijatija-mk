import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { formatDecimalNumber } from "../utils/decimalNumbers";

const CARDS = [
  {
    title: "Оствариле позитивен финансиски резултат",
    color: "success",
    filter: "positive-result",
  },
  {
    title: "Оствариле приход",
    color: "success",
    filter: "income",
  },
  {
    title: "Заработиле повеќе од што потрошиле",
    color: "success",
    filter: "earned-more",
  },
  {
    title: "Оствариле негативен финансиски резултат",
    color: "danger",
    filter: "negative-result",
  },
  {
    title: "Не оствариле приход",
    color: "danger",
    filter: "no-income",
  },
  {
    title: "Потрошиле повеќе од што заработиле",
    color: "danger",
    filter: "spent-more",
  },
];

function SummaryCards({ money, selectedYear, selectedQuarter }) {
  const { year: urlYear, quarter: urlQuarter } = useParams();

  const year = urlYear || selectedYear;
  const quarter = urlQuarter ? parseInt(urlQuarter) : selectedQuarter;

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
    const basePath = `/filtered/${filter}/${year}`;
    return quarter > 0 ? `${basePath}/${quarter}` : basePath;
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
          Брзи факти за {quarter > 0 ? `квартал ${quarter} на ` : ` `}
          {year}
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
                    <span className="visually-hidden">Истражи</span>
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
