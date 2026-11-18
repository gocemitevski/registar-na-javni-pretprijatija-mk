import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { read, utils } from "xlsx";

// Converts the build-time ODS spreadsheet into a compact JSON payload so the
// browser does not have to download xlsx (~110 KB gzipped) and parse the
// workbook before it can render anything.
//
// Output: public/data/registar.json
//   { companies: [], years: [], moneyByYear: { [year]: [] } }

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

const odsPath = join(projectRoot, "public/ods/registar-javni-pretprijatija-r-s-makedonija.ods");
const outputDir = join(projectRoot, "public/data");
const outputPath = join(outputDir, "registar.json");

const COMPANIES_SHEET = "Претпријатија";

const wb = read(readFileSync(odsPath));

if (!wb.Sheets[COMPANIES_SHEET]) {
  throw new Error(`Sheet "${COMPANIES_SHEET}" not found in ${odsPath}`);
}

const companies = utils.sheet_to_json(wb.Sheets[COMPANIES_SHEET], {
  blankrows: false,
});

const years = wb.SheetNames.filter((_, index) => index > 0).sort().reverse();

const moneyByYear = {};
years.forEach((year) => {
  moneyByYear[year] = utils.sheet_to_json(wb.Sheets[year], { blankrows: false });
});

mkdirSync(outputDir, { recursive: true });
writeFileSync(outputPath, JSON.stringify({ companies, years, moneyByYear }));

const rows = years.reduce((total, year) => total + moneyByYear[year].length, 0);
console.log(
  `generate-data: ${companies.length} companies, ${years.length} years, ${rows} financial rows -> public/data/registar.json`,
);
