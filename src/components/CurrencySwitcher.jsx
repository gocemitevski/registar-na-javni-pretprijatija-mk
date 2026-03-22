import { CURRENCIES } from "../utils/currencies";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useUrlParams } from "../hooks/useUrlParams";

export default function CurrencySwitcher() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedCurrency } = useUrlParams([], []);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    const params = new URLSearchParams(location.search);
    if (newCurrency === "MKD") {
      params.delete("currency");
    } else {
      params.set("currency", newCurrency);
    }
    const newSearch = params.toString();
    const basePath = location.pathname;
    navigate(`${basePath}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
      preventScrollReset: true
    });
  };

  return (
    <div className="form-floating">
      <select
        value={selectedCurrency}
        className="form-select"
        id="currency"
        onChange={handleCurrencyChange}
      >
        {Object.keys(CURRENCIES).map((code) => (
          <option key={code} value={code}>
            {CURRENCIES[code].symbol} ({code})
          </option>
        ))}
      </select>
      <label htmlFor="currency">{t("nav.currency")}</label>
    </div>
  );
}
