// Date-only values stay in UTC so calendar arithmetic never crosses DST boundaries.
export function parseDate(value: string): Date | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return;
  const date = new Date(`${value}T00:00:00Z`);
  if (
    Number.isFinite(date.getTime()) &&
    date.getUTCFullYear() > 0 &&
    date.toISOString().slice(0, 10) === value
  )
    return date;
}
export function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}
export function addDays(value: string, days: number): string {
  const date = parseDate(value)!;
  date.setUTCDate(date.getUTCDate() + days);
  return dateString(date);
}
export function addMonths(value: string, months: number): string {
  const date = parseDate(value)!;
  const day = date.getUTCDate();
  date.setUTCDate(1);
  date.setUTCMonth(date.getUTCMonth() + months);
  const last = new Date(date);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  date.setUTCDate(Math.min(day, last.getUTCDate()));
  return dateString(date);
}
export function timeSeconds(value: string): number | undefined {
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(value)) return;
  const [h, m, s = 0] = value.split(":").map(Number);
  if (h! < 24 && m! < 60 && s < 60) return h! * 3600 + m! * 60 + s;
}
export function timeError(
  value: string,
  min?: string,
  max?: string,
  step = 60,
): string {
  if (!value) return "";
  const seconds = timeSeconds(value),
    low = min ? timeSeconds(min) : undefined,
    high = max ? timeSeconds(max) : undefined;
  if (seconds === undefined) return "Enter a valid time (HH:mm or HH:mm:ss).";
  const outside =
    low !== undefined && high !== undefined && low > high
      ? seconds < low && seconds > high
      : (low !== undefined && seconds < low) ||
        (high !== undefined && seconds > high);
  if (outside) return "Choose a time within the allowed range.";
  const increment =
    Number.isFinite(Number(step)) && Number(step) > 0 ? Number(step) : 60;
  if (
    Math.abs(
      (seconds - (low ?? 0)) / increment -
        Math.round((seconds - (low ?? 0)) / increment),
    ) > 1e-8
  )
    return `Choose a time in ${increment}-second increments.`;
  return "";
}
