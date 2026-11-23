import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { resources } from "../src/i18n/resources.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

// eslint-disable-next-line no-undef
const SITE_URL = (process.env.VITE_SITE_URL || "https://pretprijatija.gocemitevski.com").replace(/\/$/, "");
const t = resources.mk.translation;

let html = readFileSync(join(projectRoot, "dist/index.html"), "utf8");
html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "");
html = html.replace(/<link rel="alternate"[^>]*>\s*/g, "");
html = html.replace(
  "</head>",
  '<meta name="robots" content="noindex">\n</head>',
);
html = html.replace(
  /<noscript>[\s\S]*?<\/noscript>/,
  `<noscript><div class="container my-5">
  <h1>${t.notFound.title}</h1>
  <p>${t.notFound.description} <a href="${SITE_URL}/mk/">${t.notFound.home}</a></p>
</div></noscript>`,
);

writeFileSync(join(projectRoot, "dist/404.html"), html);
console.log("Generated dist/404.html");

