<script setup lang="ts">
import HInput from "./HInput.vue";
const props = defineProps<{
  modelValue?: string;
  value?: string;
  label: string;
  name?: string;
  min?: string;
  max?: string;
  step?: number;
  required?: boolean;
  disabled?: boolean;
  readonly?: boolean;
  hint?: string;
  error?: string;
}>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
</script>
<template>
  <HInput
    v-bind="props"
    type="time"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
    @control-sync="emit('control-sync')"
  />
</template>
