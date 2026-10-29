<script setup lang="ts">
import {
  computed,
  ref,
  useId,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useFloating } from "../floating";
import { nextCollectionId } from "../primitives";
import type { ChartColumn, ChartSeries, Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    columns: ChartColumn[];
    series: ChartSeries[];
    label: string;
    description?: string;
    percentage?: boolean;
    diverging?: boolean;
    barWidth?: number;
    negativeTone?: Tone;
    unit?: string;
    selected?: string;
    height?: number;
    maxPoints?: number;
  }>(),
  { unit: "", height: 180, maxPoints: 60, barWidth: 6, negativeTone: "info" },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId(),
  root = ref<HTMLElement>(),
  focused = ref<string>(),
  hovered = ref<string>(),
  dismissed = ref(false);
const count = computed(() =>
  Math.max(1, Math.min(240, Math.floor(props.maxPoints) || 60)),
);
const series = computed(() => props.series.slice(0, 8));
const number = (value: number) =>
  Number.isFinite(value) ? (props.diverging ? value : Math.max(0, value)) : 0;
const plotHeight = computed(() =>
  Math.max(
    64,
    Math.min(600, Number.isFinite(props.height) ? props.height : 180),
  ),
);
const barWidth = computed(() =>
  Math.max(
    2,
    Math.min(12, Number.isFinite(props.barWidth) ? props.barWidth : 6),
  ),
);
const columns = computed(() =>
  props.columns.slice(-count.value).map((column) => ({
    ...column,
    values: series.value.map((s) => number(column.values?.[s.id])),
  })),
);
const maximum = computed(() =>
  Math.max(1, ...columns.value.flatMap((column) => column.values)),
);
const largestTotal = computed(() =>
  Math.max(
    1,
    ...columns.value.map((column) =>
      column.values.reduce((sum, value) => sum + value / maximum.value, 0),
    ),
  ),
);
const active = computed(() =>
  columns.value.find(
    (column) => column.id === (hovered.value ?? focused.value),
  ),
);
const tooltip = ref<HTMLElement>(),
  anchor = ref<HTMLElement>();
const tipHovered = ref(false);
const showTip = computed(() => !!active.value && !dismissed.value);
const floating = useFloating(anchor, tooltip, showTip, () => "top");
let leaveTimer: ReturnType<typeof setTimeout> | undefined;
function enter(columnId: string, event: Event, focus = false) {
  clearTimeout(leaveTimer);
  dismissed.value = false;
  anchor.value = event.currentTarget as HTMLElement;
  if (focus) focused.value = columnId;
  else hovered.value = columnId;
}
function leave() {
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => {
    if (!tipHovered.value) hovered.value = undefined;
  }, 100);
}
function holdTooltip() {
  tipHovered.value = true;
  clearTimeout(leaveTimer);
}
function escape(event: KeyboardEvent) {
  if (event.key === "Escape" && showTip.value) dismissed.value = true;
}
watch(
  [showTip, active],
  async () => {
    await nextTick();
    if (showTip.value) {
      tooltip.value?.showPopover();
      floating.position();
    } else tooltip.value?.hidePopover();
  },
  { flush: "post" },
);
onMounted(() => document.addEventListener("keydown", escape));
onBeforeUnmount(() => {
  clearTimeout(leaveTimer);
  document.removeEventListener("keydown", escape);
});
const format = (value: number) =>
  `${new Intl.NumberFormat("en", { maximumFractionDigits: 2, signDisplay: props.diverging ? "exceptZero" : "auto" }).format(value)}${props.diverging ? "%" : props.unit ? ` ${props.unit}` : ""}`;
function percent(column: (typeof columns.value)[number], value: number) {
  if (props.diverging) return Math.min(100, Math.abs(value)) / 2;
  const total = column.values.reduce(
    (sum, item) => sum + item / maximum.value,
    0,
  );
  return props.percentage
    ? total
      ? (value / maximum.value / total) * 100
      : 0
    : (value / maximum.value / largestTotal.value) * 100;
}
function name(column: (typeof columns.value)[number]) {
  if (props.diverging)
    return `${column.label}: ${format(column.values[0])}${Math.abs(column.values[0]) > 100 ? " (bar capped at ±100%)" : ""}`;
  return `${column.label}: ${series.value.map((s, i) => `${s.label} ${format(column.values[i])}${props.percentage ? ` (${percent(column, column.values[i]).toFixed(1)}%)` : ""}`).join(", ")}`;
}
const color = (index: number) =>
  series.value[index].tone
    ? `var(--h-${series.value[index].tone === "neutral" ? "muted" : series.value[index].tone})`
    : `var(--h-chart-${(index % 5) + 1})`;
const negativeColor = computed(
  () =>
    `var(--h-${props.negativeTone === "neutral" ? "muted" : props.negativeTone})`,
);
const tabStop = computed(() =>
  columns.value.some((c) => c.id === focused.value)
    ? focused.value
    : columns.value[0]?.id,
);
function key(event: KeyboardEvent) {
  if (event.key === "Escape") {
    dismissed.value = true;
    return;
  }
  const next = nextCollectionId(columns.value, focused.value, event.key, {
    orientation: "horizontal",
    direction:
      root.value && getComputedStyle(root.value).direction === "rtl"
        ? "rtl"
        : "ltr",
    wrap: false,
  });
  if (
    next === undefined ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  )
    return;
  event.preventDefault();
  focused.value = next;
  const index = columns.value.findIndex((c) => c.id === next);
  root.value
    ?.querySelectorAll<HTMLButtonElement>(".h-diagram-column")
    [index]?.focus();
}
watch(columns, (values) => {
  if (!values.some((c) => c.id === focused.value)) focused.value = undefined;
});
</script>
<template>
  <figure
    ref="root"
    class="h-bar-diagram"
    :class="{ diverging }"
    :style="{
      '--h-diagram-height': `${plotHeight}px`,
      '--h-diagram-bar-width': `${barWidth}px`,
    }"
    part="base"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="
      [description ? `${id}-description` : '', diverging ? `${id}-scale` : '']
        .filter(Boolean)
        .join(' ') || undefined
    "
  >
    <figcaption :id="`${id}-title`" part="title">{{ label }}</figcaption>
    <p
      v-if="description"
      :id="`${id}-description`"
      class="h-diagram-description"
    >
      {{ description }}
    </p>
    <p v-if="diverging" :id="`${id}-scale`" class="h-sr-only">
      Signed percentages from −100% to +100%, with zero at the center. Values
      outside the scale are capped visually; exact values are available in the
      data table.
    </p>
    <div v-if="columns.length && series.length" class="h-diagram-plot">
      <div
        v-if="diverging"
        class="h-diagram-axis"
        aria-hidden="true"
        part="axis"
      >
        <span>+100%</span><span>0%</span><span>−100%</span>
      </div>
      <div class="h-diagram-scroll" part="viewport">
        <div
          class="h-diagram-bars"
          role="group"
          :aria-label="`${label} data points`"
          :style="{
            height: `${plotHeight}px`,
            '--h-diagram-count': columns.length,
          }"
          @keydown="key"
        >
          <button
            v-for="column in columns"
            :key="column.id"
            type="button"
            class="h-diagram-column"
            :aria-label="name(column)"
            :aria-pressed="selected === column.id"
            :tabindex="tabStop === column.id ? 0 : -1"
            part="column"
            @click="emit('select', column.id)"
            @focus="enter(column.id, $event, true)"
            @blur="focused = undefined"
            @pointerenter="enter(column.id, $event)"
            @pointerleave="leave"
          >
            <span class="h-diagram-stack" aria-hidden="true"
              ><span
                v-for="(value, index) in column.values"
                :key="series[index].id"
                class="h-diagram-segment"
                :class="{ negative: diverging && value < 0 }"
                part="segment"
                :style="{
                  height: `${percent(column, value)}%`,
                  background:
                    diverging && value < 0 ? negativeColor : color(index),
                  display: value !== 0 ? undefined : 'none',
                  top: diverging
                    ? `${value > 0 ? 50 - percent(column, value) : 50}%`
                    : undefined,
                }"
            /></span>
            <span
              v-if="!diverging"
              class="h-diagram-label"
              aria-hidden="true"
              >{{ column.label }}</span
            >
          </button>
        </div>
      </div>
    </div>
    <p v-else class="h-diagram-empty" part="empty">No data to display.</p>
    <div
      ref="tooltip"
      popover="manual"
      class="h-diagram-tooltip"
      part="tooltip"
      aria-hidden="true"
      @pointerenter="holdTooltip"
      @pointerleave="
        tipHovered = false;
        leave();
      "
    >
      {{ active ? name(active) : "" }}
    </div>
    <p class="h-diagram-readout">
      Hover or focus a bar to inspect. Use arrow keys to move between points.
    </p>
    <ul
      v-if="series.length > 1"
      class="h-diagram-legend"
      aria-label="Series"
      part="legend"
    >
      <li v-for="(item, index) in series" :key="item.id">
        <span aria-hidden="true" :style="{ background: color(index) }" />{{
          item.label
        }}
      </li>
    </ul>
    <ul
      v-else-if="diverging && series.length"
      class="h-diagram-legend"
      aria-label="Direction"
      part="legend"
    >
      <li>
        <span aria-hidden="true" :style="{ background: color(0) }" />Positive
      </li>
      <li>
        <span
          aria-hidden="true"
          :style="{ background: negativeColor }"
        />Negative
      </li>
    </ul>
    <p
      v-if="columns.length < props.columns.length"
      class="h-diagram-description"
    >
      Showing the latest {{ columns.length }} of
      {{ props.columns.length }} points.
    </p>
    <details
      v-if="columns.length && series.length"
      class="h-diagram-data"
      part="data"
    >
      <summary>View data table</summary>
      <div
        class="h-diagram-scroll"
        tabindex="0"
        role="region"
        :aria-label="`${label} data table`"
      >
        <table>
          <caption class="h-sr-only">
            {{
              label
            }}
          </caption>
          <thead>
            <tr>
              <th scope="col">Point</th>
              <th v-for="item in series" :key="item.id" scope="col">
                {{ item.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="column in columns" :key="column.id">
              <th scope="row">{{ column.label }}</th>
              <td v-for="(value, index) in column.values" :key="index">
                {{ format(value)
                }}{{
                  percentage ? ` (${percent(column, value).toFixed(1)}%)` : ""
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
.h-bar-diagram {
  margin: 0;
  min-width: 0;
  max-width: 100%;
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
}
figcaption {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.h-diagram-description {
  color: var(--h-muted);
  font-size: 12px;
  margin: 4px 0 12px;
}
.h-diagram-scroll {
  overflow: auto;
  max-width: 100%;
  overscroll-behavior-inline: contain;
}
.h-diagram-plot {
  min-width: 0;
}
.diverging .h-diagram-plot {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 8px;
}
.h-diagram-axis {
  position: relative;
  height: var(--h-diagram-height);
  margin-top: 16px;
  color: var(--h-muted);
  font: max(var(--h-font-min-size, 12px), 11px)/1.4 var(--h-font-mono);
  text-align: end;
  font-variant-numeric: tabular-nums;
}
.h-diagram-axis span {
  position: absolute;
  inset-inline-end: 0;
}
.h-diagram-axis span:first-child {
  top: 0;
}
.h-diagram-axis span:nth-child(2) {
  top: 50%;
  translate: 0 -50%;
}
.h-diagram-axis span:last-child {
  bottom: 0;
}
.h-diagram-bars {
  display: grid;
  grid-template-columns: repeat(var(--h-diagram-count), minmax(28px, 1fr));
  gap: 6px;
  margin-top: 16px;
  border-bottom: 1px solid var(--h-border);
  background: repeating-linear-gradient(
    to top,
    var(--h-border) 0 1px,
    transparent 1px 25%
  );
}
.h-diagram-column {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: end;
  padding: 0 3px;
  border: 0;
  border-radius: 5px 5px 0 0;
  background: transparent;
  color: var(--h-muted);
  font: inherit;
  min-width: 28px;
}
.h-diagram-stack {
  height: calc(100% - 26px);
  display: flex;
  flex-direction: column-reverse;
  justify-content: flex-start;
  gap: 0;
  pointer-events: none;
}
.h-diagram-segment {
  display: block;
  width: min(100%, 44px);
  margin-inline: auto;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--h-bg) 15%, transparent);
}
.h-diagram-segment:last-child {
  border-radius: 4px 4px 0 0;
}
.h-diagram-label {
  display: block;
  height: 26px;
  padding-top: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 11px;
}
.diverging .h-diagram-bars {
  position: relative;
  gap: 2px;
  border-bottom: 0;
  background: none;
  grid-template-columns: repeat(var(--h-diagram-count), minmax(24px, 1fr));
}
.diverging .h-diagram-bars::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 50%;
  border-top: 1px solid var(--h-border-strong);
  pointer-events: none;
}
.diverging .h-diagram-column {
  min-width: 24px;
  padding: 0;
  border-radius: 4px;
}
.diverging .h-diagram-stack {
  position: relative;
  height: 100%;
  display: block;
}
.diverging .h-diagram-segment {
  position: absolute;
  inset-inline-start: 50%;
  translate: -50% 0;
  width: min(100%, var(--h-diagram-bar-width));
  margin: 0;
  border: 0;
  border-radius: 999px 999px 0 0;
}
.diverging .h-diagram-segment:dir(rtl) {
  translate: 50% 0;
}
.diverging .h-diagram-segment.negative {
  border-radius: 0 0 999px 999px;
}
.h-diagram-column:focus-visible {
  outline-offset: -2px;
}
.h-diagram-column[aria-pressed="true"] {
  background: var(--h-accent-subtle);
  box-shadow: inset 0 -2px var(--h-accent);
}
.h-diagram-readout {
  font: 12px/1.7 var(--h-font-mono);
  min-height: 42px;
  padding: 10px 0;
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.h-diagram-readout[data-visible="true"] {
  color: var(--h-text);
}
.h-diagram-tooltip {
  position: fixed;
  inset: auto;
  margin: 0;
  max-width: min(320px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 10px 12px;
  border: 1px solid var(--h-border-strong);
  border-radius: var(--h-radius-control);
  background: var(--h-raised);
  color: var(--h-text);
  font: 12px/1.7 var(--h-font-mono);
  box-shadow: var(--h-shadow);
  overflow-wrap: anywhere;
}
.h-diagram-legend {
  list-style: none;
  padding: 0;
  margin: 0 0 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.h-diagram-legend li {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  overflow-wrap: anywhere;
}
.h-diagram-legend li > span {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  flex-shrink: 0;
}
summary {
  cursor: pointer;
  min-height: var(--h-control-height);
  color: var(--h-accent-text);
}
table {
  border-collapse: collapse;
  width: 100%;
  font-variant-numeric: tabular-nums;
}
td,
th {
  text-align: start;
  padding: 8px;
  border-bottom: 1px solid var(--h-border);
  overflow-wrap: anywhere;
}
.h-diagram-empty {
  border: 1px dashed var(--h-border);
  padding: 24px;
  margin-top: 12px;
  border-radius: var(--h-radius-control);
  color: var(--h-muted);
}
@media (hover: hover) {
  .h-diagram-column:hover {
    background: var(--h-accent-subtle);
    color: var(--h-text);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .h-diagram-segment {
    transition:
      height 240ms var(--h-ease),
      top 240ms var(--h-ease),
      background-color var(--h-motion);
  }
}
@media (pointer: coarse) {
  .h-diagram-bars,
  .diverging .h-diagram-bars {
    grid-template-columns: repeat(var(--h-diagram-count), minmax(44px, 1fr));
  }
  .h-diagram-column,
  .diverging .h-diagram-column {
    min-width: 44px;
  }
}
@media (forced-colors: active) {
  .h-diagram-segment {
    background: Highlight !important;
    border: 1px solid Canvas;
  }
}
</style>
