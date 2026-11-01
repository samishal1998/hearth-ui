<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import type { TimeSeries, ChartThreshold, ChartMarker } from "../themes";
import {
  bounded,
  countLimit,
  formatAmount,
  toneColor,
  relativePosition,
} from "../visual-data";
const props = withDefaults(
  defineProps<{
    series: TimeSeries[];
    label: string;
    unit?: string;
    mode?: "line" | "area";
    height?: number;
    maxPoints?: number;
    thresholds?: ChartThreshold[];
    markers?: ChartMarker[];
    selected?: number;
    formatX?: (value: number) => string;
  }>(),
  {
    series: () => [],
    unit: "",
    mode: "line",
    height: 200,
    maxPoints: 240,
    thresholds: () => [],
    markers: () => [],
  },
);
const emit = defineEmits<{ select: [x: number] }>();
const id = useId(),
  hidden = ref<string[]>([]),
  local = ref(props.selected),
  hovered = ref<number>();
watch(
  () => props.selected,
  (value) => (local.value = value),
);
const all = computed(() =>
  props.series.slice(0, 8).map((series, index) => ({
    ...series,
    color: toneColor(series.tone, index),
    points: series.points
      .filter((point) => Number.isFinite(point.x))
      .slice(-countLimit(props.maxPoints, 240, 2000))
      .sort((a, b) => a.x - b.x)
      .map((point) => ({
        ...point,
        y: point.y !== null && Number.isFinite(point.y) ? point.y : null,
      })),
  })),
);
const shown = computed(() =>
  all.value.filter((series) => !hidden.value.includes(series.id)),
);
const times = computed(() =>
  [
    ...new Set(
      all.value.flatMap((series) => series.points.map((point) => point.x)),
    ),
  ].sort((a, b) => a - b),
);
const tableTimes = computed(() => times.value.slice(-200));
const samples = computed(
  () =>
    new Map(
      all.value.map((series) => [
        series.id,
        new Map(series.points.map((point) => [point.x, point])),
      ]),
    ),
);
const labels = computed(
  () =>
    new Map(
      all.value.flatMap((series) =>
        series.points
          .filter((point) => point.label)
          .map((point) => [point.x, point.label!] as const),
      ),
    ),
);
const thresholds = computed(() =>
    props.thresholds.filter((item) => Number.isFinite(item.value)).slice(0, 20),
  ),
  markers = computed(() =>
    props.markers.filter((item) => Number.isFinite(item.x)).slice(0, 20),
  );
const domain = computed(() => {
  const xs = [...times.value, ...markers.value.map((marker) => marker.x)],
    ys = shown.value
      .flatMap((series) =>
        series.points.flatMap((point) => (point.y === null ? [] : [point.y])),
      )
      .concat(thresholds.value.map((item) => item.value));
  const xmin = xs.reduce((a, b) => Math.min(a, b), Infinity),
    xmax = xs.reduce((a, b) => Math.max(a, b), -Infinity);
  const ymin = ys.reduce((a, b) => Math.min(a, b), 0),
    ymax = ys.reduce((a, b) => Math.max(a, b), 0);
  return {
    xmin: Number.isFinite(xmin) ? xmin : 0,
    xmax: Number.isFinite(xmax) ? xmax : 1,
    xrange: Number.isFinite(xmax - xmin) && xmax > xmin ? xmax - xmin : 1,
    ymin,
    ymax: ymax === ymin ? ymin + 1 : ymax,
    yrange: Number.isFinite(ymax - ymin) && ymax > ymin ? ymax - ymin : 1,
  };
});
const x = (value: number) =>
    relativePosition(value, domain.value.xmin, domain.value.xmax) * 100,
  y = (value: number) =>
    100 - relativePosition(value, domain.value.ymin, domain.value.ymax) * 100;
function path(points: (typeof all.value)[number]["points"], area = false) {
  const groups: (typeof points)[] = [];
  let group: typeof points = [];
  for (const point of points) {
    if (point.y === null) {
      if (group.length) groups.push(group);
      group = [];
    } else group.push(point);
  }
  if (group.length) groups.push(group);
  return groups
    .map((group) => {
      const line = group
        .map(
          (point, index) => `${index ? "L" : "M"}${x(point.x)},${y(point.y!)}`,
        )
        .join(" ");
      return area
        ? `${line} L${x(group.at(-1)!.x)},${y(0)} L${x(group[0].x)},${y(0)} Z`
        : line +
            (group.length === 1 ? ` L${x(group[0].x)},${y(group[0].y!)}` : "");
    })
    .join(" ");
}
function nearest(value: number) {
  let low = 0,
    high = times.value.length - 1;
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (times.value[mid] < value) low = mid + 1;
    else high = mid;
  }
  const before = Math.max(0, low - 1);
  return Math.abs(times.value[before] - value) <=
    Math.abs(times.value[low] - value)
    ? times.value[before]
    : times.value[low];
}
const active = computed(() =>
  times.value.length
    ? nearest(hovered.value ?? local.value ?? times.value[0])
    : undefined,
);
const labelFor = (time: number) =>
  props.formatX?.(time) ?? labels.value.get(time) ?? formatAmount(time);
const readout = computed(() =>
  active.value === undefined
    ? "No samples."
    : `${labelFor(active.value)}: ${
        shown.value
          .map((series) => {
            const point = samples.value.get(series.id)?.get(active.value!);
            return `${series.label} ${point?.y === null || point?.y === undefined ? "No sample" : formatAmount(point.y, props.unit)}`;
          })
          .join(", ") || "No visible series"
      }`,
);
function input(event: Event) {
  hovered.value = undefined;
  local.value = nearest((event.target as HTMLInputElement).valueAsNumber);
}
function change(event: Event) {
  input(event);
  if (local.value !== undefined) emit("select", local.value);
}
function key(event: KeyboardEvent) {
  if (
    !times.value.length ||
    ![
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ].includes(event.key)
  )
    return;
  event.preventDefault();
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  const index = times.value.indexOf(active.value!),
    delta =
      event.key === "ArrowRight"
        ? rtl
          ? -1
          : 1
        : event.key === "ArrowLeft"
          ? rtl
            ? 1
            : -1
          : event.key === "ArrowUp"
            ? 1
            : -1;
  const next =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? times.value.length - 1
        : Math.max(0, Math.min(times.value.length - 1, index + delta));
  hovered.value = undefined;
  local.value = times.value[next];
  emit("select", local.value);
}
function hover(event: PointerEvent) {
  if (event.pointerType === "touch" || event.buttons) return;
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  const fraction = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left) / rect.width),
  );
  const position = rtl ? 1 - fraction : fraction;
  hovered.value = nearest(
    domain.value.xmin * (1 - position) + domain.value.xmax * position,
  );
}
function toggle(seriesId: string) {
  hidden.value = hidden.value.includes(seriesId)
    ? hidden.value.filter((value) => value !== seriesId)
    : [...hidden.value, seriesId];
}
</script>
<template>
  <figure
    class="h-time-series h-data-figure"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <template v-if="times.length"
      ><div class="h-series-frame">
        <div class="h-series-axis" aria-hidden="true">
          <span>{{ formatAmount(domain.ymax, unit) }}</span
          ><span>{{
            formatAmount(domain.ymax / 2 + domain.ymin / 2, unit)
          }}</span
          ><span>{{ formatAmount(domain.ymin, unit) }}</span>
        </div>
        <div
          class="h-series-plot"
          :style="{ height: `${bounded(height, 200, 80, 500)}px` }"
          part="plot"
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              v-for="line in [0, 25, 50, 75, 100]"
              :key="line"
              :d="`M0,${line} H100`"
              class="h-series-grid"
            />
            <template v-for="series in shown" :key="series.id">
              <path
                v-if="mode === 'area'"
                :d="path(series.points, true)"
                :fill="series.color"
                fill-opacity="0.12"
              />
              <path
                :d="path(series.points)"
                fill="none"
                :stroke="series.color"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                vector-effect="non-scaling-stroke"
                part="series"
                :data-series="series.id"
              />
            </template>
            <path
              v-for="item in thresholds"
              :key="item.label"
              :d="`M0,${y(item.value)} H100`"
              :stroke="toneColor(item.tone)"
              fill="none"
              stroke-width="1"
              stroke-dasharray="4 3"
              vector-effect="non-scaling-stroke"
              part="threshold"
            />
            <path
              v-for="item in markers"
              :key="item.label"
              :d="`M${x(item.x)},0 V100`"
              stroke="var(--h-muted)"
              fill="none"
              stroke-width="1"
              stroke-dasharray="3 3"
              vector-effect="non-scaling-stroke"
              part="marker"
            />
            <path
              v-if="active !== undefined"
              :d="`M${x(active)},0 V100`"
              stroke="var(--h-text)"
              opacity="0.4"
              stroke-width="1"
              vector-effect="non-scaling-stroke"
            /></svg
          ><input
            type="range"
            :min="domain.xmin"
            :max="domain.xmax"
            step="any"
            :value="active"
            :aria-label="`Inspect ${label}`"
            :aria-valuetext="readout"
            part="control"
            @input="input"
            @change="change"
            @keydown="key"
            @pointermove="hover"
            @pointerleave="hovered = undefined"
          />
        </div>
      </div>
      <div class="h-series-x" aria-hidden="true">
        <span>{{ labelFor(domain.xmin) }}</span
        ><span>{{ labelFor(domain.xmax) }}</span>
      </div>
      <p class="h-data-note" aria-hidden="true">{{ readout }}</p>
      <ul class="h-data-legend" aria-label="Series visibility">
        <li v-for="series in all" :key="series.id">
          <button
            type="button"
            :aria-pressed="!hidden.includes(series.id)"
            @click="toggle(series.id)"
          >
            <span
              class="h-data-swatch"
              :style="{ background: series.color }"
              aria-hidden="true"
            />{{ series.label }}
          </button>
        </li>
      </ul>
      <p v-for="item in thresholds" :key="item.label" class="h-data-note">
        Threshold — {{ item.label }}: {{ formatAmount(item.value, unit) }}
      </p>
      <p v-for="item in markers" :key="item.label" class="h-data-note">
        Marker — {{ item.label }}: {{ labelFor(item.x) }}
      </p>
      <details>
        <summary>View sample data</summary>
        <div
          class="h-data-viewport"
          tabindex="0"
          role="region"
          :aria-label="`${label} sample table`"
        >
          <table class="h-data-table">
            <thead>
              <tr>
                <th scope="col">Position</th>
                <th v-for="series in shown" :key="series.id" scope="col">
                  {{ series.label }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="time in tableTimes" :key="time">
                <th scope="row">{{ labelFor(time) }}</th>
                <td v-for="series in shown" :key="series.id">
                  {{
                    samples.get(series.id)?.get(time)?.y == null
                      ? "—"
                      : formatAmount(
                          samples.get(series.id)!.get(time)!.y!,
                          unit,
                        )
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="tableTimes.length < times.length" class="h-data-note">
          The table shows the latest 200 positions; the plot and inspector cover
          all displayed samples.
        </p>
      </details></template
    >
    <p v-else class="h-data-empty">No time-series samples.</p>
    <p
      v-if="
        series.length > 8 ||
        series.some(
          (item) => item.points.length > countLimit(maxPoints, 240, 2000),
        )
      "
      class="h-data-note"
    >
      Up to eight series and the latest
      {{ countLimit(maxPoints, 240, 2000) }} samples per series are shown.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-series-frame {
  display: grid;
  grid-template-columns: minmax(40px, auto) minmax(0, 1fr);
  gap: 10px;
  margin-top: 16px;
}
.h-series-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  text-align: end;
  font: 12px/1.5 var(--h-font-mono);
  color: var(--h-muted);
  max-width: 100px;
  overflow-wrap: anywhere;
}
.h-series-plot {
  position: relative;
  min-width: 0;
}
.h-series-plot svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.h-series-grid {
  stroke: var(--h-border);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  fill: none;
}
.h-series-plot input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: crosshair;
  touch-action: pan-y;
}
.h-series-plot:has(input:focus-visible) {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-series-x {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 8px;
  font: 12px/1.5 var(--h-font-mono);
  color: var(--h-muted);
}
.h-series-x span {
  overflow-wrap: anywhere;
}
.h-series-plot:dir(rtl) svg {
  transform: scaleX(-1);
}
</style>
