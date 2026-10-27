// Dates are written in UTC, so the server writes the same day for every
// visitor and the text never depends on where it was rendered. Local time
// would need the date formatted again in the browser. The year is always
// written, since leaving out the current one would make the text depend on
// when it was rendered.
const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const longDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

// "14 Aug 2026"
export function formatShortDate(date: Date) {
  return shortDate.format(date);
}

// "14 August 2026"
export function formatLongDate(date: Date) {
  return longDate.format(date);
}
