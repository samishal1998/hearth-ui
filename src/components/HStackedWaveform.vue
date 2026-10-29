<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  useId,
  nextTick,
  onMounted,
  onBeforeUnmount,
} from "vue";
import { useFloating } from "../floating";
import type { StackedWaveformColumn } from "../themes";
const props = withDefaults(
  defineProps<{
    columns: StackedWaveformColumn[];
    label: string;
    description?: string;
    selected?: string;
    height?: number;
    barWidth?: number;
    columnGap?: number;
    segmentGap?: number;
    maxPoints?: number;
    unit?: string;
  }>(),
  {
    columns: () => [],
    height: 96,
    barWidth: 8,
    columnGap: 3,
    segmentGap: 0.5,
    maxPoints: 128,
    unit: "",
  },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId(),
  plot = ref<HTMLElement>(),
  control = ref<HTMLInputElement>(),
  anchor = ref<HTMLElement>(),
  tooltip = ref<HTMLElement>();
const focused = ref(false),
  localId = ref(props.selected),
  hovered = ref<number>(),
  dismissed = ref(false),
  tipHovered = ref(false);
const bounded = (value: number, fallback: number, low: number, high: number) =>
  Math.max(low, Math.min(high, Number.isFinite(value) ? value : fallback));
const plotHeight = computed(() => bounded(props.height, 96, 44, 320));
const barWidth = computed(() => bounded(props.barWidth, 8, 2, 12));
const columnGap = computed(() => bounded(props.columnGap, 3, 0, 8));
const segmentGap = computed(() => bounded(props.segmentGap, 0.5, 0, 0.9));
const count = computed(() => Math.floor(bounded(props.maxPoints, 128, 1, 128)));
const source = computed(() =>
  props.columns.slice(-count.value).map((column) => ({
    ...column,
    segments: column.segments.map((segment) => ({
      ...segment,
      value:
        Number.isFinite(segment.value) && segment.value > 0 ? segment.value : 0,
    })),
  })),
);
// Normalize before summing, so even very large finite inputs retain their ratios.
const peak = computed(
  () =>
    source.value.reduce(
      (maximum, column) =>
        column.segments.reduce(
          (largest, segment) => Math.max(largest, segment.value),
          maximum,
        ),
      0,
    ) || 1,
);
const scaledTotals = computed(() =>
  source.value.map((column) =>
    column.segments.reduce(
      (total, segment) => total + segment.value / peak.value,
      0,
    ),
  ),
);
const maximum = computed(() => Math.max(0, ...scaledTotals.value) || 1);
const columns = computed(() =>
  source.value.map((column, index) => {
    const scaled = scaledTotals.value[index],
      total = scaled * peak.value;
    const height = (scaled / maximum.value) * plotHeight.value;
    const visible = column.segments.filter((segment) => segment.value > 0);
    const gaps = Math.max(0, visible.length - 1);
    const gap = gaps ? Math.min(segmentGap.value, height / (gaps * 2)) : 0;
    const fill = Math.max(0, height - gaps * gap);
    return { ...column, height, gap, total, scaled, fill };
  }),
);
const current = computed(() =>
  Math.max(
    0,
    columns.value.findIndex((column) => column.id === localId.value),
  ),
);
const activeIndex = computed(
  () => hovered.value ?? (focused.value ? current.value : undefined),
);
const active = computed(() =>
  activeIndex.value === undefined
    ? undefined
    : columns.value[activeIndex.value],
);
const showTip = computed(() => !!active.value && !dismissed.value);
const floating = useFloating(anchor, tooltip, showTip, () => "top");
const formatter = new Intl.NumberFormat("en", { maximumFractionDigits: 3 });
const amount = (value: number) =>
  `${Number.isFinite(value) ? formatter.format(value) : "Above numeric range"}${props.unit ? ` ${props.unit}` : ""}`;
const name = (column: (typeof columns.value)[number]) =>
  `${column.label}: total ${amount(column.total)}; ${column.segments.map((segment) => `${segment.label} ${amount(segment.value)}`).join(", ")}`;
const color = (
  segment: (typeof columns.value)[number]["segments"][number],
  index: number,
) =>
  segment.color ||
  (segment.tone
    ? `var(--h-${segment.tone === "neutral" ? "muted" : segment.tone})`
    : `var(--h-chart-${(index % 5) + 1})`);
let leaveTimer: ReturnType<typeof setTimeout> | undefined;
function hover(event: PointerEvent) {
  if (event.pointerType === "touch" || event.buttons || !plot.value) return;
  const pillars = plot.value.querySelectorAll<HTMLElement>("[part=pillar]");
  if (!pillars.length) return;
  const first = pillars[0].getBoundingClientRect(),
    last = pillars[pillars.length - 1].getBoundingClientRect();
  const start = first.x + first.width / 2,
    end = last.x + last.width / 2;
  hovered.value =
    end === start
      ? 0
      : Math.max(
          0,
          Math.min(
            pillars.length - 1,
            Math.round(
              ((event.clientX - start) / (end - start)) * (pillars.length - 1),
            ),
          ),
        );
  dismissed.value = false;
  clearTimeout(leaveTimer);
}
function leave() {
  clearTimeout(leaveTimer);
  leaveTimer = setTimeout(() => {
    if (!tipHovered.value) hovered.value = undefined;
  }, 100);
}
function hold() {
  tipHovered.value = true;
  clearTimeout(leaveTimer);
}
function inspect(event: Event) {
  const index = (event.target as HTMLInputElement).valueAsNumber;
  localId.value = columns.value[index]?.id;
  hovered.value = undefined;
  dismissed.value = false;
}
function select(event: Event) {
  inspect(event);
  if (localId.value !== undefined) emit("select", localId.value);
}
function escape(event: KeyboardEvent) {
  if (event.key === "Escape" && showTip.value) dismissed.value = true;
}
watch(
  () => props.selected,
  (value) => {
    if (value !== undefined) localId.value = value;
  },
);
watch(columns, (values) => {
  if (!values.some((column) => column.id === localId.value))
    localId.value = values[0]?.id;
  if (hovered.value !== undefined && hovered.value >= values.length)
    hovered.value = undefined;
});
watch(
  [showTip, active],
  async () => {
    await nextTick();
    anchor.value =
      activeIndex.value === undefined
        ? undefined
        : plot.value?.querySelectorAll<HTMLElement>("[part=pillar]")[
            activeIndex.value
          ];
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
</script>
<template>
  <figure
    class="h-stacked-waveform"
    part="base"
    :aria-labelledby="`${id}-label`"
    :aria-describedby="description ? `${id}-description` : undefined"
  >
    <figcaption :id="`${id}-label`" part="title">{{ label }}</figcaption>
    <p
      v-if="description"
      :id="`${id}-description`"
      class="h-stacked-wave-description"
    >
      {{ description }}
    </p>
    <div v-if="columns.length" class="h-stacked-wave-stage">
      <div
        ref="plot"
        class="h-stacked-wave-plot"
        :class="{ single: columns.length === 1 }"
        part="plot"
        :style="{
          height: `${plotHeight}px`,
          maxWidth: `${Math.max(44, columns.length * barWidth + Math.max(0, columns.length - 1) * columnGap)}px`,
          gap: `min(${columnGap}px, ${100 / (columns.length * 4)}%)`,
          '--h-stacked-wave-width': `${barWidth}px`,
          '--h-stacked-wave-height': `${plotHeight}px`,
        }"
        @pointermove="hover"
        @pointerleave="leave"
      >
        <div
          v-for="(column, index) in columns"
          :key="column.id"
          class="h-stacked-wave-pillar"
          :class="{
            active: activeIndex === index && !dismissed,
            selected: selected === column.id,
          }"
          :data-column-id="column.id"
          part="pillar"
          aria-hidden="true"
          :style="{ height: `${column.height}px`, gap: `${column.gap}px` }"
        >
          <span
            v-for="(segment, segmentIndex) in column.segments"
            :key="segment.id"
            class="h-stacked-wave-segment"
            :data-segment-id="segment.id"
            part="segment"
            :style="{
              height: `${column.scaled ? (segment.value / peak / column.scaled) * column.fill : 0}px`,
              background: color(segment, segmentIndex),
              display: segment.value > 0 ? undefined : 'none',
            }"
          />
        </div>
        <input
          ref="control"
          class="h-stacked-wave-control"
          part="control"
          type="range"
          min="0"
          :max="columns.length - 1"
          step="1"
          :value="current"
          :aria-label="`Inspect ${label}`"
          :aria-valuetext="columns[current] ? name(columns[current]) : ''"
          :aria-describedby="`${id}-hint`"
          @input="inspect"
          @change="select"
          @focus="
            focused = true;
            dismissed = false;
          "
          @blur="focused = false"
          @pointerdown="hovered = undefined"
        />
      </div>
    </div>
    <p v-else class="h-stacked-wave-empty" part="empty">
      No amounts to display.
    </p>
    <p v-if="columns.length" :id="`${id}-hint`" class="h-stacked-wave-hint">
      Hover or drag to inspect. Arrow keys move between pillars.
    </p>
    <div
      ref="tooltip"
      class="h-stacked-wave-tooltip"
      part="tooltip"
      popover="manual"
      aria-hidden="true"
      @pointerenter="hold"
      @pointerleave="
        tipHovered = false;
        leave();
      "
    >
      {{ active ? name(active) : "" }}
    </div>
    <p v-if="columns.length < props.columns.length" class="h-stacked-wave-hint">
      Showing the latest {{ columns.length }} of
      {{ props.columns.length }} pillars.
    </p>
    <details v-if="columns.length" class="h-stacked-wave-data" part="data">
      <summary>View data table</summary>
      <div
        class="h-stacked-wave-scroll"
        tabindex="0"
        role="region"
        :aria-label="`${label} data table`"
      >
        <table>
          <caption class="h-sr-only">
            {{
              label
            }}
            amounts, in top-to-bottom segment order
          </caption>
          <thead>
            <tr>
              <th scope="col">Pillar / segment</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody v-for="column in columns" :key="column.id">
            <tr class="h-stacked-wave-total">
              <th scope="row">{{ column.label }} total</th>
              <td>{{ amount(column.total) }}</td>
            </tr>
            <tr v-for="(segment, index) in column.segments" :key="segment.id">
              <th scope="row">
                {{ column.label }} · {{ index + 1 }}. {{ segment.label }}
              </th>
              <td>{{ amount(segment.value) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
.h-stacked-waveform {
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
.h-stacked-wave-description,
.h-stacked-wave-hint {
  color: var(--h-muted);
  font-size: max(var(--h-font-min-size, 12px), 12px);
  margin: 6px 0 12px;
}
.h-stacked-wave-stage {
  display: flex;
  justify-content: center;
  padding-block: 16px;
}
.h-stacked-wave-plot {
  position: relative;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: var(--h-radius-control);
}
.h-stacked-wave-plot.single {
  justify-content: center;
}
.h-stacked-wave-pillar {
  display: flex;
  flex-direction: column;
  flex: 1;
  max-width: var(--h-stacked-wave-width);
  min-width: 0;
  border-radius: 3px;
  overflow: hidden;
  pointer-events: none;
}
.h-stacked-wave-segment {
  display: block;
  flex-shrink: 0;
  width: 100%;
  border-radius: 1px;
}
.h-stacked-wave-pillar.active {
  outline: 1px solid var(--h-text);
  outline-offset: 2px;
}
.h-stacked-wave-pillar.selected {
  box-shadow:
    0 0 0 2px var(--h-bg),
    0 0 0 3px var(--h-accent-text);
}
.h-stacked-wave-control {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 44px;
  opacity: 0;
  padding: 0;
  margin: 0;
  appearance: none;
  cursor: crosshair;
  background: transparent;
  touch-action: pan-y;
}
.h-stacked-wave-control::-webkit-slider-runnable-track {
  height: 100%;
  background: transparent;
}
.h-stacked-wave-control::-webkit-slider-thumb {
  appearance: none;
  width: var(--h-stacked-wave-width);
  height: var(--h-stacked-wave-height);
  background: transparent;
  border: 0;
}
.h-stacked-wave-control::-moz-range-thumb {
  width: var(--h-stacked-wave-width);
  height: var(--h-stacked-wave-height);
  background: transparent;
  border: 0;
}
.h-stacked-wave-control:focus-visible {
  outline: none;
}
.h-stacked-wave-plot:has(input:focus-visible) {
  outline: var(--h-focus-width, 2px) solid var(--h-focus);
  outline-offset: 4px;
}
.h-stacked-wave-tooltip {
  position: fixed;
  inset: auto;
  margin: 0;
  max-width: min(360px, calc(100vw - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 10px 12px;
  border: 1px solid var(--h-border-strong);
  border-radius: var(--h-radius-control);
  background: var(--h-raised);
  color: var(--h-text);
  box-shadow: var(--h-shadow);
  font: 12px/1.7 var(--h-font-mono);
  overflow-wrap: anywhere;
}
.h-stacked-wave-empty {
  padding: 24px;
  margin-top: 12px;
  border: 1px dashed var(--h-border);
  border-radius: var(--h-radius-control);
  color: var(--h-muted);
}
summary {
  min-height: var(--h-control-height);
  cursor: pointer;
  color: var(--h-accent-text);
}
.h-stacked-wave-scroll {
  max-width: 100%;
  overflow: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-variant-numeric: tabular-nums;
}
th,
td {
  text-align: start;
  padding: 8px;
  border-bottom: 1px solid var(--h-border);
  overflow-wrap: anywhere;
}
tbody th {
  font-weight: 400;
}
.h-stacked-wave-total th,
.h-stacked-wave-total td {
  background: var(--h-raised);
  font-weight: 600;
}
@media (prefers-reduced-motion: no-preference) {
  .h-stacked-wave-pillar,
  .h-stacked-wave-segment {
    transition: height 240ms var(--h-ease);
  }
}
@media (forced-colors: active) {
  .h-stacked-wave-segment {
    background: Highlight !important;
  }
  .h-stacked-wave-plot:has(input:focus-visible) {
    outline-color: Highlight;
  }
}
</style>
