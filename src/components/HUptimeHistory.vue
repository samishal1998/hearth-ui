<script setup lang="ts">
import { computed, ref, useId } from "vue";
import type { UptimeInterval, UptimeStatus } from "../themes";
import { intervalDomain, formatAmount, countLimit } from "../visual-data";
const props = withDefaults(
  defineProps<{
    label: string;
    intervals: UptimeInterval[];
    unit?: string;
    maxIntervals?: number;
    selected?: string;
  }>(),
  { intervals: () => [], unit: "ms", maxIntervals: 240 },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId(),
  local = ref("");
const items = computed(() =>
  props.intervals
    .filter(
      (item) =>
        Number.isFinite(item.start) &&
        Number.isFinite(item.end) &&
        Number.isFinite(item.end - item.start) &&
        item.end > item.start,
    )
    .sort((a, b) => a.start - b.start)
    .slice(-countLimit(props.maxIntervals, 240, 1000)),
);
const domain = computed(() => intervalDomain(items.value));
const current = computed(
  () =>
    items.value.find((item) => item.id === (props.selected ?? local.value)) ||
    items.value[0],
);
const colors: Record<UptimeStatus, string> = {
  up: "var(--h-success)",
  degraded: "var(--h-warning)",
  down: "var(--h-danger)",
  unknown: "var(--h-muted)",
};
const overlaps = computed(() => {
  let end = -Infinity;
  for (const item of items.value) {
    if (item.start < end) return true;
    end = item.end;
  }
  return false;
});
const stats = computed(() => {
  const duration = (status: UptimeStatus) =>
    items.value
      .filter((item) => item.status === status)
      .reduce(
        (sum, item) => sum + (item.end - item.start) / domain.value.range,
        0,
      );
  const known = duration("up") + duration("down") + duration("degraded");
  return {
    up: known ? (duration("up") / known) * 100 : undefined,
    unknown: Math.max(0, 1 - known) * 100,
  };
});
const text = (item: UptimeInterval) =>
  `${item.label}: ${item.status}, ${formatAmount(item.end - item.start, props.unit)}`;
</script>
<template>
  <figure
    class="h-data-figure h-uptime-history"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <div
      v-if="items.length"
      class="h-uptime-strip"
      part="strip"
      aria-hidden="true"
    >
      <span
        v-for="item in items"
        :key="item.id"
        :title="text(item)"
        :class="{ selected: current?.id === item.id }"
        :style="{
          insetInlineStart: `${((item.start - domain.start) / domain.range) * 100}%`,
          width: `${((item.end - item.start) / domain.range) * 100}%`,
          background: colors[item.status],
        }"
      />
    </div>
    <p v-else class="h-data-empty">No uptime history.</p>
    <p v-if="overlaps" class="h-data-note">
      Intervals overlap; availability cannot be calculated reliably.
    </p>
    <p v-else-if="items.length" class="h-data-note">
      {{
        stats.up === undefined
          ? "No known status"
          : `${stats.up.toFixed(2)}% up during recorded time`
      }}
      · {{ stats.unknown.toFixed(1) }}% unknown coverage
    </p>
    <template v-if="items.length"
      ><label :for="`${id}-inspect`" class="h-sr-only"
        >Inspect {{ label }}</label
      ><select
        :id="`${id}-inspect`"
        :value="current?.id"
        part="control"
        @change="
          local = ($event.target as HTMLSelectElement).value;
          emit('select', local);
        "
      >
        <option v-for="item in items" :key="item.id" :value="item.id">
          {{ text(item) }}
        </option>
      </select>
      <details>
        <summary>View interval data</summary>
        <div
          class="h-data-viewport"
          tabindex="0"
          role="region"
          :aria-label="`${label} intervals`"
        >
          <table class="h-data-table">
            <thead>
              <tr>
                <th scope="col">Interval</th>
                <th scope="col">Start</th>
                <th scope="col">End</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in items" :key="item.id">
                <th scope="row">{{ item.label }}</th>
                <td>{{ formatAmount(item.start, unit) }}</td>
                <td>{{ formatAmount(item.end, unit) }}</td>
                <td>{{ item.status }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details></template
    >
    <p v-if="items.length < intervals.length" class="h-data-note">
      {{ items.length }} of {{ intervals.length }} intervals shown; invalid or
      earlier intervals omitted.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-uptime-strip {
  position: relative;
  height: 28px;
  background: var(--h-border);
  border-radius: 5px;
  overflow: hidden;
  margin-top: 16px;
}
.h-uptime-strip span {
  position: absolute;
  inset-block: 0;
  border-inline-end: 1px solid var(--h-bg);
  min-width: 0;
}
.h-uptime-strip span.selected {
  box-shadow: inset 0 0 0 2px var(--h-text);
}
select {
  max-width: 100%;
  width: 100%;
  margin-bottom: 12px;
  min-height: var(--h-field-height);
  padding: var(--h-field-padding-y) var(--h-input-padding-x);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-text);
  font: inherit;
}
</style>
