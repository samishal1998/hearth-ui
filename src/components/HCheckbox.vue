<script setup lang="ts">
import { ref, watch, watchEffect, useId } from "vue";
import type { ControlSize } from "../themes";
import { controlSync } from "../internal";
const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
    label: string;
    description?: string;
    name?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
    hideLabel?: boolean;
    size?: ControlSize;
  }>(),
  { modelValue: undefined, checked: false, value: "on" },
);
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:indeterminate": [value: boolean];
  change: [value: boolean];
  "control-sync": [];
}>();
const input = ref<HTMLInputElement>();
const id = useId();
const local = ref(props.modelValue ?? props.checked);
watch(
  () => [props.modelValue, props.checked],
  () => (local.value = props.modelValue ?? props.checked),
);
watchEffect(() => {
  if (input.value) input.value.indeterminate = !!props.indeterminate;
});
controlSync(emit);
function change(e: Event) {
  local.value = (e.target as HTMLInputElement).checked;
  emit("update:indeterminate", false);
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
</script>
<template>
  <label
    class="h-checkbox"
    :class="[size ? `h-size-${size}` : undefined, { 'hide-label': hideLabel }]"
    part="base"
    ><input
      ref="input"
      type="checkbox"
      :aria-labelledby="`${id}-label`"
      :aria-describedby="description ? `${id}-description` : undefined"
      part="control"
      :name="name"
      :value="value"
      :checked="local"
      :disabled="disabled"
      :required="required"
      @change="change"
    /><span :class="{ 'h-sr-only': hideLabel && !description }"
      ><strong
        :id="`${id}-label`"
        :class="{ 'h-sr-only': hideLabel && !!description }"
        part="label"
        >{{ label }}</strong
      ><small v-if="description" :id="`${id}-description`" part="description">{{
        description
      }}</small></span
    ></label
  >
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/field.css";
.h-checkbox {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: var(--h-choice-height, 44px);
  font-family: var(--h-font);
  color: var(--h-text);
  cursor: pointer;
}
input {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin: 0;
  accent-color: var(--h-accent);
  cursor: pointer;
}
strong {
  font-size: max(var(--h-font-min-size, 12px), 13px);
  font-weight: 500;
}
small {
  display: block;
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
  line-height: 1.8;
  margin-top: 3px;
}
.h-checkbox:has(input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}
input:disabled {
  cursor: not-allowed;
}
.h-checkbox.hide-label {
  display: inline-flex;
  justify-content: center;
  min-width: var(--h-choice-height, 44px);
}
@media (pointer: coarse) {
  .h-checkbox {
    min-height: max(44px, var(--h-choice-height, 44px));
  }
  .h-checkbox.hide-label {
    min-width: max(44px, var(--h-choice-height, 44px));
  }
}
</style>
