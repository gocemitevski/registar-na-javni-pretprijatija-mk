import { copyFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

copyFileSync(join(projectRoot, "dist/index.html"), join(projectRoot, "dist/404.html"));
console.log("Generated dist/404.html");
