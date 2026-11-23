import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

let html = readFileSync(join(projectRoot, "dist/index.html"), "utf8");
html = html.replace(/<link rel="canonical"[^>]*>\s*/g, "");
html = html.replace(/<link rel="alternate"[^>]*>\s*/g, "");
html = html.replace(
  "</head>",
  '<meta name="robots" content="noindex">\n</head>',
);

writeFileSync(join(projectRoot, "dist/404.html"), html);
console.log("Generated dist/404.html");
