<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { WaterfallItem } from "../themes";
import { countLimit, bounded, formatAmount } from "../visual-data";
import { nextCollectionId } from "../primitives";
const props = withDefaults(
  defineProps<{
    items: WaterfallItem[];
    label: string;
    initial?: number;
    unit?: string;
    selected?: string;
    height?: number;
    maxPoints?: number;
  }>(),
  { items: () => [], initial: 0, unit: "", height: 180, maxPoints: 60 },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId(),
  root = ref<HTMLElement>(),
  active = ref(0);
const data = computed(() => {
  const source = props.items.slice(0, countLimit(props.maxPoints, 60, 240));
  const initial = Number.isFinite(props.initial) ? props.initial : 0;
  const peak =
    source.reduce(
      (max, item) =>
        Math.max(max, Number.isFinite(item.value) ? Math.abs(item.value) : 0),
      Math.abs(initial),
    ) || 1;
  let running = initial / peak;
  const items = source.map((item) => {
    const value = Number.isFinite(item.value) ? item.value : 0;
    const start = item.kind === "total" ? 0 : running;
    const end = item.kind === "total" ? value / peak : running + value / peak;
    running = end;
    return { ...item, value, start, end, total: end * peak };
  });
  const min = items.reduce(
      (min, item) => Math.min(min, item.start, item.end),
      0,
    ),
    max = items.reduce((max, item) => Math.max(max, item.start, item.end), 0);
  return { items, min, range: max - min || 1 };
});
const text = (item: (typeof data.value.items)[number]) =>
  `${item.label}: ${item.kind === "total" ? "total" : "change"} ${formatAmount(item.value, props.unit)}, running total ${formatAmount(item.total, props.unit)}`;
function key(event: KeyboardEvent, index: number) {
  const next = nextCollectionId(
    data.value.items,
    data.value.items[index]?.id,
    event.key,
    {
      orientation: "horizontal",
      direction:
        root.value && getComputedStyle(root.value).direction === "rtl"
          ? "rtl"
          : "ltr",
    },
  );
  if (
    next === undefined ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
  )
    return;
  event.preventDefault();
  const i = data.value.items.findIndex((item) => item.id === next);
  active.value = i;
  root.value?.querySelectorAll<HTMLButtonElement>("[part=column]")[i]?.focus();
}
</script>
<template>
  <figure
    ref="root"
    class="h-data-figure h-waterfall-chart"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <div v-if="data.items.length" class="h-data-viewport">
      <div
        class="h-waterfall-bars"
        :style="{
          height: `${bounded(height, 180, 80, 600)}px`,
          gridTemplateColumns: `repeat(${data.items.length},minmax(40px,1fr))`,
        }"
      >
        <button
          v-for="(item, index) in data.items"
          :key="item.id"
          type="button"
          :tabindex="index === Math.min(active, data.items.length - 1) ? 0 : -1"
          :aria-label="text(item)"
          :title="text(item)"
          :aria-pressed="selected === item.id"
          part="column"
          @focus="active = index"
          @pointerenter="active = index"
          @keydown="key($event, index)"
          @click="emit('select', item.id)"
        >
          <span class="h-waterfall-track" aria-hidden="true"
            ><span
              class="h-waterfall-bar"
              part="bar"
              :style="{
                bottom: `${((Math.min(item.start, item.end) - data.min) / data.range) * 100}%`,
                height: `${(Math.abs(item.end - item.start) / data.range) * 100}%`,
                background:
                  item.kind === 'total'
                    ? 'var(--h-info)'
                    : item.value >= 0
                      ? 'var(--h-success)'
                      : 'var(--h-danger)',
                display: item.start === item.end ? 'none' : undefined,
              }" /><span
              v-if="index < data.items.length - 1"
              class="h-waterfall-link"
              :style="{
                bottom: `${((item.end - data.min) / data.range) * 100}%`,
              }" /></span
          ><span class="h-waterfall-label" aria-hidden="true">{{
            item.label
          }}</span>
        </button>
      </div>
    </div>
    <p v-else class="h-data-empty">No changes to display.</p>
    <p v-if="data.items.length" class="h-data-note" aria-hidden="true">
      {{ text(data.items[Math.min(active, data.items.length - 1)]) }}
    </p>
    <details v-if="data.items.length">
      <summary>View running totals</summary>
      <table class="h-data-table">
        <thead>
          <tr>
            <th scope="col">Step</th>
            <th scope="col">Change / total</th>
            <th scope="col">Running total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in data.items" :key="item.id">
            <th scope="row">{{ item.label }}</th>
            <td>
              {{ item.kind === "total" ? "Total: " : ""
              }}{{ formatAmount(item.value, unit) }}
            </td>
            <td>{{ formatAmount(item.total, unit) }}</td>
          </tr>
        </tbody>
      </table>
    </details>
    <p v-if="data.items.length < items.length" class="h-data-note">
      First {{ data.items.length }} of {{ items.length }} steps shown.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-waterfall-bars {
  display: grid;
  gap: 10px;
  margin-top: 16px;
  background: repeating-linear-gradient(
    to top,
    var(--h-border) 0 1px,
    transparent 1px 25%
  );
}
button {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-width: 40px;
  border: 0;
  background: none;
  color: var(--h-muted);
  font: 12px/1.6 var(--h-font);
  padding: 0 4px;
}
.h-waterfall-track {
  position: relative;
  height: calc(100% - 26px);
  display: block;
}
.h-waterfall-bar {
  position: absolute;
  inset-inline: 10%;
  border-radius: 3px;
  display: block;
}
.h-waterfall-link {
  position: absolute;
  inset-inline-start: 90%;
  width: calc(20% + 18px);
  border-top: 1px dashed var(--h-border-strong);
  pointer-events: none;
}
.h-waterfall-label {
  height: 26px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding-top: 4px;
}
button:focus-visible {
  outline-offset: -2px;
}
button[aria-pressed="true"] {
  background: var(--h-accent-subtle);
}
@media (prefers-reduced-motion: no-preference) {
  .h-waterfall-bar {
    transition:
      height 240ms var(--h-ease),
      bottom 240ms var(--h-ease);
  }
}
@media (pointer: coarse) {
  button {
    min-width: 44px;
  }
}
</style>
