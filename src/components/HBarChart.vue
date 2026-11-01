<script setup lang="ts">
import { computed } from "vue";
import HBarDiagram from "./HBarDiagram.vue";
import type { ChartPoint, ChartColumn, ChartSeries } from "../themes";
const props = withDefaults(
  defineProps<{
    items?: ChartPoint[];
    columns?: ChartColumn[];
    series?: ChartSeries[];
    orientation?: "vertical" | "horizontal";
    histogram?: boolean;
    label: string;
    description?: string;
    unit?: string;
    selected?: string;
    height?: number;
    maxPoints?: number;
  }>(),
  { items: () => [] },
);
const emit = defineEmits<{ select: [id: string] }>();
const columns = computed(
  () =>
    props.columns ??
    props.items.map((item) => ({
      id: item.id,
      label: item.label,
      values: { value: item.value },
    })),
);
</script>
<template>
  <HBarDiagram
    :columns="columns"
    :series="props.columns ? series || [] : [{ id: 'value', label: 'Value' }]"
    :grouped="!!props.columns"
    :orientation="orientation"
    :histogram="histogram && !props.columns"
    :label="label"
    :description="description"
    :unit="unit"
    :selected="selected"
    :height="height"
    :max-points="maxPoints"
    @select="emit('select', $event)"
  />
</template>
