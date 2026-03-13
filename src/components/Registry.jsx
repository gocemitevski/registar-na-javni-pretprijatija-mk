import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { order, sorting } from "../utils/filterDefinitions";
import { formatDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import Navbar from "./Navbar";
import Cards from "./Cards";

const DEFAULT_SORTING = sorting[0];
const DEFAULT_ORDER = order[0];
const ASCENDING_ORDER = order[1];

function sortByField(items, getValue, direction) {
  return [...items].sort((a, b) => {
    const keyA = getValue(a);
    const keyB = getValue(b);
    if (keyA < keyB) return -1 * direction;
    if (keyA > keyB) return 1 * direction;
    return 0;
  });
}

function Registry() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { pretprijatija, allMoney, availableYears } = useData();

  const currentLang = lang || "mk";

  const yearParam = new URLSearchParams(location.search).get("year");
  const quarterParam = new URLSearchParams(location.search).get("quarter");
  const sortingParam = new URLSearchParams(location.search).get("sort");
  const orderParam = new URLSearchParams(location.search).get("order");

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    if (!latestYear) return "";
    return !yearParam || parseInt(yearParam) === 0 ? latestYear : yearParam;
  }, [yearParam, availableYears]);

  const selectedQuarter = useMemo(() => {
    const q = quarterParam ? parseInt(quarterParam) : 0;
    return isNaN(q) ? 0 : q;
  }, [quarterParam]);

  const selectedSorting = useMemo(() => {
    if (!sortingParam) return DEFAULT_SORTING;
    if (sorting.includes(sortingParam)) return sortingParam;
    return DEFAULT_SORTING;
  }, [sortingParam]);

  const selectedOrder = useMemo(() => {
    if (!orderParam) return DEFAULT_ORDER;
    if (order.includes(orderParam)) return orderParam;
    return DEFAULT_ORDER;
  }, [orderParam]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const direction = selectedOrder === ASCENDING_ORDER ? 1 : -1;

  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }
    if (!availableYears.length) return;
    const params = new URLSearchParams();
    params.set("year", selectedYear);
    if (selectedQuarter !== 0) params.set("quarter", selectedQuarter.toString());
    if (selectedSorting !== DEFAULT_SORTING) params.set("sort", selectedSorting);
    if (selectedOrder !== DEFAULT_ORDER) params.set("order", selectedOrder);

    const targetPath = `/${currentLang}/registry?${params.toString()}`;
    const currentPath = location.pathname + location.search;

    if (currentPath !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, { replace: true });
    }
  }, [currentLang, selectedYear, selectedQuarter, selectedSorting, selectedOrder, navigate, location.pathname, location.search, availableYears]);

  const companiesInSheet = useMemo(() => {
    const filteredByQuarter = selectedQuarter !== 0
      ? money.filter((item) => item.Квартал === selectedQuarter)
      : money;

    const companies = [...new Set(filteredByQuarter.map((item) => item.Назив))].map((el) =>
      pretprijatija.find((c) => el === c.Назив),
    );

    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return companies;
    }

    if (selectedSorting === DEFAULT_SORTING) {
      return sortByField(companies, (c) => {
        const companyMoney = filteredByQuarter.find((m) => m.Назив === c?.Назив);
        return companyMoney?.["Реден број"] || 0;
      }, direction);
    }

    const getCompanyValue = (companyName) => {
      const companyMoney = filteredByQuarter.filter((m) => m.Назив === companyName);
      const fieldMap = {
        income: sumDecimalNumbers(companyMoney.map((m) => m.Приходи)),
        expenses: sumDecimalNumbers(companyMoney.map((m) => m.Расходи)),
        "financial-result": sumDecimalNumbers(companyMoney.map((m) => m["Финансиски резултат"])),
      };
      return fieldMap[selectedSorting] || 0;
    };

    return sortByField(companies, (c) => getCompanyValue(c?.Назив), direction);
  }, [money, pretprijatija, selectedQuarter, selectedSorting, selectedOrder, direction]);

  const filteredMoney = useMemo(() => {
    let result = selectedQuarter !== 0
      ? money.filter((item) => item.Квартал === selectedQuarter)
      : money;

    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return result;
    }

    if (selectedSorting === DEFAULT_SORTING) {
      return sortByField(result, (item) => item["Реден број"], direction);
    }

    return sortByField(result, (item) => {
      const fieldMap = {
        id: item["Реден број"],
        income: formatDecimalNumber(item.Приходи),
        expenses: formatDecimalNumber(item.Расходи),
        "financial-result": formatDecimalNumber(item["Финансиски резултат"]),
      };
      return fieldMap[selectedSorting] ?? 0;
    }, direction);
  }, [money, selectedQuarter, selectedSorting, selectedOrder, direction]);

  return (
    <>
      <Navbar showSortingFilters={true} />
      <Cards
        tableData={companiesInSheet}
        money={filteredMoney}
        activeSort={selectedSorting}
      />
    </>
  );
}

export default Registry;
