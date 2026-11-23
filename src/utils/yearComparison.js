import { MONEY_SHEET_COLUMNS } from "./columns";
import { formatDecimalNumber } from "./decimalNumbers";
import { resolveCompanyName } from "./companyAliases";

const METRIC_KEYS = ["income", "expenses", "result"];

// Values are stored in millions with one decimal. Rounding running sums to a
// fixed precision stops floating point noise (5.1 - 1.5 - 1.9 - 1.7 evaluates
// to -6.7e-16) from turning exact zeros into near-zero bases, which produced
// percentages in the 1e17 range and "-0" cells. `rounded === 0` also folds -0
// back to 0.
const METRIC_PRECISION = 1e6;

function roundMetric(value) {
  const rounded = Math.round(value * METRIC_PRECISION) / METRIC_PRECISION;
  return rounded === 0 ? 0 : rounded;
}

function emptyTotals() {
  return { income: 0, expenses: 0, result: 0 };
}

function addCompanyMetrics(target, row) {
  target.income = roundMetric(
    target.income + formatDecimalNumber(row[MONEY_SHEET_COLUMNS.INCOME]),
  );
  target.expenses = roundMetric(
    target.expenses + formatDecimalNumber(row[MONEY_SHEET_COLUMNS.EXPENSES]),
  );
  target.result = roundMetric(
    target.result +
      formatDecimalNumber(row[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
  );
}

export function getYearStats(allMoney, year) {
  const rows = Array.isArray(allMoney?.[year]) ? allMoney[year] : [];
  const quarters = [
    ...new Set(
      rows
        .map((row) => Number(row[MONEY_SHEET_COLUMNS.QUARTER]))
        .filter((quarter) => Number.isFinite(quarter)),
    ),
  ].sort((a, b) => a - b);
  const hasAnnualRow = quarters.includes(0);

  return {
    rows,
    quarters,
    hasAnnualRow,
    isPartial: !hasAnnualRow && !quarters.includes(4),
  };
}

export function aggregateYearCompanies(rows = []) {
  const annualRows = rows.filter(
    (row) => Number(row[MONEY_SHEET_COLUMNS.QUARTER]) === 0,
  );
  // Some sheets contain a single annual (quarter 0) row per company, while
  // newer sheets only contain quarterly rows. Never mix both representations,
  // otherwise the annual total would be counted twice.
  const sourceRows = annualRows.length > 0 ? annualRows : rows;
  const companies = {};

  sourceRows.forEach((row) => {
    const name = row[MONEY_SHEET_COLUMNS.NAME];
    if (!name) return;

    const canonicalName = resolveCompanyName(name);
    const company = (companies[canonicalName] ??= emptyTotals());
    addCompanyMetrics(company, row);
  });

  return companies;
}

// Maps each canonical (current) name back to the name used in this year's
// sheet, so a comparison can display the name that was actually in use then.
function collectOriginalNames(rows = []) {
  const names = {};

  rows.forEach((row) => {
    const name = row[MONEY_SHEET_COLUMNS.NAME];
    if (!name) return;

    const canonicalName = resolveCompanyName(name);
    if (!names[canonicalName]) names[canonicalName] = name;
  });

  return names;
}

function sumCompanyTotals(companies) {
  return Object.values(companies).reduce((totals, company) => {
    METRIC_KEYS.forEach((key) => {
      totals[key] = roundMetric(totals[key] + company[key]);
    });
    return totals;
  }, emptyTotals());
}

function computePercent(delta, base, compare) {
  if (base !== 0) return (delta / Math.abs(base)) * 100;
  // A change against an exact zero base has no finite ratio. Fall back to the
  // comparison value so the cell still carries a bounded percentage: a value
  // that appears from zero is +100 %, one that disappears is -100 %.
  if (compare !== 0) return (delta / Math.abs(compare)) * 100;
  return 0;
}

export function buildYearComparison(allMoney, baseYear, compareYear) {
  const baseStats = getYearStats(allMoney, baseYear);
  const compareStats = getYearStats(allMoney, compareYear);
  const baseCompanies = aggregateYearCompanies(baseStats.rows);
  const compareCompanies = aggregateYearCompanies(compareStats.rows);
  const baseNames = collectOriginalNames(baseStats.rows);
  const compareNames = collectOriginalNames(compareStats.rows);
  const baseIsNewer = Number(baseYear) > Number(compareYear);
  const baseTotals = sumCompanyTotals(baseCompanies);
  const compareTotals = sumCompanyTotals(compareCompanies);

  const names = [
    ...new Set([
      ...Object.keys(baseCompanies),
      ...Object.keys(compareCompanies),
    ]),
  ];

  const companies = names.map((name) => {
    const base = baseCompanies[name] ?? null;
    const compare = compareCompanies[name] ?? null;
    const deltas = {};
    const percents = {};

    METRIC_KEYS.forEach((key) => {
      if (!base || !compare) {
        deltas[key] = null;
        percents[key] = null;
        return;
      }

      const delta = roundMetric(compare[key] - base[key]);
      deltas[key] = delta;
      percents[key] = computePercent(delta, base[key], compare[key]);
    });

    return {
      name,
      // Prefer the name from the newer year so a comparison spanning a rename
      // links to the company page that covers that year.
      displayName: baseIsNewer
        ? (baseNames[name] ?? compareNames[name] ?? name)
        : (compareNames[name] ?? baseNames[name] ?? name),
      base,
      compare,
      deltas,
      percents,
      status: base && compare ? "both" : base ? "onlyBase" : "onlyCompare",
    };
  });

  const totals = {};
  METRIC_KEYS.forEach((key) => {
    const delta = roundMetric(compareTotals[key] - baseTotals[key]);
    totals[key] = {
      base: baseTotals[key],
      compare: compareTotals[key],
      delta,
      percent: computePercent(delta, baseTotals[key], compareTotals[key]),
    };
  });

  return {
    baseYear,
    compareYear,
    baseStats,
    compareStats,
    companies,
    totals,
  };
}

export function getDefaultComparisonYears(availableYears = [], allMoney = {}) {
  const completeYears = availableYears.filter(
    (year) => !getYearStats(allMoney, year).isPartial,
  );
  const candidates =
    completeYears.length >= 2 ? completeYears : availableYears;

  return {
    baseYear: candidates[1] ?? candidates[0] ?? "",
    compareYear: candidates[0] ?? "",
  };
}

export function formatComparisonPercent(value) {
  if (value == null || !Number.isFinite(value)) return "—";

  const formatted = new Intl.NumberFormat("de-DE", {
    style: "decimal",
    maximumFractionDigits: 1,
  }).format(Math.abs(value));

  if (value > 0) return `+${formatted} %`;
  if (value < 0) return `-${formatted} %`;
  return `0 %`;
}
