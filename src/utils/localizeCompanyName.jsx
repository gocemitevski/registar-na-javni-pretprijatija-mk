export function getLocalizedCompanyName(company, lang) {
  if (lang === "en" && company?.Title) {
    return company.Title;
  }
  return company?.Назив;
}

export function getLocalizedCompanyDescription(company, lang) {
  if (lang === "en" && company?.Description) {
    return company.Description;
  }
  return company?.Опис;
}
