import { COMPANY_SHEET_COLUMNS } from "./columns";
import { transliterate } from "./transliterate";

export function getLocalizedCompanyName(company, lang) {
  if (lang === "en" && company?.[COMPANY_SHEET_COLUMNS.NAME_EN]) {
    return company[COMPANY_SHEET_COLUMNS.NAME_EN];
  }
  return company?.[COMPANY_SHEET_COLUMNS.NAME];
}

export function getLocalizedCompanyDescription(company, lang) {
  if (lang === "en" && company?.[COMPANY_SHEET_COLUMNS.DESCRIPTION_EN]) {
    return company[COMPANY_SHEET_COLUMNS.DESCRIPTION_EN];
  }
  return company?.[COMPANY_SHEET_COLUMNS.DESCRIPTION];
}

export function getLocalizedDirectorName(director, lang) {
  if (lang === "en" && director) {
    return transliterate(director);
  }
  return director;
}
