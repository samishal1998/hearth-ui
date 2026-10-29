<script setup lang="ts">
import { computed } from "vue";
import HBarDiagram from "./HBarDiagram.vue";
import type { ChartPoint, Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    items: ChartPoint[];
    label: string;
    description?: string;
    selected?: string;
    height?: number;
    barWidth?: number;
    maxPoints?: number;
    positiveTone?: Tone;
    negativeTone?: Tone;
  }>(),
  {
    items: () => [],
    height: 96,
    barWidth: 6,
    positiveTone: "accent",
    negativeTone: "info",
  },
);
const emit = defineEmits<{ select: [id: string] }>();
const columns = computed(() =>
  props.items.map((item) => ({
    id: item.id,
    label: item.label,
    values: { value: item.value },
  })),
);
</script>
<template>
  <HBarDiagram
    diverging
    :columns="columns"
    :series="[{ id: 'value', label: 'Change', tone: positiveTone }]"
    :label="label"
    :description="description"
    :selected="selected"
    :height="height"
    :bar-width="barWidth"
    :max-points="maxPoints"
    :negative-tone="negativeTone"
    @select="emit('select', $event)"
  />
</template>
