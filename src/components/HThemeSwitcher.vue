<script setup lang="ts">
import HSegmentedControl from "./HSegmentedControl.vue";
import type { Mode } from "../themes";
withDefaults(
  defineProps<{
    modelValue?: Mode;
    value?: Mode;
    label?: string;
    name?: string;
    disabled?: boolean;
    formDisabled?: boolean;
  }>(),
  { value: "system", label: "Color mode" },
);
const emit = defineEmits<{
  "update:modelValue": [value: Mode];
  change: [value: Mode];
  "control-sync": [];
}>();
</script>
<template>
  <HSegmentedControl
    :model-value="modelValue"
    :value="value"
    :label="label"
    :name="name"
    :disabled="disabled"
    :form-disabled="formDisabled"
    :options="[
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'System' },
    ]"
    @update:model-value="emit('update:modelValue', $event as Mode)"
    @change="emit('change', $event as Mode)"
    @control-sync="emit('control-sync')"
  />
</template>
