import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { formatDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import { MONEY_SHEET_COLUMNS } from "../utils/columns";
import { buildQuery, sortByField, DEFAULT_SORTING, DEFAULT_ORDER, ASCENDING_ORDER, parseSortingParam, parseOrderParam, parseYearParam, parseQuarterParam } from "../utils/url";
import Navbar from "./Navbar";
import Cards from "./Cards";

function Registry() {
  const { lang } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { pretprijatija, allMoney, availableYears } = useData();

  const currentLang = lang || "mk";

  const selectedYear = useMemo(
    () => parseYearParam(location.search, availableYears),
    [availableYears, location.search]
  );

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const availableQuarters = useMemo(() => {
    return [...new Set(money.map((item) => item[MONEY_SHEET_COLUMNS.QUARTER]))].filter((q) => q !== 0).sort((a, b) => a - b);
  }, [money]);

  const selectedQuarter = useMemo(
    () => parseQuarterParam(location.search, availableQuarters),
    [location.search, availableQuarters]
  );

  const selectedSorting = useMemo(() => parseSortingParam(location.search), [location.search]);
  const selectedOrder = useMemo(() => parseOrderParam(location.search), [location.search]);

  const direction = selectedOrder === ASCENDING_ORDER ? 1 : -1;

  useEffect(() => {
    if (!availableYears.length) return;
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }

    const targetPath = `/${currentLang}/registry?${buildQuery(selectedYear, selectedQuarter, selectedSorting, selectedOrder)}`;
    const currentPath = location.pathname + location.search;

    if (currentPath !== targetPath) {
      isNavigating.current = true;
      navigate(targetPath, { replace: true });
    }
  }, [currentLang, selectedYear, selectedQuarter, selectedSorting, selectedOrder, navigate, location.pathname, location.search, availableYears]);

  const companiesInSheet = useMemo(() => {
    const filteredByQuarter = selectedQuarter !== 0
      ? money.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter)
      : money;

    const companies = [...new Set(filteredByQuarter.map((item) => item[MONEY_SHEET_COLUMNS.NAME]))].map((el) =>
      pretprijatija.find((c) => el === c[MONEY_SHEET_COLUMNS.NAME]),
    );

    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return companies;
    }

    if (selectedSorting === DEFAULT_SORTING) {
      return sortByField(companies, (c) => {
        const companyMoney = filteredByQuarter.find((m) => m[MONEY_SHEET_COLUMNS.NAME] === c?.[MONEY_SHEET_COLUMNS.NAME]);
        return companyMoney?.[MONEY_SHEET_COLUMNS.ID] || 0;
      }, direction);
    }

    const getCompanyValue = (companyName) => {
      const companyMoney = filteredByQuarter.filter((m) => m[MONEY_SHEET_COLUMNS.NAME] === companyName);
      const fieldMap = {
        income: sumDecimalNumbers(companyMoney.map((m) => m[MONEY_SHEET_COLUMNS.INCOME])),
        expenses: sumDecimalNumbers(companyMoney.map((m) => m[MONEY_SHEET_COLUMNS.EXPENSES])),
        "financial-result": sumDecimalNumbers(companyMoney.map((m) => m[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT])),
      };
      return fieldMap[selectedSorting] || 0;
    };

    return sortByField(companies, (c) => getCompanyValue(c?.[MONEY_SHEET_COLUMNS.NAME]), direction);
  }, [money, pretprijatija, selectedQuarter, selectedSorting, selectedOrder, direction]);

  const filteredMoney = useMemo(() => {
    let result = selectedQuarter !== 0
      ? money.filter((item) => item[MONEY_SHEET_COLUMNS.QUARTER] === selectedQuarter)
      : money;

    if (selectedSorting === DEFAULT_SORTING && selectedOrder === DEFAULT_ORDER) {
      return result;
    }

    if (selectedSorting === DEFAULT_SORTING) {
      return sortByField(result, (item) => item[MONEY_SHEET_COLUMNS.ID], direction);
    }

    return sortByField(result, (item) => {
      const fieldMap = {
        id: item[MONEY_SHEET_COLUMNS.ID],
        income: formatDecimalNumber(item[MONEY_SHEET_COLUMNS.INCOME]),
        expenses: formatDecimalNumber(item[MONEY_SHEET_COLUMNS.EXPENSES]),
        "financial-result": formatDecimalNumber(item[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
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
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        showChart={false}
      />
    </>
  );
}

export default Registry;
