import { useState, useEffect, useRef, useMemo } from "react";
import { read, utils } from "xlsx";
import { file } from "../utils/file";

let workbookPromise = null;

function loadWorkbook() {
  if (workbookPromise) return workbookPromise;

  workbookPromise = (async () => {
    const response = await fetch(file);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return read(arrayBuffer);
  })();

  return workbookPromise;
}

export function useData() {
  const [pretprijatija, setPretprijatija] = useState([]);
  const [allMoney, setAllMoney] = useState({});
  const [availableYears, setAvailableYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    loadWorkbook()
      .then((wb) => {
        const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], {
          blankrows: false,
        });

        const years = wb.SheetNames.filter((_, index) => index > 0).sort().reverse();

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
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return useMemo(
    () => ({
      pretprijatija,
      allMoney,
      availableYears,
      loading,
      error,
    }),
    [pretprijatija, allMoney, availableYears, loading, error]
  );
}
