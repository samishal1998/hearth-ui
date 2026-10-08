<script setup lang="ts">
import { ref, watch } from "vue";
import type { ChoiceOption } from "../themes";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{
    options: ChoiceOption[];
    modelValue?: string[];
    multiple?: boolean;
    label: string;
    disabled?: boolean;
  }>(),
  { options: () => [], modelValue: () => [] },
);
const emit = defineEmits<{
  "update:modelValue": [values: string[]];
  change: [values: string[]];
}>();
const selected = ref([...props.modelValue]);
watch(
  () => props.modelValue,
  (value) => (selected.value = [...value]),
);
function toggle(value: string) {
  selected.value = selected.value.includes(value)
    ? selected.value.filter((id) => id !== value)
    : props.multiple
      ? [...selected.value, value]
      : [value];
  emit("update:modelValue", [...selected.value]);
  emit("change", [...selected.value]);
}
</script>
<template>
  <div class="h-toggle-group" role="group" :aria-label="label" part="base">
    <HButton
      v-for="option in options"
      :key="option.value"
      :aria-pressed="selected.includes(option.value)"
      :variant="selected.includes(option.value) ? 'secondary' : 'ghost'"
      :disabled="disabled || option.disabled"
      @click="toggle(option.value)"
      ><slot :name="`option:${option.value}`">{{ option.label }}</slot></HButton
    >
  </div>
</template>
<style scoped>
.h-toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}
.h-toggle-group :deep([aria-pressed="true"]) {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
}
</style>
