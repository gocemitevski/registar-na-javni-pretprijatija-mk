import { useParams } from "react-router-dom";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";

export default function Card({ row, numbers }) {
  const { quarter } = useParams();

  const totalIncome = sumDecimalNumbers(numbers.map((item) => item.Приходи));
  const totalOutcome = sumDecimalNumbers(numbers.map((item) => item.Расходи));
  const totalFinancialResults = sumDecimalNumbers(
    numbers.map((item) => item[`Финансиски резултат`])
  );

  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row g-5">
          <div className="col-lg-8 vstack">
            <h5 className="card-title">{row.Назив}</h5>
            <p className="card-text flex-fill">{row.Опис}</p>
            <div className="row">
              <div className="col-lg-4 hstack gap-2">
                <a className="btn btn-sm btn-outline-secondary">Истражи</a>
                <a
                  title={`Мрежно место на ${row.Назив}`}
                  target="_blank"
                  className="btn btn-sm btn-outline-secondary"
                  href={row["Мрежно место"]}
                >
                  <i className="bi bi-box-arrow-up-right"></i>
                </a>
              </div>
            </div>
          </div>
          <div className="col-lg-4 align-self-end vstack gap-2">
            <DefinitionList
              title={`Приходи`}
              total={totalIncome}
              numbers={numbers}
              icon={`bi-arrow-down`}
              color={`success`}
            />
            <DefinitionList
              title={`Расходи`}
              total={totalOutcome}
              numbers={numbers}
              icon={`bi-arrow-up`}
              color={`danger`}
            />
            <DefinitionList
              title={`Финансиски резултат`}
              total={totalFinancialResults}
              numbers={numbers}
              icon={`bi-arrow-down-up`}
              color={
                parseInt(
                  parseInt(quarter) !== 0
                    ? parseDecimalNumber(totalFinancialResults)
                    : parseDecimalNumber(
                        numbers.find(
                          (item) => item.Квартал === parseInt(quarter)
                        )[`Финансиски резултат`]
                      )
                ) < 0
                  ? `danger`
                  : `success`
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
