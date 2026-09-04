import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { read, utils } from "xlsx";
import { file } from "../utils/file";
import { getErrorMessageKey } from "../utils/errorMessages";

let workbookPromise = null;
let generation = 0; // bumped on resetWorkbook to cancel stale in-flight promises
const resetCallbacks = new Set();

export function resetWorkbook() {
  workbookPromise = null;
  generation += 1;
  resetCallbacks.forEach((cb) => cb());
}

export function registerReset(callback) {
  resetCallbacks.add(callback);
  return () => resetCallbacks.delete(callback);
}

if (import.meta.hot) {
  import.meta.hot.dispose(() => {
    resetCallbacks.clear();
    workbookPromise = null;
    generation = 0;
  });
}

function loadWorkbook() {
  if (workbookPromise) return workbookPromise;

  workbookPromise = (async () => {
    const response = await fetch(file);
    if (!response.ok) {
      const err = new Error(`Failed to fetch data: ${response.status}`);
      err.status = response.status;
      throw err;
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
  const [hasError, setHasError] = useState(false);
  const [errorInfo, setErrorInfo] = useState(null);
  const hasInitialized = useRef(false);
  const [retryKey, setRetryKey] = useState(0);

  const retry = useCallback(() => {
    resetWorkbook();
  }, []);

  useEffect(() => {
    return registerReset(() => {
      hasInitialized.current = false;
      setHasError(false);
      setErrorInfo(null);
      setLoading(true);
      setRetryKey((k) => k + 1);
    });
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    const myGen = generation; // capture generation to discard stale settlement after resetWorkbook

    loadWorkbook()
      .then((wb) => {
        if (myGen !== generation) return;
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
        if (myGen !== generation) return;
        const errorMessageKey = getErrorMessageKey(err);

        console.error("[useData] Error:", err);
        setErrorInfo({ messageKey: errorMessageKey, originalError: err });
        setHasError(true);
        setLoading(false);
      });
  }, [retryKey]);

  return useMemo(
    () => ({
      pretprijatija,
      allMoney,
      availableYears,
      loading,
      hasError,
      errorInfo,
      retry,
      // backward-compat alias: return human message if available, otherwise null (avoid leaking messageKey)
      error: errorInfo?.originalError?.message ?? null,
    }),
    [pretprijatija, allMoney, availableYears, loading, hasError, errorInfo, retry]
  );
}
