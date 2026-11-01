<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { HeatmapCell, Tone } from "../themes";
import { countLimit, formatAmount, toneColor } from "../visual-data";
const props = withDefaults(
  defineProps<{
    label: string;
    cells: HeatmapCell[];
    unit?: string;
    tone?: Tone;
    min?: number;
    max?: number;
    maxRows?: number;
    maxColumns?: number;
    selected?: string;
  }>(),
  { cells: () => [], unit: "", tone: "accent", maxRows: 32, maxColumns: 64 },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId(),
  root = ref<HTMLElement>(),
  active = ref(0),
  hovered = ref<number>();
const allRows = computed(() => [
    ...new Set(props.cells.map((cell) => cell.row)),
  ]),
  allColumns = computed(() => [
    ...new Set(props.cells.map((cell) => cell.column)),
  ]);
const rows = computed(() =>
    allRows.value.slice(0, countLimit(props.maxRows, 32, 128)),
  ),
  columns = computed(() =>
    allColumns.value.slice(0, countLimit(props.maxColumns, 64, 128)),
  );
const lookup = computed(
  () =>
    new Map(
      props.cells.map((cell) => [
        JSON.stringify([cell.row, cell.column]),
        cell,
      ]),
    ),
);
const matrix = computed(() =>
  rows.value.flatMap((row) =>
    columns.value.map((column) =>
      lookup.value.get(JSON.stringify([row, column])),
    ),
  ),
);
const extent = computed(() => {
  const data = props.cells
    .map((cell) => cell.value)
    .filter(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    );
  return {
    min: Number.isFinite(props.min)
      ? props.min!
      : data.reduce((a, b) => Math.min(a, b), 0),
    max: Number.isFinite(props.max)
      ? props.max!
      : data.reduce((a, b) => Math.max(a, b), 0),
  };
});
const hasValue = (cell: HeatmapCell | undefined) =>
  !!cell && cell.value !== null && Number.isFinite(cell.value);
const text = (cell: HeatmapCell | undefined, row: string, column: string) =>
  `${row}, ${column}: ${hasValue(cell) ? formatAmount(cell!.value!, props.unit) : "No data"}`;
function intensity(cell: HeatmapCell | undefined) {
  if (!hasValue(cell)) return "var(--h-bg)";
  const range = extent.value.max - extent.value.min;
  const fraction =
    range > 0
      ? Math.max(0, Math.min(1, (cell!.value! - extent.value.min) / range))
      : 1;
  return `color-mix(in srgb, ${toneColor(props.tone)} ${10 + fraction * 25}%, var(--h-surface))`;
}
const tabstop = computed(() =>
  Math.max(0, Math.min(matrix.value.length - 1, active.value)),
);
function key(event: KeyboardEvent, index: number) {
  const cols = columns.value.length,
    rtl = root.value && getComputedStyle(root.value).direction === "rtl";
  let next = index;
  if (event.key === "ArrowRight") next += rtl ? -1 : 1;
  else if (event.key === "ArrowLeft") next += rtl ? 1 : -1;
  else if (event.key === "ArrowDown") next += cols;
  else if (event.key === "ArrowUp") next -= cols;
  else if (event.key === "Home")
    next = event.ctrlKey ? 0 : Math.floor(index / cols) * cols;
  else if (event.key === "End")
    next = event.ctrlKey
      ? matrix.value.length - 1
      : Math.floor(index / cols) * cols + cols - 1;
  else return;
  event.preventDefault();
  next = Math.max(0, Math.min(matrix.value.length - 1, next));
  active.value = next;
  root.value?.querySelectorAll<HTMLButtonElement>("td button")[next]?.focus();
}
</script>
<template>
  <figure
    ref="root"
    class="h-data-figure h-heatmap"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <div v-if="rows.length && columns.length" class="h-data-viewport">
      <table class="h-heatmap-table" :aria-label="label">
        <thead>
          <tr>
            <th scope="col">Row</th>
            <th v-for="column in columns" :key="column" scope="col">
              {{ column }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, r) in rows" :key="row">
            <th scope="row">{{ row }}</th>
            <td v-for="(column, c) in columns" :key="column">
              <button
                type="button"
                :tabindex="tabstop === r * columns.length + c ? 0 : -1"
                :aria-label="text(matrix[r * columns.length + c], row, column)"
                :aria-pressed="
                  !!matrix[r * columns.length + c] &&
                  selected === matrix[r * columns.length + c]?.id
                "
                :title="text(matrix[r * columns.length + c], row, column)"
                :style="{
                  background: intensity(matrix[r * columns.length + c]),
                }"
                part="cell"
                @focus="active = r * columns.length + c"
                @pointerenter="hovered = r * columns.length + c"
                @pointerleave="hovered = undefined"
                @keydown="key($event, r * columns.length + c)"
                @click="
                  matrix[r * columns.length + c] &&
                  emit('select', matrix[r * columns.length + c]!.id)
                "
              >
                {{
                  hasValue(matrix[r * columns.length + c])
                    ? formatAmount(matrix[r * columns.length + c]!.value!)
                    : "—"
                }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="h-data-empty">No heatmap data.</p>
    <p
      v-if="rows.length && columns.length"
      class="h-data-note"
      aria-hidden="true"
    >
      {{
        text(
          matrix[hovered ?? active],
          rows[Math.floor((hovered ?? active) / columns.length)] || "",
          columns[(hovered ?? active) % columns.length] || "",
        )
      }}
    </p>
    <p class="h-data-note">
      Low {{ formatAmount(extent.min, unit) }} · High
      {{ formatAmount(extent.max, unit) }} · — No data
    </p>
    <p
      v-if="rows.length < allRows.length || columns.length < allColumns.length"
      class="h-data-note"
    >
      Showing {{ rows.length }} of {{ allRows.length }} rows and
      {{ columns.length }} of {{ allColumns.length }} columns.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-heatmap-table {
  border-collapse: separate;
  border-spacing: 3px;
  font-size: 12px;
  margin-top: 12px;
  table-layout: fixed;
}
th {
  text-align: start;
  font-weight: 500;
  color: var(--h-muted);
  padding: 4px;
  max-width: 120px;
  overflow-wrap: anywhere;
}
td {
  padding: 0;
}
td button {
  min-width: 32px;
  min-height: 32px;
  width: 100%;
  border: 1px solid var(--h-border);
  border-radius: 4px;
  color: var(--h-text);
  font: 12px var(--h-font-mono);
  padding: 4px;
}
td button[aria-pressed="true"] {
  outline: 2px solid var(--h-accent-text);
  outline-offset: -2px;
}
@media (pointer: coarse) {
  td button {
    min-width: 44px;
    min-height: 44px;
  }
}
</style>
