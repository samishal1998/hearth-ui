<script setup lang="ts">
import HCombobox from "./HCombobox.vue";
import type { MultiSelectProps } from "../themes";
const props = withDefaults(defineProps<MultiSelectProps>(), {
  clearable: true,
  options: () => [],
});
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  change: [value: string[]];
  search: [query: string];
  "control-sync": [];
}>();
const array = (value: string | string[]) =>
  Array.isArray(value) ? value : value ? [value] : [];
</script>
<template>
  <HCombobox
    v-bind="props"
    multiple
    @update:model-value="emit('update:modelValue', array($event))"
    @change="emit('change', array($event))"
    @search="emit('search', $event)"
    @control-sync="emit('control-sync')"
  />
</template>
