import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { read, utils } from "xlsx";
import { file } from "../utils/file";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

function Breadcrumbs() {
  const location = useLocation();
  const [pretprijatija, setPretprijatija] = useState([]);

  const isCompanyPage = location.pathname.startsWith("/company/");
  const companySlug = isCompanyPage ? location.pathname.split("/company/")[1] : null;

  useEffect(() => {
    if (pretprijatija.length > 0) return;
    (async () => {
      try {
        const f = await fetch(`/ods/${file}`);
        if (!f.ok) throw new Error(`Failed to fetch: ${f.status}`);
        const ab = await f.arrayBuffer();
        const wb = read(ab);
        setPretprijatija(
          utils.sheet_to_json(wb.Sheets["Претпријатија"], {
            blankrows: false,
          }),
        );
      } catch (err) {
        console.error("Breadcrumbs: Error loading data:", err);
      }
    })();
  }, [pretprijatija.length]);

  if (!isCompanyPage) {
    return null;
  }

  const currentCompany = pretprijatija.find(
    (el) => cleanName(transliterate(el.Назив)) === companySlug,
  );

  const companyName = currentCompany?.Назив || companySlug || "...";

  return (
    <div className="container">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/">Почетна</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {companyName || "..."}
          </li>
        </ol>
      </nav>
    </div>
  );
}

export default Breadcrumbs;
