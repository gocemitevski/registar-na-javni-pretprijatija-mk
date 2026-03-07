import { Link, useLocation } from "react-router-dom";
import { useData } from "../hooks/useData";
import { transliterate } from "../utils/transliterate";
import { cleanName } from "../utils/cleanName";

function Breadcrumbs() {
  const location = useLocation();
  const { pretprijatija, loading } = useData();

  const isCompanyPage = location.pathname.startsWith("/company/");
  const isFilteredPage = location.pathname.startsWith("/filtered/");

  const pathParts = location.pathname.split("/").filter(Boolean);

  const isFilteredPageWithFilter = isFilteredPage && pathParts[1];
  const filter = pathParts[1];
  const year = pathParts[2];
  const quarter = pathParts[3];

  const companySlug = isCompanyPage
    ? decodeURIComponent(location.pathname.split("/company/")[1])
    : null;

  if (!isCompanyPage && !isFilteredPageWithFilter) {
    return null;
  }

  if (isFilteredPageWithFilter && loading) {
    return null;
  }

  if (isCompanyPage && loading) {
    return null;
  }

  const filterTitles = {
    "positive-result": "Оствариле позитивен финансиски резултат",
    "income": "Оствариле приход",
    "earned-more": "Заработиле повеќе од што потрошиле",
    "negative-result": "Оствариле негативен финансиски резултат",
    "no-income": "Не оствариле приход",
    "spent-more": "Потрошиле повеќе од што заработиле",
  };

  if (isFilteredPageWithFilter) {
    const filterTitle = filterTitles[filter] || filter;
    const sectionTitle = quarter
      ? `Брзи факти за квартал ${quarter} на ${year || "2024"}`
      : `Брзи факти за ${year || "2024"}`;

    return (
      <div className="bg-body-tertiary">
        <div className="container py-2">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <Link to="/">Почетна</Link>
              </li>
              <li className="breadcrumb-item">
                <Link to={`/${year || "2024"}${quarter ? `/${quarter}` : ""}`}>{sectionTitle}</Link>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                {filterTitle}
              </li>
            </ol>
          </nav>
        </div>
      </div>
    );
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
            <li className="breadcrumb-item">
              <Link to="/registry">Регистар</Link>
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
