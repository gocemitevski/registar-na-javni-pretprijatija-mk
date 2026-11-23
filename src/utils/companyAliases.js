// Historical company names mapped to the name used in the current sheets.
// The comparison is built by company name, so without this a rename looks like
// one company closing and another one opening in the same year.
const COMPANY_ALIASES = {
  "ЈРП „Национална Радиотелевизија“ - Скопје":
    "ЈРП „Македонска Радиотелевизија“ - Скопје",
  "АД за стопанисување со деловен простор во државна сопственост":
    "АД за стопанисување со деловен простор во државна сопственост - Скопје",
  "АД „Национални енергетски ресурси“": "АД „Номагас“ - Скопје",
};

export function resolveCompanyName(name) {
  return COMPANY_ALIASES[name] ?? name;
}
