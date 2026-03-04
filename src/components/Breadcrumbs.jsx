import { Link, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

function Breadcrumbs() {
  const location = useLocation();
  const { pretprijatija, loading } = useData();

  const isCompanyPage = location.pathname.startsWith("/company/");
  const companySlug = isCompanyPage
    ? decodeURIComponent(location.pathname.split("/company/")[1])
    : null;

  if (!isCompanyPage || loading) {
    return null;
  }

  const currentCompany = pretprijatija.find(
    (el) => cleanName(transliterate(el.Назив)) === companySlug,
  );

  const companyName = currentCompany?.Назив || companySlug || "...";

  return (
    <div className="bg-light">
      <div className="container py-2">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <Link to="/">Почетна</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {companyName || "..."}
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}

export default Breadcrumbs;
