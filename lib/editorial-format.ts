const editorialDateFormatter = new Intl.DateTimeFormat("es-CL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** Formats the date-only value already validated by the editorial catalog. */
export function formatEditorialDate(value: string): string {
  return editorialDateFormatter.format(new Date(`${value}T00:00:00Z`));
}
