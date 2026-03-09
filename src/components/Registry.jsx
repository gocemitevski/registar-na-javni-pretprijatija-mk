import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { order, sorting } from "../utils/filterDefinitions";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import {
  formatDecimalNumber,
  sumDecimalNumbers,
} from "../utils/decimalNumbers";
import Navbar from "./Navbar";
import Cards from "./Cards";

const DEFAULT_SORTING = cleanName(transliterate(sorting[0]));
const DEFAULT_ORDER = cleanName(transliterate(order[0]));
const ASCENDING_ORDER = cleanName(transliterate(order[1]));

function Registry() {
  const {
    year,
    quarter,
    sorting: sortingParam,
    order: orderParam,
  } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { pretprijatija, allMoney, availableYears } = useData();

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    return year === undefined || parseInt(year) === 0 ? latestYear : year;
  }, [year, availableYears]);

  const selectedQuarter = useMemo(() => {
    return quarter ?? "0";
  }, [quarter]);

  const selectedSorting = useMemo(() => {
    return sortingParam || DEFAULT_SORTING;
  }, [sortingParam]);

  const selectedOrder = useMemo(() => {
    return orderParam || DEFAULT_ORDER;
  }, [orderParam]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }
    let path = `/registry/${selectedYear}/${selectedQuarter}/${selectedSorting}/${selectedOrder}`;
    if (location.pathname !== path) {
      isNavigating.current = true;
      navigate(path, { replace: true });
    }
  }, [
    selectedYear,
    selectedQuarter,
    selectedSorting,
    selectedOrder,
    navigate,
    location.pathname,
  ]);

  const companiesInSheet = useMemo(() => {
    const companies = [...new Set(money.map((item) => item.Назив))].map((el) =>
      pretprijatija.find((c) => el === c.Назив),
    );

    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return companies;
    }

    const isDefaultSorting = selectedSorting === DEFAULT_SORTING;
    const direction = selectedOrder === ASCENDING_ORDER ? 1 : -1;

    if (!isDefaultSorting) {
      const getCompanyValue = (companyName) => {
        const companyMoney = money.filter((m) => m.Назив === companyName);
        const fieldMap = {
          prihodi: sumDecimalNumbers(companyMoney.map((m) => m.Приходи)),
          rashodi: sumDecimalNumbers(companyMoney.map((m) => m.Расходи)),
          "finansiski-rezultat": sumDecimalNumbers(
            companyMoney.map((m) => m["Финансиски резултат"]),
          ),
        };
        return fieldMap[selectedSorting] || 0;
      };

      return [...companies].sort((a, b) => {
        const keyA = getCompanyValue(a?.Назив);
        const keyB = getCompanyValue(b?.Назив);
        if (keyA < keyB) return -1 * direction;
        if (keyA > keyB) return 1 * direction;
        return 0;
      });
    }

    const getCompanyRedenBroj = (companyName) => {
      const companyMoney = money.find((m) => m.Назив === companyName);
      return companyMoney?.["Реден број"] || 0;
    };

    return [...companies].sort((a, b) => {
      const keyA = getCompanyRedenBroj(a?.Назив);
      const keyB = getCompanyRedenBroj(b?.Назив);
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, pretprijatija, selectedSorting, selectedOrder]);

  const filteredMoney = useMemo(() => {
    if (selectedQuarter !== "0") {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return money;
    }

    const isDefaultSorting = selectedSorting === DEFAULT_SORTING;
    const direction = selectedOrder === ASCENDING_ORDER ? 1 : -1;

    if (!isDefaultSorting) {
      return [...money].sort((a, b) => {
        const getKey = (item) => {
          const fieldMap = {
            "reden-broj": item["Реден број"],
            prihodi: formatDecimalNumber(item.Приходи),
            rashodi: formatDecimalNumber(item.Расходи),
            "finansiski-rezultat": formatDecimalNumber(
              item["Финансиски резултат"],
            ),
          };
          return fieldMap[selectedSorting] ?? 0;
        };
        const keyA = getKey(a);
        const keyB = getKey(b);
        if (keyA < keyB) return -1 * direction;
        if (keyA > keyB) return 1 * direction;
        return 0;
      });
    }

    return [...money].sort((a, b) => {
      const keyA = a["Реден број"];
      const keyB = b["Реден број"];
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, selectedQuarter, selectedSorting, selectedOrder]);

  return (
    <div>
      <Navbar showSortingFilters={true} />
      <Cards
        tableData={companiesInSheet}
        money={filteredMoney}
        activeSort={selectedSorting}
      />
    </div>
  );
}

export default Registry;
