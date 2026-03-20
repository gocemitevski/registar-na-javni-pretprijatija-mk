import { useState, useEffect, useRef } from "react";
import { read, utils } from "xlsx";
import { file } from "../utils/file";

let dataPromise = null;
let wbRef = null;

function loadData() {
  if (dataPromise) return dataPromise;

  dataPromise = (async () => {
    if (wbRef) return { wb: wbRef };

    const f = await fetch(file);
    if (!f.ok) throw new Error(`Failed to fetch data: ${f.status}`);
    const ab = await f.arrayBuffer();
    wbRef = read(ab);
    return { wb: wbRef };
  })();

  return dataPromise;
}

export function useData() {
  const [pretprijatija, setPretprijatija] = useState([]);
  const [allMoney, setAllMoney] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      try {
        const { wb } = await loadData();

        const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], {
          blankrows: false,
        });

        const years = wb.SheetNames.filter((item, key) => key > 0).sort().reverse();

        const moneyByYear = {};
        years.forEach((y) => {
          moneyByYear[y] = utils.sheet_to_json(wb.Sheets[y], {
            blankrows: false,
          });
        });

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
