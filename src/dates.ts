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
