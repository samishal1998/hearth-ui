<script setup lang="ts">
import { ref, watch } from "vue";
import HChip from "./HChip.vue";
import type { SelectOption } from "../themes";
const props = withDefaults(
  defineProps<{
    options: SelectOption[];
    modelValue?: string[];
    label?: string;
    removable?: boolean;
    disabled?: boolean;
  }>(),
  { options: () => [], modelValue: () => [], label: "Filters" },
);
const emit = defineEmits<{
  "update:modelValue": [values: string[]];
  change: [values: string[]];
  remove: [value: string];
}>();
const selected = ref([...props.modelValue]);
watch(
  () => props.modelValue,
  (v) => (selected.value = [...v]),
);
function update(value: string, remove = false) {
  selected.value =
    remove || selected.value.includes(value)
      ? selected.value.filter((v) => v !== value)
      : [...selected.value, value];
  emit("update:modelValue", [...selected.value]);
  emit("change", [...selected.value]);
  if (remove) emit("remove", value);
}
</script>
<template>
  <div class="h-chip-group" role="group" :aria-label="label" part="base">
    <HChip
      v-for="option in options.filter(
        (o) => !removable || selected.includes(o.value),
      )"
      :key="option.value"
      :label="option.label"
      :value="option.value"
      :selected="selected.includes(option.value)"
      :selectable="!removable"
      :removable="removable"
      :disabled="disabled || option.disabled"
      @select="update($event)"
      @remove="update($event, true)"
    /><slot />
  </div>
</template>
<style scoped>
.h-chip-group {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 0;
}
</style>
