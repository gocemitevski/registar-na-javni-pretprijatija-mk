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
      <div className="card vstack h-100">
        <div className="card-body flex-grow-0">
          <h5 className="card-title hstack gap-2 mb-0">
            <i className={`bi bi-${icon}`}></i>
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
              className="list-group-item list-group-item-action hstack gap-3 justify-content-between align-items-center"
              to={`/company/${cleanName(transliterate(name))}`}
            >
              <strong className="fw-bold text-primary">{name}</strong>
              <span>{parseDecimalNumber(value)}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-secondary-subtle py-3">
      <div className="container">
        <div className="row row-cols-2 g-3">
          {renderList("Највисоки приходи", topIncome, "box-arrow-in-up-right")}
          {renderList("Најниски приходи", worstIncome, "box-arrow-in-down-right")}
          {renderList("Највисоки расходи", topExpenses, "box-arrow-up-right")}
          {renderList("Најниски расходи", worstExpenses, "box-arrow-down-right")}
          {renderList("Најдобри финансиски резултати", topResult, "graph-up-arrow")}
          {renderList("Најлоши финансиски резултати", worstResult, "graph-down-arrow")}
        </div>
      </div>
    </div>
  );
}

export default TopLists;
