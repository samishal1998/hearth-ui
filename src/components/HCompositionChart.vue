<script setup lang="ts">
import { computed, useId } from "vue";
import type { ChartSlice } from "../themes";
import { proportions, countLimit, bounded, formatAmount } from "../visual-data";
const props = withDefaults(
  defineProps<{
    items: ChartSlice[];
    label: string;
    mode: "waffle" | "donut";
    selected?: string;
    unit?: string;
    cells?: number;
    columns?: number;
    size?: number;
    thickness?: number;
  }>(),
  {
    items: () => [],
    unit: "",
    cells: 100,
    columns: 10,
    size: 160,
    thickness: 18,
  },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId();
const slices = computed(() => proportions(props.items.slice(0, 100)));
const total = computed(() =>
  slices.value.reduce((sum, item) => sum + item.value, 0),
);
const units = computed(() => {
  const count = countLimit(props.cells, 100, 400);
  const allocations = slices.value.map((item, index) => ({
    index,
    count: Math.floor(item.share * count),
    remainder: (item.share * count) % 1,
  }));
  let remaining =
    count - allocations.reduce((sum, item) => sum + item.count, 0);
  for (const item of [...allocations].sort(
    (a, b) => b.remainder - a.remainder || a.index - b.index,
  )) {
    if (remaining <= 0 || !slices.value[item.index].share) break;
    item.count++;
    remaining--;
  }
  return allocations.flatMap((item) =>
    Array.from({ length: item.count }, () => slices.value[item.index]),
  );
});
const gradient = computed(
  () =>
    `conic-gradient(${slices.value
      .filter((item) => item.share > 0)
      .map(
        (item) =>
          `${item.color} ${item.start * 100}% ${(item.start + item.share) * 100}%`,
      )
      .join(",")})`,
);
const size = computed(() => bounded(props.size, 160, 64, 400)),
  thickness = computed(() => bounded(props.thickness, 18, 4, size.value / 2));
</script>
<template>
  <figure
    class="h-data-figure h-composition-chart"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <template v-if="slices.some((item) => item.share > 0)"
      ><div
        v-if="mode === 'waffle'"
        class="h-waffle-grid"
        aria-hidden="true"
        part="plot"
        :style="{
          gridTemplateColumns: `repeat(${countLimit(columns, 10, 40)},minmax(0,1fr))`,
        }"
      >
        <span
          v-for="(item, index) in units"
          :key="index"
          :data-category="item.id"
          :class="{
            selected: selected === item.id,
            dimmed: selected && selected !== item.id,
          }"
          :style="{ background: item.color }"
          part="cell"
        />
      </div>
      <div
        v-else
        class="h-donut-plot"
        aria-hidden="true"
        part="plot"
        :style="{ width: `${size}px` }"
      >
        <div
          class="h-donut-ring"
          :style="{
            background: gradient,
            maskImage: `radial-gradient(farthest-side,transparent calc(100% - min(${thickness}px,45%)),#000 calc(100% - min(${thickness}px,45%) + 1px))`,
          }"
        />
        <strong>{{ formatAmount(total) }}</strong>
      </div>
      <ul class="h-data-legend" aria-label="Categories">
        <li v-for="item in slices" :key="item.id">
          <button
            type="button"
            :aria-pressed="selected === item.id"
            :aria-label="`${item.label}: ${formatAmount(item.value, unit)} (${(item.share * 100).toFixed(1)}%)`"
            @click="emit('select', item.id)"
          >
            <span
              class="h-data-swatch"
              aria-hidden="true"
              :style="{ background: item.color }"
            />{{ item.label }} · {{ (item.share * 100).toFixed(1) }}%
          </button>
        </li>
      </ul>
      <details>
        <summary>View exact amounts</summary>
        <div class="h-data-viewport">
          <table class="h-data-table">
            <thead>
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Amount</th>
                <th scope="col">Share</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in slices" :key="item.id">
                <th scope="row">{{ item.label }}</th>
                <td>{{ formatAmount(item.value, unit) }}</td>
                <td>{{ (item.share * 100).toFixed(2) }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
      <p v-if="mode === 'waffle'" class="h-data-note">
        {{ units.length }} cells, rounded to whole units. Exact amounts are in
        the table.
      </p></template
    >
    <p v-else class="h-data-empty">No positive values to display.</p>
    <p v-if="items.length > 100" class="h-data-note">
      The first 100 categories are shown.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-waffle-grid {
  display: grid;
  gap: 3px;
  width: 100%;
  max-width: 280px;
  margin: 16px auto;
}
.h-waffle-grid > span {
  aspect-ratio: 1;
  border-radius: 2px;
  min-width: 0;
}
.h-waffle-grid > span.selected {
  outline: 1px solid var(--h-text);
  outline-offset: -1px;
}
.h-waffle-grid > span.dimmed {
  opacity: 0.4;
}
.h-donut-plot {
  aspect-ratio: 1;
  position: relative;
  display: grid;
  place-items: center;
  max-width: 100%;
  margin: 16px auto;
}
.h-donut-ring {
  position: absolute;
  inset: 0;
  border-radius: 50%;
}
.h-donut-plot strong {
  max-width: 60%;
  text-align: center;
  overflow-wrap: anywhere;
  font-size: clamp(14px, 3vw, 24px);
  font-variant-numeric: tabular-nums;
}
@media (prefers-reduced-motion: no-preference) {
  .h-waffle-grid > span {
    transition:
      background-color var(--h-motion),
      opacity var(--h-motion);
  }
}
</style>
