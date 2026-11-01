<script setup lang="ts">
import type { ChartSlice } from "../themes";
import HCompositionChart from "./HCompositionChart.vue";
withDefaults(
  defineProps<{
    items: ChartSlice[];
    label: string;
    selected?: string;
    unit?: string;
    size?: number;
    thickness?: number;
  }>(),
  { items: () => [] },
);
const emit = defineEmits<{ select: [id: string] }>();
</script>
<template>
  <HCompositionChart
    mode="donut"
    :items="items"
    :label="label"
    :selected="selected"
    :unit="unit"
    :size="size"
    :thickness="thickness"
    @select="emit('select', $event)"
  />
</template>
