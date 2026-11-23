import { read, utils } from "xlsx";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { transliterate } from "../src/utils/transliterate.js";
import { cleanName } from "../src/utils/cleanName.js";
import { COMPANY_SHEET_COLUMNS, MONEY_SHEET_COLUMNS } from "../src/utils/columns.js";
import { isValidHttpUrl } from "../src/utils/isValidUrl.js";
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

const interpolate = (template, values) =>
  String(template ?? "").replace(/\{\{(\w+)\}\}/g, (_, key) =>
    String(values[key] ?? ""),
  );

const getFullDescription = (t) => `${t.app.description} ${t.app.ministry}.`;

const formatAmount = (value, lang) =>
  `${new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 }).format(
    (value ?? 0) * 1000000,
  )} ${lang === "mk" ? "ден." : "MKD"}`;

function buildNavLinks(t, lang) {
  return [
    { label: t.nav.home, href: `${SITE_URL}/${lang}/` },
    { label: t.nav.registry, href: `${SITE_URL}/${lang}/registry/` },
    { label: t.nav.compare, href: `${SITE_URL}/${lang}/compare/` },
    { label: t.nav.about, href: `${SITE_URL}/${lang}/about/` },
  ];
}

function buildNoscript({ title, description, links = [], extra = "" }) {
  const linkItems = links
    .map(
      (link) =>
        `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`,
    )
    .join("");

  return `<div class="container my-5">
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  ${extra}
  ${
    linkItems
      ? `<nav><ul class="list-unstyled">${linkItems}</ul></nav>`
      : ""
  }
</div>`;
}

function renderShell(baseHtml, {
  title,
  description,
  canonical,
  ogImage,
  jsonLd,
  lang,
  pathWithoutLang,
  noscript,
}) {
  let html = baseHtml;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safeOgImage = escapeHtml(ogImage);

  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"`);
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

  // Keep the generated head idempotent when the script is re-run against a
  // shell that already contains these tags.
  html = html.replace(/<link rel="alternate"[^>]*>\s*/g, "");
  html = html.replace(/<meta property="og:locale[^>]*>\s*/g, "");

  const mkUrl = `${SITE_URL}/mk/${pathWithoutLang}`;
  const enUrl = `${SITE_URL}/en/${pathWithoutLang}`;
  const headExtras = [
    `<link rel="alternate" hreflang="mk" href="${escapeHtml(mkUrl)}" />`,
    `<link rel="alternate" hreflang="en" href="${escapeHtml(enUrl)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${escapeHtml(mkUrl)}" />`,
    `<meta property="og:locale" content="${lang === "en" ? "en_US" : "mk_MK"}" />`,
    `<meta property="og:locale:alternate" content="${lang === "en" ? "mk_MK" : "en_US"}" />`,
  ];

  if (jsonLd) {
    const jsonString = JSON.stringify(jsonLd).replace(/</g, "\\u003c");
    headExtras.push(`<script type="application/ld+json">${jsonString}</script>`);
  }

  html = html.replace("</head>", `${headExtras.join("\n")}\n</head>`);

  if (noscript) {
    html = html.replace(
      /(<div id="root"[^>]*><\/div>)/,
      (match) => `${match}\n<noscript>${noscript}</noscript>`,
    );
  }

  return html;
}

const routes = [];
const mkT = resources.mk.translation;

routes.push({
  path: "",
  canonical: `${SITE_URL}/mk/`,
  title: `${mkT.titles.home} - ${mkT.app.title_short}`,
  description: getFullDescription(mkT),
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: mkT.app.title,
    url: `${SITE_URL}/mk/`,
  },
});

LANGS.forEach((lang) => {
  const t = resources[lang].translation;
  const titleShort = t.app.title_short;

  routes.push({
    path: `${lang}/`,
    title: `${t.titles.home} - ${titleShort}`,
    description: getFullDescription(t),
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: t.app.title,
      url: `${SITE_URL}/${lang}/`,
    },
  });

  const companyList = companies
    .map((company) => {
      const slug = cleanName(transliterate(company[COMPANY_SHEET_COLUMNS.NAME]));
      if (!slug) return "";
      return `<li><a href="${SITE_URL}/${lang}/company/${slug}/">${escapeHtml(
        getLocalName(company, lang),
      )}</a></li>`;
    })
    .filter(Boolean)
    .join("");

  routes.push({
    path: `${lang}/registry/`,
    title: `${t.titles.registry} - ${titleShort}`,
    description: getFullDescription(t),
    noscript: buildNoscript({
      title: `${t.titles.registry} - ${titleShort}`,
      description: getFullDescription(t),
      links: buildNavLinks(t, lang),
      extra: `<h2>${escapeHtml(t.nav.registry)}</h2><ul class="list-unstyled">${companyList}</ul>`,
    }),
  });

  routes.push({
    path: `${lang}/compare/`,
    title: `${t.titles.compare} - ${titleShort}`,
    description: t.compare.description,
  });

  routes.push({
    path: `${lang}/about/`,
    title: `${t.titles.about} - ${titleShort}`,
    description: getFullDescription(t),
  });

  FILTERS.forEach((filter) => {
    routes.push({
      path: `${lang}/filtered/${filter}/`,
      title: `${t.titles[filter]} - ${titleShort}`,
      description: getFullDescription(t),
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
      description: localDesc || getFullDescription(t),
      jsonLd,
      noscript: buildNoscript({
        title: localName,
        description: localDesc || getFullDescription(t),
        links: buildNavLinks(t, lang),
        extra: `${
          isValidHttpUrl(company[COMPANY_SHEET_COLUMNS.WEBSITE])
            ? `<p><a href="${escapeHtml(company[COMPANY_SHEET_COLUMNS.WEBSITE])}">${escapeHtml(
                interpolate(t.company.website, { name: localName }),
              )}</a></p>`
            : ""
        }${
          financials
            ? `<h2>${escapeHtml(
                interpolate(t.summary.quickFacts, {
                  year: financials.year,
                }),
              )}</h2>
  <ul class="list-unstyled">
    <li><strong>${escapeHtml(t.cards.income)}:</strong> ${formatAmount(financials.income, lang)}</li>
    <li><strong>${escapeHtml(t.cards.expenses)}:</strong> ${formatAmount(financials.expenses, lang)}</li>
    <li><strong>${escapeHtml(t.cards["financial-result"])}:</strong> ${formatAmount(financials.financialResult, lang)}</li>
  </ul>`
            : ""
        }`,
      }),
    });
  });
});

const baseHtml = readFileSync(join(projectRoot, "dist/index.html"), "utf8");

let count = 0;
routes.forEach((route) => {
  const lang = route.path.startsWith("en/") ? "en" : "mk";
  const pathWithoutLang = route.path.replace(/^(mk|en)\/?/, "");
  const canonical = route.canonical ?? `${SITE_URL}/${route.path}`;
  const ogLang = route.path.split("/")[0] || "mk";
  const ogImage = `${SITE_URL}/registar-javni-pretprijatija-trgovski-drustva-r-s-makedonija-${ogLang}-1200x675.webp`;
  const t = resources[lang].translation;
  const noscript =
    route.noscript ??
    buildNoscript({
      title: route.title,
      description: route.description,
      links: buildNavLinks(t, lang),
    });
  const html = renderShell(baseHtml, {
    title: route.title,
    description: route.description,
    canonical,
    ogImage,
    jsonLd: route.jsonLd,
    lang,
    pathWithoutLang,
    noscript,
  });
  const filePath = join(projectRoot, "dist", route.path, "index.html");
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, html);
  count += 1;
});

console.log(`Generated ${count} static pages`);
