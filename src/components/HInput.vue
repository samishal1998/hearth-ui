<script setup lang="ts">
import { ref, type ComponentPublicInstance } from "vue";
import { useSlotPresence } from "../slots";
import type { ControlSize, IconValue } from "../themes";
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
    mobileBreakpoint?: number;
    hideLabel?: boolean;
    size?: ControlSize;
    leadingIcon?: IconValue;
    clearable?: boolean;
  }>(),
  { type: "text", value: "", clearable: undefined },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const field = ref<ComponentPublicInstance>();
const hasSlot = useSlotPresence(() =>
  field.value?.$el instanceof HTMLElement ? field.value.$el : undefined,
);
</script>
<template>
  <component
    ref="field"
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
    ><template v-if="hasSlot('leading')" #leading
      ><slot name="leading" /></template
    ><template v-if="hasSlot('trailing')" #trailing
      ><slot name="trailing" /></template
  ></component>
</template>
