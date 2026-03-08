import { useEffect, useMemo, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { order, sorting } from "../utils/filterDefinitions";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";
import { formatDecimalNumber, sumDecimalNumbers } from "../utils/decimalNumbers";
import Navbar from "./Navbar";
import Cards from "./Cards";

function Registry() {
  const { year, quarter, sorting: sortingParam, order: orderParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isNavigating = useRef(false);
  const { pretprijatija, allMoney, availableYears } = useData();

  const defaultSorting = cleanName(transliterate(sorting[0]));
  const defaultOrder = cleanName(transliterate(order[0]));

  const selectedYear = useMemo(() => {
    const latestYear = availableYears[0];
    return year === undefined || parseInt(year) === 0
      ? latestYear
      : year;
  }, [year, availableYears]);

  const selectedQuarter = useMemo(() => {
    if (!quarter) return 0;
    const parsed = parseInt(quarter);
    return parsed >= 1 && parsed <= 4 ? parsed : 0;
  }, [quarter]);

  const selectedSorting = useMemo(() => {
    if (!sortingParam) return defaultSorting;
    const parsed = parseInt(sortingParam);
    if (parsed >= 1 && parsed <= 4) return defaultSorting;
    return sortingParam;
  }, [sortingParam, defaultSorting]);

  const selectedOrder = useMemo(() => {
    return orderParam || defaultOrder;
  }, [orderParam, defaultOrder]);

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  useEffect(() => {
    if (isNavigating.current) {
      isNavigating.current = false;
      return;
    }
    let path = `/registry/${selectedYear}`;
    if (selectedQuarter > 0) {
      path += `/${selectedQuarter}`;
      if (selectedSorting !== defaultSorting) {
        path += `/${selectedSorting}`;
        if (selectedOrder !== defaultOrder) {
          path += `/${selectedOrder}`;
        }
      }
    } else if (selectedSorting !== defaultSorting) {
      path += `/${selectedSorting}`;
      if (selectedOrder !== defaultOrder) {
        path += `/${selectedOrder}`;
      }
    } else if (selectedOrder !== defaultOrder) {
      path += `/0/${selectedOrder}`;
    }
    if (location.pathname !== path) {
      isNavigating.current = true;
      navigate(path, { replace: true });
    }
  }, [selectedYear, selectedQuarter, selectedSorting, selectedOrder, navigate, location.pathname, defaultSorting, defaultOrder]);

  const companiesInSheet = useMemo(() => {
    const companies = [...new Set(money.map((item) => item.Назив))].map((el) =>
      pretprijatija.find((c) => el === c.Назив),
    );

    if (selectedSorting === "osnovno" || selectedOrder === "osnoven") {
      return companies;
    }

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

    const direction = selectedOrder === "rastechki" ? 1 : -1;

    return [...companies].sort((a, b) => {
      const keyA = getCompanyValue(a?.Назив);
      const keyB = getCompanyValue(b?.Назив);
      if (keyA < keyB) return -1 * direction;
      if (keyA > keyB) return 1 * direction;
      return 0;
    });
  }, [money, pretprijatija, selectedSorting, selectedOrder]);

  const filteredMoney = useMemo(() => {
    if (parseInt(selectedQuarter) !== 0) {
      return money.filter((item) => item.Квартал === parseInt(selectedQuarter));
    }
    if (selectedSorting === "osnovno" || selectedOrder === "osnoven") {
      return money;
    }
    return [...money].sort((a, b) => {
      const getKey = (item) => {
        const fieldMap = {
          osnovno: item["Реден број"],
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
      const direction = selectedOrder === "rastechki" ? 1 : -1;
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
