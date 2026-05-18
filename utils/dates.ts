export function formatDateOnly(value: string | undefined | null) {
  if (!value) return "";

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const isoDateMatch = trimmedValue.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch;
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(trimmedValue);
  if (!Number.isNaN(parsedDate.getTime())) {
    return new Intl.DateTimeFormat("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(parsedDate);
  }

  return trimmedValue;
}
