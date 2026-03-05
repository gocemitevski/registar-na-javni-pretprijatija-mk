import { useState, useEffect, useMemo, Fragment } from "react";
import Cards from "./components/Cards";
import { useNavigate, useParams } from "react-router-dom";
import { order, sorting } from "./utils/filterDefinitions";
import { transliterate } from "./utils/transliterate";
import { cleanName } from "./utils/cleanName";
import { formatDecimalNumber, sumDecimalNumbers } from "./utils/decimalNumbers";
import { useData } from "./hooks/useData";

function App() {
  const { year, quarter } = useParams();
  const navigate = useNavigate();
  const { pretprijatija, allMoney, availableYears } = useData();

  const selectedYear = useMemo(() => {
    return year === undefined || parseInt(year) === 0
      ? availableYears[0]
      : year;
  }, [year, availableYears]);

  const [selectedQuarter, setSelectedQuarter] = useState(
    parseInt(quarter) || 0,
  );
  const [selectedSorting, setSelectedSorting] = useState(
    cleanName(transliterate(sorting[0])),
  );
  const [selectedOrder, setSelectedOrder] = useState(
    cleanName(transliterate(order[0])),
  );

  const isDefault = useMemo(() => {
    return (
      selectedQuarter === 0 &&
      selectedSorting === cleanName(transliterate(sorting[0])) &&
      selectedOrder === cleanName(transliterate(order[0]))
    );
  }, [selectedQuarter, selectedSorting, selectedOrder]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  useEffect(() => {
    navigate(
      `/${selectedYear}${
        parseInt(selectedQuarter) > 0 ? `/${selectedQuarter}` : ``
      }`,
    );
  }, [selectedYear, selectedQuarter, navigate]);

  const quarters = useMemo(
    () => [...new Set([0, ...new Set(money.map((item) => item.Квартал))])],
    [money],
  );

  const companiesInSheet = useMemo(() => {
    const companies = [...new Set(money.map((item) => item.Назив))].map((el) =>
      pretprijatija.find((c) => el === c.Назив),
    );

    if (selectedSorting === "osnovno" || selectedOrder === "osnoven") {
      return companies;
    }

    const getCompanyValue = (companyName) => {
      const companyMoney = money.filter((m) => m.Назив === companyName);
      const fieldMap = {
        prihodi: sumDecimalNumbers(companyMoney.map((m) => m.Приходи)),
        rashodi: sumDecimalNumbers(companyMoney.map((m) => m.Расходи)),
        "finansiski-rezultat": sumDecimalNumbers(
          companyMoney.map((m) => m["Финансиски резултат"]),
        ),
      };
      return fieldMap[selectedSorting] || 0;
    };

    const direction = selectedOrder === "rastechki" ? 1 : -1;

    return [...companies].sort((a, b) => {
      const keyA = getCompanyValue(a?.Назив);
      const keyB = getCompanyValue(b?.Назив);
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, pretprijatija, selectedSorting, selectedOrder]);

  const filteredMoney = useMemo(() => {
    if (parseInt(selectedQuarter) !== 0) {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    if (selectedSorting === "osnovno" || selectedOrder === "osnoven") {
      return money;
    }
    return [...money].sort((a, b) => {
      const getKey = (item) => {
        const fieldMap = {
          osnovno: item["Реден број"],
          prihodi: formatDecimalNumber(item.Приходи),
          rashodi: formatDecimalNumber(item.Расходи),
          "finansiski-rezultat": formatDecimalNumber(
            item["Финансиски резултат"],
          ),
        };
        return fieldMap[selectedSorting] ?? 0;
      };
      const keyA = getKey(a);
      const keyB = getKey(b);
      const direction = selectedOrder === "rastechki" ? 1 : -1;
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, selectedQuarter, selectedSorting, selectedOrder]);

  const resetFilters = () => {
    setSelectedQuarter(0);
    setSelectedSorting(cleanName(transliterate(sorting[0])));
    setSelectedOrder(cleanName(transliterate(order[0])));
  };

  return (
    <Fragment>
      <div className="bg-secondary sticky-top">
        <div className="container">
          <div className="row align-items-center pt-2 pb-3 gx-3 gy-2">
            <div className="col">
              <div className="form-floating">
                <select
                  value={selectedYear}
                  className="form-select"
                  id="years"
                  onChange={(e) => {
                    navigate(`/${e.target.value}`);
                  }}
                >
                  {availableYears.map((year, key) => (
                    <option key={key} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <label htmlFor="years">Година</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating">
                <select
                  value={selectedQuarter}
                  className="form-select"
                  id="quarters"
                  onChange={(e) => setSelectedQuarter(e.target.value)}
                >
                  {quarters.map((quarter, key) => (
                    <option key={key} value={quarter}>
                      {quarter === 0 ? `Сите` : quarter}
                    </option>
                  ))}
                </select>
                <label htmlFor="quarters">Квартал</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating">
                <select
                  value={selectedSorting}
                  className="form-select"
                  id="sorting"
                  onChange={(e) => setSelectedSorting(e.target.value)}
                >
                  {sorting.map((sort, key) => (
                    <option key={key} value={cleanName(transliterate(sort))}>
                      {sort}
                    </option>
                  ))}
                </select>
                <label htmlFor="sorting">Подредување</label>
              </div>
            </div>
            <div className="col">
              <div className="form-floating">
                <select
                  value={selectedOrder}
                  className="form-select"
                  id="order"
                  onChange={(e) => setSelectedOrder(e.target.value)}
                >
                  {order.map((order, key) => (
                    <option key={key} value={cleanName(transliterate(order))}>
                      {order}
                    </option>
                  ))}
                </select>
                <label htmlFor="order">Редослед</label>
              </div>
            </div>
            {!isDefault && (
              <div className="col-auto vstack flex-grow-0">
                <button
                  type="button"
                  className="btn btn-outline-light flex-fill"
                  onClick={resetFilters}
                  title="Врати основни вредности"
                >
                  <i class="bi bi-arrow-counterclockwise"></i>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <Cards
        tableData={companiesInSheet}
        money={filteredMoney}
        activeSort={selectedSorting}
      />
    </Fragment>
  );
}

export default App;
