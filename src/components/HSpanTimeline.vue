<script setup lang="ts">
import { computed, useId } from "vue";
import type { SpanItem } from "../themes";
import {
  countLimit,
  intervalDomain,
  statusTone,
  toneColor,
  formatAmount,
} from "../visual-data";
const props = withDefaults(
  defineProps<{
    spans: SpanItem[];
    label: string;
    unit?: string;
    selected?: string;
    maxRows?: number;
    maxHeight?: string;
  }>(),
  { spans: () => [], unit: "ms", maxRows: 200, maxHeight: "420px" },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId();
const items = computed(() =>
  props.spans
    .filter(
      (span) =>
        Number.isFinite(span.start) &&
        Number.isFinite(span.end) &&
        Number.isFinite(span.end - span.start) &&
        span.end >= span.start,
    )
    .slice(0, countLimit(props.maxRows, 200, 1000)),
);
const domain = computed(() => intervalDomain(items.value));
const parents = computed(
  () => new Map(items.value.map((item) => [item.id, item])),
);
function depth(item: SpanItem) {
  let count = 0,
    parent = item.parentId;
  const visited = new Set([item.id]);
  while (parent && !visited.has(parent) && count < 8) {
    visited.add(parent);
    const node = parents.value.get(parent);
    if (!node) break;
    count++;
    parent = node.parentId;
  }
  return count;
}
</script>
<template>
  <figure
    class="h-span-timeline h-data-figure"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <p v-if="items.length" class="h-data-note">
      {{ formatAmount(domain.start, unit) }} →
      {{ formatAmount(domain.end, unit) }}
    </p>
    <div
      v-if="items.length"
      class="h-data-viewport"
      :style="{ maxHeight }"
      tabindex="0"
      role="region"
      :aria-label="`${label} timing rows`"
    >
      <table class="h-data-table">
        <thead>
          <tr>
            <th scope="col">Span</th>
            <th scope="col">Start / duration</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <th
              scope="row"
              :style="{ paddingInlineStart: `${8 + depth(item) * 12}px` }"
            >
              {{ item.label }}
            </th>
            <td>
              <button
                type="button"
                class="h-span-track"
                :aria-pressed="selected === item.id"
                :aria-label="`${item.label}: starts ${formatAmount(item.start, unit)}, duration ${formatAmount(item.end - item.start, unit)}, ${item.status || 'pending'}`"
                part="span"
                @click="emit('select', item.id)"
              >
                <span
                  aria-hidden="true"
                  class="h-span-fill"
                  :style="{
                    insetInlineStart: `${((item.start - domain.start) / domain.range) * 100}%`,
                    width: `${Math.max(0, ((item.end - item.start) / domain.range) * 100)}%`,
                    background: toneColor(statusTone(item.status)),
                  }"
                /><span class="h-span-value"
                  >{{ formatAmount(item.end - item.start, unit) }} ·
                  {{ item.status || "pending" }}</span
                >
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-else class="h-data-empty">No timing spans.</p>
    <p v-if="items.length < spans.length" class="h-data-note">
      {{ items.length }} of {{ spans.length }} spans shown; invalid or excess
      spans omitted.
    </p>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
table {
  table-layout: fixed;
  min-width: 420px;
}
th:first-child {
  width: 35%;
}
.h-span-track {
  position: relative;
  display: block;
  width: 100%;
  min-height: var(--h-row-height);
  padding: 4px;
  border: 1px solid transparent;
  border-radius: 4px;
  background: repeating-linear-gradient(
    to right,
    var(--h-border) 0 1px,
    transparent 1px 25%
  );
  color: var(--h-text);
  font: 12px/1.6 var(--h-font-mono);
  overflow: hidden;
  text-align: start;
}
.h-span-fill {
  position: absolute;
  top: 4px;
  bottom: 4px;
  min-width: 2px;
  opacity: 0.25;
  border-radius: 3px;
  pointer-events: none;
}
.h-span-value {
  position: relative;
  overflow-wrap: anywhere;
}
.h-span-track[aria-pressed="true"] {
  border-color: var(--h-accent-text);
}
</style>
