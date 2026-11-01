<script setup lang="ts">
import HBarDiagram from "./HBarDiagram.vue";
import type { ChartColumn, ChartSeries } from "../themes";
withDefaults(
  defineProps<{
    columns: ChartColumn[];
    series: ChartSeries[];
    label: string;
    description?: string;
    unit?: string;
    selected?: string;
    height?: number;
    maxPoints?: number;
    mode?: "percentage" | "absolute";
    orientation?: "vertical" | "horizontal";
  }>(),
  { columns: () => [], series: () => [], mode: "percentage" },
);
const emit = defineEmits<{ select: [id: string] }>();
</script>
<template>
  <HBarDiagram
    :columns="columns"
    :series="series"
    :label="label"
    :description="description"
    :unit="unit"
    :selected="selected"
    :height="height"
    :max-points="maxPoints"
    :percentage="mode === 'percentage'"
    :orientation="orientation"
    @select="emit('select', $event)"
  />
</template>
