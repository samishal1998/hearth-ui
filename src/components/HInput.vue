<script setup lang="ts">
import HTextInput from "./HTextInput.vue";
import HDatePicker from "./HDatePicker.vue";
import HTimePicker from "./HTimePicker.vue";
import HDateTimeInput from "./HDateTimeInput.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    type?:
      | "text"
      | "email"
      | "password"
      | "url"
      | "search"
      | "number"
      | "tel"
      | "date"
      | "time"
      | "datetime-local";
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    readonly?: boolean;
    autocomplete?: string;
    minlength?: number;
    maxlength?: number;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
  }>(),
  { type: "text", value: "" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
</script>
<template>
  <component
    :is="
      type === 'date'
        ? HDatePicker
        : type === 'time'
          ? HTimePicker
          : type === 'datetime-local'
            ? HDateTimeInput
            : HTextInput
    "
    v-bind="{ ...props, ...$attrs }"
    :disabled="disabled || formDisabled"
    @update:model-value="emit('update:modelValue', $event)"
    @change="emit('change', $event)"
    @control-sync="emit('control-sync')"
  />
</template>
