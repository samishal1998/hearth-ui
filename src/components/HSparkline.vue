<script setup lang="ts">
import { computed, useId } from "vue";
import type { Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    values: number[];
    label: string;
    description?: string;
    tone?: Tone;
    width?: number;
    height?: number;
    decorative?: boolean;
  }>(),
  { values: () => [], tone: "accent", width: 160, height: 48 },
);
const id = useId();
const data = computed(() => props.values.filter(Number.isFinite));
const w = computed(() =>
  Math.max(24, Number.isFinite(props.width) ? props.width : 160),
);
const h = computed(() =>
  Math.max(16, Number.isFinite(props.height) ? props.height : 48),
);
const points = computed(() => {
  const min = data.value.reduce((a, b) => Math.min(a, b), Infinity),
    max = data.value.reduce((a, b) => Math.max(a, b), -Infinity);
  return data.value
    .map(
      (value, i) =>
        `${data.value.length === 1 ? w.value / 2 : 4 + (i / (data.value.length - 1)) * (w.value - 8)},${max === min ? h.value / 2 : h.value - 4 - ((value - min) / (max - min)) * (h.value - 8)}`,
    )
    .join(" ");
});
const summary = computed(
  () =>
    props.description ||
    (!data.value.length
      ? "No data available."
      : `${data.value.length} samples. Latest value: ${data.value.at(-1)}.`),
);
</script>
<template>
  <svg
    class="h-sparkline"
    :class="tone"
    :width="w"
    :height="h"
    :viewBox="`0 0 ${w} ${h}`"
    :role="decorative ? undefined : 'img'"
    :aria-hidden="decorative || undefined"
    :aria-labelledby="decorative ? undefined : `${id}-title`"
    :aria-describedby="decorative ? undefined : `${id}-desc`"
    part="base"
  >
    <title :id="`${id}-title`">{{ label }}</title>
    <desc :id="`${id}-desc`">{{ summary }}</desc>
    <polyline
      v-if="data.length > 1"
      :points="points"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle
      v-else-if="data.length === 1"
      :cx="w / 2"
      :cy="h / 2"
      r="3"
      fill="currentColor"
    />
    <path
      v-else
      :d="`M4 ${h / 2}H${w - 4}`"
      stroke="currentColor"
      stroke-dasharray="3 4"
      opacity=".4"
    />
  </svg>
</template>
<style scoped>
.h-sparkline {
  display: inline-block;
  max-width: 100%;
  height: auto;
  vertical-align: middle;
  color: var(--h-accent);
}
.success {
  color: var(--h-success);
}
.warning {
  color: var(--h-warning);
}
.danger {
  color: var(--h-danger);
}
.info {
  color: var(--h-info);
}
.neutral {
  color: var(--h-muted);
}
</style>
