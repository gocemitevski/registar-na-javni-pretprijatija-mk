export const formatOdsDate = (date, lang) => {
  if (!date) return null;
  return new Intl.DateTimeFormat(lang, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};
