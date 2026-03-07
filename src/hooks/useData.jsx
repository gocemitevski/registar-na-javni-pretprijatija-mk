import { useState, useEffect, useRef } from "react";
import { read, utils } from "xlsx";
import { file } from "../utils/file";

let cachedData = null;

export function useData() {
  const [pretprijatija, setPretprijatija] = useState([]);
  const [allMoney, setAllMoney] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const wbRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        if (cachedData) {
          setPretprijatija(cachedData.pretprijatija);
          setAllMoney(cachedData.allMoney);
          setAvailableYears(cachedData.availableYears);
          setLoading(false);
          return;
        }

        if (!wbRef.current) {
          const f = await fetch(`/ods/${file}`);
          if (!f.ok) throw new Error(`Failed to fetch data: ${f.status}`);
          const ab = await f.arrayBuffer();
          wbRef.current = read(ab);
        }

        const wb = wbRef.current;

        const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], {
          blankrows: false,
        });

        const years = wb.SheetNames.filter((item, key) => key > 0).sort().reverse();
        setAvailableYears(years);

        const moneyByYear = {};
        years.forEach((y) => {
          moneyByYear[y] = utils.sheet_to_json(wb.Sheets[y], {
            blankrows: false,
          });
        });

        cachedData = {
          pretprijatija: companies,
          allMoney: moneyByYear,
          availableYears: years,
        };

        setPretprijatija(companies);
        setAllMoney(moneyByYear);
        setAvailableYears(years);
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      }
    })();
  }, []);

  return {
    pretprijatija,
    allMoney,
    availableYears,
    loading,
    error,
  };
}
