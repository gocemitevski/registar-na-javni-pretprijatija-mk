import { Link, useParams } from "react-router-dom";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";

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
            <h5 className="card-title">
              <Link to={`/company/${cleanName(transliterate(row.Назив))}`}>
                {row.Назив}
              </Link>
            </h5>
            <p className="card-text flex-fill">{row.Опис}</p>
            <a
              title={`Мрежно место на ${row.Назив}`}
              target="_blank"
              className="btn btn-sm btn-outline-secondary me-auto"
              href={row["Мрежно место"]}
            >
              <i className="bi bi-box-arrow-up-right"></i>
            </a>
          </div>
          <div className="col-lg-4 align-self-center vstack gap-2">
            <DefinitionList
              title={`Приходи`}
              total={totalIncome}
              numbers={numbers}
              quarter={quarter}
              icon={`bi-arrow-down`}
              color={`success`}
            />
            <DefinitionList
              title={`Расходи`}
              total={totalOutcome}
              numbers={numbers}
              quarter={quarter}
              icon={`bi-arrow-up`}
              color={`danger`}
            />
            <DefinitionList
              title={`Финансиски резултат`}
              total={totalFinancialResults}
              numbers={numbers}
              quarter={quarter}
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
