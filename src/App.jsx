import { useState, useEffect, Fragment } from "react";
import { read, utils } from "xlsx";
import Cards from "./components/Cards";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { generateYears } from "./utils/generateYears";

function App() {
  const { year } = useParams();
  const navigate = useNavigate();
  const [pretprijatija, setPretprijatija] = useState([]);
  const [money, setMoney] = useState([]);

  const file = `registar-javni-pretprijatija-r-s-makedonija.ods`;

  const [selectedYear, setSelectedYear] = useState(year || generateYears()[0]);

  const availableYears = generateYears();

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
    navigate(`/${selectedYear}`);
  }, [selectedYear]);

  return (
    <div className="bg-light flex-fill">
      <div className="container">
        <div className="row align-items-center my-3">
          <div className="col-lg-10">
            <nav id="main-navigation">
              <ul className="nav nav-pills">
                <li className="nav-item">
                  <NavLink
                    relative
                    className={`nav-link`}
                    to={`/${selectedYear}`}
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
          <div className="col-lg-2">
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
        </div>
        <Cards tableData={pretprijatija} money={money} />
      </div>
    </div>
  );
}

export default App;
