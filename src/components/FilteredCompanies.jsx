import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useData } from "../hooks/useData";
import Cards from "./Cards";

function FilteredCompanies() {
  const { year, quarter, filter } = useParams();
  const { pretprijatija, allMoney } = useData();

  const selectedYear = year || "2024";
  const selectedQuarter = quarter ? parseInt(quarter) : 0;

  const money = useMemo(() => {
    return allMoney[selectedYear] || [];
  }, [selectedYear, allMoney]);

  const filteredMoney = useMemo(() => {
    if (!money || money.length === 0) return [];

    const filteredByQuarter =
      selectedQuarter > 0
        ? money.filter((item) => item.Квартал === selectedQuarter)
        : money;

    const companyMap = {};
    filteredByQuarter.forEach((item) => {
      const name = item.Назив;
      if (!companyMap[name]) {
        companyMap[name] = {
          totalIncome: 0,
          totalExpenses: 0,
          totalResult: 0,
        };
      }
      companyMap[name].totalIncome += parseFloat(item.Приходи) || 0;
      companyMap[name].totalExpenses += parseFloat(item.Расходи) || 0;
      companyMap[name].totalResult +=
        parseFloat(item["Финансиски резултат"]) || 0;
    });

    let filteredCompanies = [];

    switch (filter) {
      case "positive-result":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult > 0,
        );
        break;
      case "income":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult > 0,
        );
        break;
      case "earned-more":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) =>
            companyMap[name].totalIncome > companyMap[name].totalExpenses,
        );
        break;
      case "negative-result":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult < 0,
        );
        break;
      case "no-income":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult <= 0,
        );
        break;
      case "spent-more":
        filteredCompanies = Object.keys(companyMap).filter(
          (name) =>
            companyMap[name].totalExpenses > companyMap[name].totalIncome,
        );
        break;
      default:
        filteredCompanies = Object.keys(companyMap);
    }

    const filteredData = filteredCompanies
      .map((name) => pretprijatija.find((c) => c.Назив === name))
      .filter(Boolean);

    return filteredData;
  }, [money, pretprijatija, selectedQuarter, filter]);

  const companiesInSheet = useMemo(() => {
    if (!money || money.length === 0) return [];

    const filteredByQuarter =
      selectedQuarter > 0
        ? money.filter((item) => item.Квартал === selectedQuarter)
        : money;

    const companyMap = {};
    filteredByQuarter.forEach((item) => {
      const name = item.Назив;
      if (!companyMap[name]) {
        companyMap[name] = {
          totalIncome: 0,
          totalExpenses: 0,
          totalResult: 0,
        };
      }
      companyMap[name].totalIncome += parseFloat(item.Приходи) || 0;
      companyMap[name].totalExpenses += parseFloat(item.Расходи) || 0;
      companyMap[name].totalResult +=
        parseFloat(item["Финансиски резултат"]) || 0;
    });

    let filteredCompanyNames = [];

    switch (filter) {
      case "positive-result":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult > 0,
        );
        break;
      case "income":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult > 0,
        );
        break;
      case "earned-more":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) =>
            companyMap[name].totalIncome > companyMap[name].totalExpenses,
        );
        break;
      case "negative-result":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult < 0,
        );
        break;
      case "no-income":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) => companyMap[name].totalResult <= 0,
        );
        break;
      case "spent-more":
        filteredCompanyNames = Object.keys(companyMap).filter(
          (name) =>
            companyMap[name].totalExpenses > companyMap[name].totalIncome,
        );
        break;
      default:
        filteredCompanyNames = Object.keys(companyMap);
    }

    return filteredCompanyNames
      .map((name) => {
        return filteredByQuarter.filter((item) => item.Назив === name);
      })
      .flat();
  }, [money, selectedQuarter, filter]);

  return (
    <Cards
      tableData={filteredMoney}
      money={companiesInSheet}
      activeSort="osnovno"
    />
  );
}

export default FilteredCompanies;
