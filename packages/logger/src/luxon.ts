import type { DateTime } from "luxon";

export function parseIso(dateTime: DateTime) {
  const val = dateTime.toISO();
  if (!val) {
    return dateTime.toJSDate().toISOString();
  }
  return val;
}
