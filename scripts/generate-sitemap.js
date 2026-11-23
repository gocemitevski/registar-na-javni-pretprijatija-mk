import { read, utils } from "xlsx";
import { writeFileSync, readFileSync } from "fs";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { transliterate } from "../src/utils/transliterate.js";
import { cleanName } from "../src/utils/cleanName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// eslint-disable-next-line no-undef
const BASE_URL = (process.env.VITE_SITE_URL || "https://pretprijatija.gocemitevski.com").replace(/\/$/, "");

const odsPath = join(
  projectRoot,
  "public/ods/registar-javni-pretprijatija-r-s-makedonija.ods",
);

function getOdsDate() {
  try {
    const metaContent = execSync(`unzip -p "${odsPath}" meta.xml`, {
      encoding: "utf8",
      stdio: "pipe",
    });
    const match = metaContent.match(/<dc:date>([^<]+)<\/dc:date>/);
    if (match) return new Date(match[1]).toISOString().slice(0, 10);
  } catch (error) {
    console.warn("Could not read ODS modification date:", error.message);
  }
  return new Date().toISOString().slice(0, 10);
}

const lastmod = getOdsDate();

const odsBuffer = readFileSync(odsPath);
const wb = read(odsBuffer);
const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], {
  blankrows: false,
});

const filters = [
  "positive-result",
  "negative-result",
  "income",
  "no-income",
  "earned-more",
  "spent-more",
];

const staticRoutes = [
  { path: "/mk/", priority: "1.0" },
  { path: "/en/", priority: "1.0" },
  { path: "/mk/registry/", priority: "0.8" },
  { path: "/en/registry/", priority: "0.8" },
  { path: "/mk/compare/", priority: "0.8" },
  { path: "/en/compare/", priority: "0.8" },
  { path: "/mk/about/", priority: "0.5" },
  { path: "/en/about/", priority: "0.5" },
  ...filters.flatMap((filter) => [
    { path: `/mk/filtered/${filter}/`, priority: "0.9" },
    { path: `/en/filtered/${filter}/`, priority: "0.9" },
  ]),
];

const companyRoutes = companies.flatMap((company) => {
  const name = cleanName(transliterate(company["Назив"]));
  if (!name) return [];
  return [
    { path: `/mk/company/${name}/`, priority: "0.7" },
    { path: `/en/company/${name}/`, priority: "0.7" },
  ];
});

const allRoutes = [...staticRoutes, ...companyRoutes].map((route) => {
  const pathWithoutLang = route.path.replace(/^\/(mk|en)\/?/, "");
  return {
    ...route,
    mkHref: `${BASE_URL}/mk/${pathWithoutLang}`,
    enHref: `${BASE_URL}/en/${pathWithoutLang}`,
  };
});

const changefreq = (priority) =>
  priority === "1.0" ? "weekly" : priority >= "0.7" ? "weekly" : "monthly";

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${allRoutes
  .map(
    (route) => `<url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq(route.priority)}</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="mk" href="${route.mkHref}" />
    <xhtml:link rel="alternate" hreflang="en" href="${route.enHref}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${route.mkHref}" />
  </url>`,
  )
  .join("\n")}
</urlset>`;

writeFileSync(join(projectRoot, "public/sitemap.xml"), sitemap);

console.log(`Generated sitemap with ${allRoutes.length} routes`);
