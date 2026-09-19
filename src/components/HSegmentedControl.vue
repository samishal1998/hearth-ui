<script setup lang="ts">
import HRadioGroup from "./HRadioGroup.vue";
import type { ChoiceOption } from "../themes";
const props = defineProps<{
  modelValue?: string;
  value?: string;
  label: string;
  name?: string;
  options: ChoiceOption[];
  disabled?: boolean;
  required?: boolean;
  formDisabled?: boolean;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
</script>
<template>
  <HRadioGroup
    v-bind="props"
    class="h-segmented"
    orientation="horizontal"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
    @control-sync="emit('control-sync')"
  />
</template>
<style scoped>
.h-segmented :deep(.h-radio-options) {
  display: inline-flex;
  gap: 3px;
  padding: 4px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
}
.h-segmented :deep(.h-radio-option) {
  position: relative;
  padding: 9px 15px;
  min-height: 40px;
  border-radius: calc(var(--h-radius-control) - 4px);
  color: var(--h-muted);
  text-align: center;
}
.h-segmented :deep(.h-radio-option:has(input:checked)) {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
}
.h-segmented :deep(.h-radio-option:has(input:focus-visible)) {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 2px;
}
.h-segmented :deep(input) {
  position: absolute;
  inset: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  cursor: pointer;
}
</style>
