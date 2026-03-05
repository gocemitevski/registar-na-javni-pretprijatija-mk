import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { parseDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import DefinitionList from "./DefinitionList";
import { cleanName } from "../utils/cleanName";
import { transliterate } from "../utils/transliterate";

export default function Card({ row, numbers, activeSort }) {
  const { quarter } = useParams();
  const quarterNum = parseInt(quarter) || 0;

  const SORT_KEYS = {
    prihodi: "Приходи",
    rashodi: "Расходи",
    "finansiski-rezultat": "Финансиски резултат",
  };
  const activeTitle = SORT_KEYS[activeSort] || null;

  const totalIncome = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item.Приходи)),
    [numbers]
  );
  const totalOutcome = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item.Расходи)),
    [numbers]
  );
  const totalFinancialResults = useMemo(
    () => sumDecimalNumbers(numbers.map((item) => item["Финансиски резултат"])),
    [numbers]
  );

  const financialResultColor = useMemo(() => {
    if (quarterNum === 0) {
      return parseInt(parseDecimalNumber(totalFinancialResults)) < 0 ? "danger" : "success";
    }
    const q = numbers.find((item) => item.Квартал === quarterNum);
    if (!q) return "success";
    return parseInt(parseDecimalNumber(q["Финансиски резултат"])) < 0 ? "danger" : "success";
  }, [quarterNum, numbers, totalFinancialResults]);

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
          <div className="col-lg-4 align-self-center vstack gap-1">
            <DefinitionList
              title="Приходи"
              total={totalIncome}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down"
              color="success"
              isActive={activeTitle === "Приходи"}
            />
            <DefinitionList
              title="Расходи"
              total={totalOutcome}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-up"
              color="danger"
              isActive={activeTitle === "Расходи"}
            />
            <DefinitionList
              title="Финансиски резултат"
              total={totalFinancialResults}
              numbers={numbers}
              quarter={quarter}
              icon="bi-arrow-down-up"
              color={financialResultColor}
              isActive={activeTitle === "Финансиски резултат"}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
