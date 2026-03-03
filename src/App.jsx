import { useState, useEffect, useRef, useMemo, Fragment } from "react";
import { read, utils } from "xlsx";
import Cards from "./components/Cards";
import { useNavigate, useParams } from "react-router-dom";
import { order, sorting } from "./utils/filterDefinitions";
import { transliterate } from "./utils/transliterate";
import { cleanName } from "./utils/cleanName";
import { file } from "./utils/file";
import { formatDecimalNumber } from "./utils/decimalNumbers";

function App() {
  const { year, quarter } = useParams();
  const navigate = useNavigate();
  const [pretprijatija, setPretprijatija] = useState([]);
  const [money, setMoney] = useState([]);

  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(year || 0);
  const [selectedQuarter, setSelectedQuarter] = useState(
    parseInt(quarter) || 0
  );
  const [selectedSorting, setSelectedSorting] = useState(
    cleanName(transliterate(sorting[0]))
  );
  const [selectedOrder, setSelectedOrder] = useState(
    cleanName(transliterate(order[0]))
  );
  const wbRef = useRef(null);

  /* Load data - fetches once and caches workbook */
  useEffect(() => {
    (async () => {
      if (!wbRef.current) {
        const f = await fetch(`/ods/${file}`);
        const ab = await f.arrayBuffer();
        wbRef.current = read(ab);
      }

      const wb = wbRef.current;

      if (pretprijatija.length === 0) {
        setPretprijatija(
          utils.sheet_to_json(wb.Sheets["Претпријатија"], {
            blankrows: false,
          })
        );
      }

      const years = wb.SheetNames.filter((item, key) => key > 0);
      setAvailableYears(years);

      const targetYear = year === undefined || parseInt(year) === 0
        ? years[0]
        : year;

      if (selectedYear !== targetYear) {
        setSelectedYear(targetYear);
      }

      setMoney(
        utils.sheet_to_json(wb.Sheets[targetYear], {
          blankrows: false,
        })
      );
    })();
  }, [file, year, pretprijatija.length]);

  const quarters = useMemo(
    () => [...new Set([0, ...new Set(money.map((item) => item.Квартал))])],
    [money]
  );

  useEffect(() => {
    navigate(
      `/${selectedYear}${
        parseInt(selectedQuarter) > 0 ? `/${selectedQuarter}` : ``
      }`
    );
  }, [selectedYear, selectedQuarter]);

  const companiesInSheet = useMemo(
    () =>
      [...new Set(money.map((item) => item.Назив))].map((el) =>
        pretprijatija.find((c) => el === c.Назив)
      ),
    [money, pretprijatija]
  );

  const filteredMoney = useMemo(() => {
    if (parseInt(selectedQuarter) !== 0) {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    return [...money].sort((a, b) => {
      const getKey = (item) => {
        const fieldMap = {
          osnovno: item["Реден број"],
          prihodi: formatDecimalNumber(item.Приходи),
          rashodi: formatDecimalNumber(item.Расходи),
          "finansiski-rezultat": formatDecimalNumber(item["Финансиски резултат"]),
        };
        return fieldMap[selectedSorting] ?? 0;
      };
      const keyA = getKey(a);
      const keyB = getKey(b);
      const direction = selectedOrder === "rastecki" ? 1 : -1;
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, selectedQuarter, selectedSorting, selectedOrder]);

  return (
    <Fragment>
      <div className="bg-secondary sticky-top">
        <div className="container">
          <div className="row align-items-center pt-2 pb-3 gx-3 gy-2">
            <div className="col-lg-3">
              <div className="form-floating">
                <select
                  defaultValue={selectedYear}
                  className="form-select"
                  id="years"
                  onChange={(e) => {
                    const currentYear = e.target.value;
                    setSelectedYear(currentYear);
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
            <div className="col-lg-3">
              <div className="form-floating">
                <select
                  defaultValue={quarter}
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
            <div className="col-lg-3">
              <div className="form-floating">
                <select
                  defaultValue={selectedSorting}
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
            <div className="col-lg-3">
              <div className="form-floating">
                <select
                  defaultValue={selectedOrder}
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
          </div>
        </div>
      </div>
      <Cards
        tableData={companiesInSheet}
        money={filteredMoney}
      />
    </Fragment>
  );
}

export default App;
