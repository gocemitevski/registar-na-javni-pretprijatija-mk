import { useState, useEffect, Fragment } from "react";
import { read, utils } from "xlsx";
import Cards from "./components/Cards";
import { useNavigate, useParams } from "react-router-dom";
import { order, sorting } from "./utils/filterDefinitions";
import { transliterate } from "./utils/transliterate";
import { cleanName } from "./utils/cleanName";

function App() {
  const { year, quarter } = useParams();
  const navigate = useNavigate();
  const [pretprijatija, setPretprijatija] = useState([]);
  const [money, setMoney] = useState([]);

  const file = `registar-javni-pretprijatija-r-s-makedonija.ods`;

  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(year || 0);
  const [selectedQuarter, setSelectedQuarter] = useState(
    parseInt(quarter) || parseInt(0)
  );

  /* Load companies reference data */
  useEffect(() => {
    (async () => {
      const f = await fetch(`./ods/${file}`);
      const ab = await f.arrayBuffer();

      /* Parse */
      const wb = read(ab);

      setPretprijatija(
        utils.sheet_to_json(wb.Sheets["Претпријатија"], {
          blankrows: false,
        })
      );
    })();
  }, [file]);

  /* Load data for each company */
  useEffect(() => {
    (async () => {
      const f = await fetch(`./ods/${file}`);
      const ab = await f.arrayBuffer();

      /* Parse */
      const wb = read(ab);

      setAvailableYears(wb.SheetNames.filter((item, key) => key > 0));
      (year === undefined || parseInt(year) === 0) &&
        setSelectedYear(availableYears[0]);

      setMoney(
        utils.sheet_to_json(wb.Sheets[selectedYear], {
          blankrows: false,
        })
      );
    })();
  }, [file, selectedYear]);

  const quarters = [
    ...new Set([0, ...new Set(money.map((item) => item.Квартал))]),
  ];

  useEffect(() => {
    navigate(
      `/${selectedYear}${
        parseInt(selectedQuarter) > 0 ? `/${selectedQuarter}` : ``
      }`
    );
  }, [selectedYear, selectedQuarter]);

  let companiesInSheet = [...new Set(money.map((item) => item.Назив))].map(
    (el) => pretprijatija.find((c) => el === c.Назив)
  );

  return (
    <Fragment>
      <div className="bg-primary-subtle sticky-top">
        <div className="container">
          <div className="row align-items-center my-3 gx-3">
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
                  onChange={(e) => {
                    const currentQuarter = e.target.value;
                    setSelectedQuarter(currentQuarter);
                  }}
                >
                  {quarters.map((quarter, key) => (
                    <option key={key} value={parseInt(quarter)}>
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
                  defaultValue={quarter}
                  className="form-select"
                  id="sorting"
                  onChange={(e) => {
                    const currentQuarter = e.target.value;
                    setSelectedQuarter(currentQuarter);
                  }}
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
                  defaultValue={quarter}
                  className="form-select"
                  id="order"
                  onChange={(e) => {
                    const currentQuarter = e.target.value;
                    setSelectedQuarter(currentQuarter);
                  }}
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
      <div className="bg-light flex-fill">
        <div className="container">
          <Cards
            tableData={companiesInSheet}
            money={
              parseInt(selectedQuarter) !== 0
                ? money.filter(
                    (item) => item.Квартал === parseInt(selectedQuarter)
                  )
                : money
            }
          />
        </div>
      </div>
    </Fragment>
  );
}

export default App;
