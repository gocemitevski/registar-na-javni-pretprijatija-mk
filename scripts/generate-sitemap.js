import { read, utils } from "xlsx";
import { writeFileSync, readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { transliterate } from "../src/utils/transliterate.js";
import { cleanName } from "../src/utils/cleanName.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// eslint-disable-next-line no-undef
const BASE_URL = process.env.VITE_SITE_URL || "https://gocemitevski.github.io/registar-na-javni-pretprijatija-mk/#/";

const odsPath = join(projectRoot, "public/ods/registar-javni-pretprijatija-r-s-makedonija.ods");

const odsBuffer = readFileSync(odsPath);
const wb = read(odsBuffer);
const companies = utils.sheet_to_json(wb.Sheets["Претпријатија"], { blankrows: false });

const filters = [
  "positive-result",
  "negative-result",
  "income",
  "no-income",
  "earned-more",
  "spent-more",
];

const staticRoutes = [
  { path: "/mk", priority: "1.0" },
  { path: "/en", priority: "1.0" },
  { path: "/mk/registry", priority: "0.8" },
  { path: "/en/registry", priority: "0.8" },
  { path: "/mk/about", priority: "0.5" },
  { path: "/en/about", priority: "0.5" },
  ...filters.flatMap((filter) => [
    { path: `/mk/filtered/${filter}`, priority: "0.9" },
    { path: `/en/filtered/${filter}`, priority: "0.9" },
  ]),
];

const companyRoutes = companies.flatMap((company) => {
  const name = cleanName(transliterate(company["Назив"]));
  return [
    { path: `/mk/company/${name}`, priority: "0.7" },
    { path: `/en/company/${name}`, priority: "0.7" },
  ];
});

const allRoutes = [...staticRoutes, ...companyRoutes];

const changefreq = (priority) => (priority === "1.0" ? "weekly" : priority >= "0.7" ? "weekly" : "monthly");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes
  .map(
    (route) => `<url>
    <loc>${BASE_URL}${route.path}</loc>
    <changefreq>${changefreq(route.priority)}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

writeFileSync(join(projectRoot, "public/sitemap.xml"), sitemap);

console.log(`Generated sitemap with ${allRoutes.length} routes`);
