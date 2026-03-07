import { parseDecimalNumber } from "../utils/decimalNumbers";
import { Link } from "react-router-dom";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

function TopLists({
  topExpenses,
  topIncome,
  topResult,
  worstResult,
  worstIncome,
  worstExpenses,
  selectedYear,
  selectedQuarter,
}) {
  const renderList = (title, items, icon) => (
    <div className="col">
      <div className="card text-bg-light vstack h-100 shadow">
        <div className="card-body flex-grow-0">
          <h5 className="card-title hstack gap-3 mb-0">
            <i className={`text-warning-emphasis bi bi-${icon}`}></i>
            <span>
              {title} во{" "}
              {selectedQuarter > 0 ? `квартал ${selectedQuarter} на ` : ``}
              {selectedYear}
            </span>
          </h5>
        </div>
        <div className="list-group list-group-flush flex-fill">
          {items.map(([name, value], idx) => (
            <Link
              key={idx}
              className="list-group-item link-primary hstack gap-3 justify-content-between align-items-center flex-fill"
              to={`/company/${cleanName(transliterate(name))}`}
            >
              <strong className="fw-bold">{name}</strong>
              <span className="text-body-emphasis">{parseDecimalNumber(value)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-primary-subtle pb-5">
      <div className="container">
        <h1 className="fw-light mx-3 text-secondary">Топ-листи за {selectedQuarter > 0 ? `квартал ${selectedQuarter} на ` : ` `}{selectedYear}</h1>
        <div className="row row-cols-1 row-cols-xl-2 g-4 py-4">
          {renderList("Највисоки приходи", topIncome, "box-arrow-in-up-right")}
          {renderList(
            "Најниски приходи",
            worstIncome,
            "box-arrow-in-down-right",
          )}
          {renderList("Највисоки расходи", topExpenses, "box-arrow-up-right")}
          {renderList(
            "Најниски расходи",
            worstExpenses,
            "box-arrow-down-right",
          )}
          {renderList(
            "Најдобри финансиски резултати",
            topResult,
            "graph-up-arrow",
          )}
          {renderList(
            "Најлоши финансиски резултати",
            worstResult,
            "graph-down-arrow",
          )}
        </div>
      </div>
    </div>
  );
}

export default TopLists;
