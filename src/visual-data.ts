import type { ChartSlice, RunStatus, Tone } from "./themes";

export const bounded = (
  value: number | undefined,
  fallback: number,
  min: number,
  max: number,
) => Math.max(min, Math.min(max, Number.isFinite(value) ? value! : fallback));
export const countLimit = (
  value: number | undefined,
  fallback: number,
  max: number,
) => Math.floor(bounded(value, fallback, 1, max));
export const positive = (value: number) =>
  Number.isFinite(value) && value > 0 ? value : 0;
export function relativePosition(value: number, min: number, max: number) {
  const scale = Math.max(Math.abs(min), Math.abs(max), Math.abs(value)) || 1;
  const low = min / scale,
    range = max / scale - low;
  return range > 0
    ? Math.max(0, Math.min(1, (value / scale - low) / range))
    : 0.5;
}
const formatter = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });
export const formatAmount = (value: number, unit = "") =>
  `${Number.isFinite(value) ? formatter.format(value) : "—"}${unit ? ` ${unit}` : ""}`;
export const toneColor = (tone?: Tone, index = 0) =>
  tone
    ? `var(--h-${tone === "neutral" ? "muted" : tone})`
    : `var(--h-chart-${(index % 5) + 1})`;
export const statusTone = (status?: RunStatus): Tone =>
  status === "success"
    ? "success"
    : status === "error"
      ? "danger"
      : status === "running"
        ? "info"
        : "neutral";
export function proportions(items: ChartSlice[]) {
  const peak =
    items.reduce((max, item) => Math.max(max, positive(item.value)), 0) || 1;
  const sum = items.reduce(
    (total, item) => total + positive(item.value) / peak,
    0,
  );
  let start = 0;
  return items.map((item, index) => {
    const share = sum ? positive(item.value) / peak / sum : 0;
    const result = {
      ...item,
      value: positive(item.value),
      share,
      start,
      color: toneColor(item.tone, index),
    };
    start += share;
    return result;
  });
}
export function intervalDomain(items: { start: number; end: number }[]) {
  const start = items.reduce(
    (min, item) => Math.min(min, item.start),
    Infinity,
  );
  const end = items.reduce((max, item) => Math.max(max, item.end), -Infinity);
  return {
    start: Number.isFinite(start) ? start : 0,
    end: Number.isFinite(end) ? end : 1,
    range: Number.isFinite(end - start) && end > start ? end - start : 1,
  };
}
