<script setup lang="ts">
import type { ChartSlice } from "../themes";
import HCompositionChart from "./HCompositionChart.vue";
withDefaults(
  defineProps<{
    items: ChartSlice[];
    label: string;
    selected?: string;
    unit?: string;
    cells?: number;
    columns?: number;
  }>(),
  { items: () => [] },
);
const emit = defineEmits<{ select: [id: string] }>();
</script>
<template>
  <HCompositionChart
    mode="waffle"
    :items="items"
    :label="label"
    :selected="selected"
    :unit="unit"
    :cells="cells"
    :columns="columns"
    @select="emit('select', $event)"
  />
</template>
