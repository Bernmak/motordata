export const normalizeText = (text: string) =>
  text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const matchesText = (value: string, filter: string) => {
  const cleanFilter = normalizeText(filter);
  return cleanFilter === "" || normalizeText(value) === cleanFilter;
};

export const matchesYear = (year: number, filter: string) => {
  const cleanFilter = filter.trim();
  return cleanFilter === "" || year.toString() === cleanFilter;
};