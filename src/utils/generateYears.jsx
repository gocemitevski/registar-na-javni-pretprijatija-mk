// A helper function to generate a list of years for the dropdown
export const generateYears = (startYear = 2020) => {
  const endYear = new Date().getFullYear();
  const years = [];
  for (let i = endYear; i >= startYear; i--) {
    years.push(i);
  }
  return years;
};
