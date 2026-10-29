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
  }>(),
  { columns: () => [], series: () => [] },
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
    percentage
    @select="emit('select', $event)"
  />
</template>
