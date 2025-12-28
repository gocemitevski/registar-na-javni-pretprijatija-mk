import { useState, useEffect, Fragment } from "react";
import { read, utils } from "xlsx";
import Cards from "./components/Cards";
import { NavLink, useNavigate, useParams } from "react-router-dom";

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

  return (
    <div className="bg-light flex-fill">
      <div className="container">
        <div className="row align-items-center my-3 gx-3">
          <div className="col-lg-8">
            <nav id="main-navigation">
              <ul className="nav nav-pills">
                <li className="nav-item">
                  <NavLink
                    className={`nav-link`}
                    to={`/${selectedYear}${
                      parseInt(selectedQuarter) > 0 ? `/${selectedQuarter}` : ``
                    }`}
                    end
                  >
                    Регистар
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={`nav-link`} to="/prihodi" end>
                    Приходи
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink className={`nav-link`} to="/rashodi" end>
                    Расходи
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    className={`nav-link`}
                    to="/finansiski-rezultati"
                    end
                  >
                    Финансиски резултати{" "}
                  </NavLink>
                </li>
              </ul>
            </nav>
          </div>
          <div className="col-lg-4">
            <div className="row g-2">
              <div className="col-lg-6">
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
              <div className="col-lg-6">
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
                      <option key={key} value={quarter}>
                        {quarter === 0 ? `Сите` : quarter}
                      </option>
                    ))}
                  </select>
                  <label htmlFor="quarters">Квартал</label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Cards
          tableData={pretprijatija.filter((item) =>
            [...new Set(money.map((item) => item.Назив))].includes(item.Назив)
          )}
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
  );
}

export default App;
