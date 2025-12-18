import { useState, useEffect, Fragment } from "react";
import { read, utils } from "xlsx";
import Cards from "./components/Cards";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { generateYears } from "./utils/generateYears";

function App() {
  const { year, quarter } = useParams();
  const navigate = useNavigate();
  const [pretprijatija, setPretprijatija] = useState([]);
  const [money, setMoney] = useState([]);

  const file = `registar-javni-pretprijatija-r-s-makedonija.ods`;

  const [selectedYear, setSelectedYear] = useState(year || generateYears()[0]);
  const [selectedQuarter, setSelectedQuarter] = useState(quarter || 0);

  const availableYears = generateYears();
  const quarters = [0, 1, 2, 3, 4];

  /* Fetch and update the state on each file change */
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
  }, [file, selectedYear]);

  /* Fetch and update the state on each year change */
  useEffect(() => {
    (async () => {
      const f = await fetch(`./ods/${file}`);
      const ab = await f.arrayBuffer();

      /* Parse */
      const wb = read(ab);

      setMoney(
        utils.sheet_to_json(wb.Sheets[selectedYear], {
          blankrows: false,
        })
      );
    })();
  }, [file, selectedYear]);

  useEffect(() => {
    navigate(
      `/${selectedYear}${selectedQuarter > 0 ? `/${selectedQuarter}` : ``}`
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
                    relative
                    className={`nav-link`}
                    to={`/${selectedYear}${
                      selectedQuarter > 0 ? `/${selectedQuarter}` : ``
                    }`}
                    end
                  >
                    Регистар
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink relative className={`nav-link`} to="/prihodi" end>
                    Приходи
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink relative className={`nav-link`} to="/rashodi" end>
                    Расходи
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    relative
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
                    defaultValue={selectedQuarter}
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
        <Cards tableData={pretprijatija} money={money} />
      </div>
    </div>
  );
}

export default App;
