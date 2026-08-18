import { read, utils } from "xlsx";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { transliterate } from "../src/utils/transliterate.js";
import { cleanName } from "../src/utils/cleanName.js";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../src/utils/columns.js";
import { resources } from "../src/i18n/resources.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// eslint-disable-next-line no-undef
const SITE_URL = process.env.VITE_SITE_URL || "https://pretprijatija.gocemitevski.com";

const LANGS = ["mk", "en"];
const FILTERS = [
  "positive-result",
  "negative-result",
  "income",
  "no-income",
  "earned-more",
  "spent-more",
];

const odsPath = join(projectRoot, "public/ods/registar-javni-pretprijatija-r-s-makedonija.ods");

const odsBuffer = readFileSync(odsPath);
const wb = read(odsBuffer);
const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], { blankrows: false });

const moneyByYear = {};
wb.SheetNames.filter((_, index) => index > 0).forEach((year) => {
  moneyByYear[year] = utils.sheet_to_json(wb.Sheets[year], { blankrows: false });
});

const getLocalName = (row, lang) =>
  lang === "en" && row[COMPANY_SHEET_COLUMNS.NAME_EN]
    ? row[COMPANY_SHEET_COLUMNS.NAME_EN]
    : row[COMPANY_SHEET_COLUMNS.NAME];

const getLocalDesc = (row, lang) =>
  lang === "en" && row[COMPANY_SHEET_COLUMNS.DESCRIPTION_EN]
    ? row[COMPANY_SHEET_COLUMNS.DESCRIPTION_EN]
    : row[COMPANY_SHEET_COLUMNS.DESCRIPTION];

const toNumber = (value) => {
  const num = parseFloat(String(value ?? "").replace(",", "."));
  return Number.isFinite(num) ? num : 0;
};

function getLatestYearFinancials(companyName) {
  const years = Object.keys(moneyByYear).sort().reverse();
  for (const year of years) {
    const rows = (moneyByYear[year] || []).filter(
      (item) => item[MONEY_SHEET_COLUMNS.NAME] === companyName,
    );
    if (!rows.length) continue;

    const annualRow = rows.find(
      (item) => Number(item[MONEY_SHEET_COLUMNS.QUARTER]) === 0,
    );
    if (annualRow) {
      return {
        year,
        income: toNumber(annualRow[MONEY_SHEET_COLUMNS.INCOME]),
        expenses: toNumber(annualRow[MONEY_SHEET_COLUMNS.EXPENSES]),
        financialResult: toNumber(annualRow[MONEY_SHEET_COLUMNS.FINANCIAL_RESULT]),
      };
    }

    const sum = (key) => rows.reduce((acc, item) => acc + toNumber(item[key]), 0);
    return {
      year,
      income: sum(MONEY_SHEET_COLUMNS.INCOME),
      expenses: sum(MONEY_SHEET_COLUMNS.EXPENSES),
      financialResult: sum(MONEY_SHEET_COLUMNS.FINANCIAL_RESULT),
    };
  }
  return null;
}

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

function renderShell(baseHtml, { title, description, canonical, ogImage, jsonLd }) {
  let html = baseHtml;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safeOgImage = escapeHtml(ogImage);

  html = html.replace(/<title>.*?<\/title>/, `<title>${safeTitle}</title>`);
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${safeCanonical}$2`);
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${safeDescription}$2`);
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${safeTitle}$2`);
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${safeDescription}$2`);
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${safeCanonical}$2`);
  html = html.replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${safeOgImage}$2`);
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${safeTitle}$2`);
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${safeDescription}$2`);
  html = html.replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${safeOgImage}$2`);

  if (jsonLd) {
    const jsonString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
    html = html.replace(
      "</head>",
      `<script type="application/ld+json">${jsonString}</script>\n</head>`,
    );
  }

  return html;
}

const routes = [];

LANGS.forEach((lang) => {
  const t = resources[lang].translation;
  const titleShort = t.app.title_short;

  routes.push({
    path: `${lang}/`,
    title: `${t.titles.home} - ${titleShort}`,
    description: t.app.description,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t.app.title,
      url: `${SITE_URL}/${lang}/`,
    },
  });

  routes.push({
    path: `${lang}/registry/`,
    title: `${t.titles.registry} - ${titleShort}`,
    description: t.app.description,
  });

  routes.push({
    path: `${lang}/about/`,
    title: `${t.titles.about} - ${titleShort}`,
    description: t.app.description,
  });

  FILTERS.forEach((filter) => {
    routes.push({
      path: `${lang}/filtered/${filter}/`,
      title: `${t.titles[filter]} - ${titleShort}`,
      description: t.app.description,
    });
  });
});

companies.forEach((company) => {
  const slug = cleanName(transliterate(company[COMPANY_SHEET_COLUMNS.NAME]));
  if (!slug) return;

  LANGS.forEach((lang) => {
    const t = resources[lang].translation;
    const localName = getLocalName(company, lang);
    const localDesc = getLocalDesc(company, lang);
    const financials = getLatestYearFinancials(company[COMPANY_SHEET_COLUMNS.NAME]);

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: localName,
      url: `${SITE_URL}/${lang}/company/${slug}/`,
    };
    if (localDesc) {
      jsonLd.description = localDesc;
    }
    if (financials) {
      jsonLd.additionalProperty = [
        { "@type": "PropertyValue", name: t.cards.income, value: String(financials.income ?? "") },
        { "@type": "PropertyValue", name: t.cards.expenses, value: String(financials.expenses ?? "") },
        { "@type": "PropertyValue", name: t.cards["financial-result"], value: String(financials.financialResult ?? "") },
      ];
    }

    routes.push({
      path: `${lang}/company/${slug}/`,
      title: localName,
      description: localDesc || t.app.description,
      jsonLd,
    });
  });
});

const baseHtml = readFileSync(join(projectRoot, "dist/index.html"), "utf8");

let count = 0;
routes.forEach((route) => {
  const canonical = `${SITE_URL}/${route.path}`;
  const ogImage = `${SITE_URL}/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${route.path.split("/")[0]}-1200x675.webp`;
  const html = renderShell(baseHtml, {
    title: route.title,
    description: route.description,
    canonical,
    ogImage,
    jsonLd: route.jsonLd,
  });
  const filePath = join(projectRoot, "dist", route.path, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
  count += 1;
});

console.log(`Generated ${count} static pages`);
