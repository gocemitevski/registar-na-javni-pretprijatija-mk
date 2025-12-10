import { parseDecimalNumber } from "../utils/parseDecimalNumber";

export default function Card({ row, numbers }) {
  return (
    <div className="card h-100">
      <div className="card-body">
        <div className="row">
          <div className="col-lg-8 vstack">
            <h5 className="card-title">
              <span>{row.Назив}</span>
            </h5>
            <p className="card-text flex-fill">{row.Опис}</p>
            <div className="hstack gap-2">
              <a className="btn btn-sm btn-outline-secondary">Истражи</a>
              <a
                title="Мрежно место"
                target="_blank"
                className="btn btn-sm btn-outline-secondary"
                href={row["Мрежно место"]}
              >
                <i className="bi bi-box-arrow-up-right"></i>
              </a>
            </div>
          </div>
          <div className="col-lg-4">
            <dl>
              <dt className="hstack gap-2">
                <i className="bi bi-arrow-down text-success"></i>
                <span>Приходи</span>
              </dt>
              <dd>{parseDecimalNumber(numbers.Приходи)}</dd>
            </dl>
            <dl>
              <dt className="hstack gap-2">
                <i className="bi bi-arrow-up text-danger"></i>
                <span>Расходи</span>
              </dt>
              <dd>{parseDecimalNumber(numbers.Расходи)}</dd>
            </dl>
            <dl>
              <dt className="hstack gap-2">
                <i
                  className={`bi bi-arrow-down-up ${
                    parseInt(
                      parseDecimalNumber(numbers[`Финансиски резултат`])
                    ) < 0
                      ? `text-danger`
                      : `text-success`
                  }`}
                ></i>
                <span>Финансиски резултат</span>
              </dt>
              <dd>{parseDecimalNumber(numbers[`Финансиски резултат`])}</dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
