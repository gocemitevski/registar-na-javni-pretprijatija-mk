import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getErrorMessageKey } from "../utils/errorMessages";

const DATA_VERSION =
  typeof __ODS_DATE__ === "string" ? encodeURIComponent(__ODS_DATE__) : "";
const DATA_URL = `${import.meta.env.BASE_URL}data/registar.json${
  DATA_VERSION ? `?v=${DATA_VERSION}` : ""
}`;

let dataPromise = null;
let generation = 0; // bumped on resetData to cancel stale in-flight promises
const resetCallbacks = new Set();

export function resetData() {
  dataPromise = null;
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
    dataPromise = null;
    generation = 0;
  });
}

function loadData() {
  if (dataPromise) return dataPromise;

  dataPromise = (async () => {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
      const err = new Error(`Failed to fetch data: ${response.status}`);
      err.status = response.status;
      throw err;
    }
    const data = await response.json();

    if (!Array.isArray(data?.companies) || !Array.isArray(data?.years) || typeof data?.moneyByYear !== "object") {
      const err = new Error("invalid data: unexpected registry payload");
      err.code = "INVALID_DATA";
      throw err;
    }

    return data;
  })();

  return dataPromise;
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
    resetData();
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

    const myGen = generation; // capture generation to discard stale settlement after resetData

    loadData()
      .then((data) => {
        if (myGen !== generation) return;

        setPretprijatija(data.companies);
        setAllMoney(data.moneyByYear);
        setAvailableYears(data.years);
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
