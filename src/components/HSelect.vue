<script setup lang="ts">
import { ref, watch, useId } from "vue";
import type { SelectOption, ControlSize } from "../themes";
import { controlSync, describedBy } from "../internal";
import HIcon from "./HIcon.vue";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    options: SelectOption[];
    placeholder?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    hideLabel?: boolean;
    size?: ControlSize;
  }>(),
  { value: "", options: () => [] },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const id = useId();
const local = ref(props.modelValue ?? props.value);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
controlSync(emit);
function change(e: Event) {
  local.value = (e.target as HTMLSelectElement).value;
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
</script>
<template>
  <div class="h-field" :class="size ? `h-size-${size}` : undefined" part="base">
    <label :for="id" :class="{ 'h-sr-only': hideLabel }" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <div class="h-select-control">
      <select
        v-bind="$attrs"
        :id="id"
        :value="local"
        :name="name"
        :disabled="disabled"
        :required="required"
        :aria-invalid="!!error"
        :aria-describedby="
          describedBy(
            $attrs['aria-describedby'],
            hint || error ? `${id}-help` : undefined,
          )
        "
        part="control"
        @change="change"
      >
        <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          :disabled="option.disabled"
        >
          {{ option.label }}
        </option></select
      ><HIcon class="h-select-chevron" name="down" :size="16" />
    </div>
    <p
      v-if="hint || error"
      :id="`${id}-help`"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
      part="hint"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/field.css";
.h-field {
  position: relative;
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
label {
  display: block;
  font-size: max(var(--h-font-min-size, 12px), 12px);
  font-weight: 500;
  margin-bottom: 7px;
}
label span {
  color: var(--h-accent-text);
}
select {
  appearance: none;
  width: 100%;
  min-height: var(--h-control-height);
  padding: var(--h-field-padding-y, 10px) var(--h-input-padding-x, 12px);
  padding-inline-end: 44px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  color: var(--h-text);
  font-size: max(var(--h-font-min-size, 12px), var(--h-field-font-size, 13px));
  line-height: 1.4;
}
select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
.h-select-control {
  position: relative;
}
.h-select-chevron {
  position: absolute;
  inset-inline-end: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--h-muted);
}
select[aria-invalid="true"] {
  border-color: var(--h-danger);
}
p {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
  margin-top: 7px;
  line-height: 1.7;
}
.error {
  color: var(--h-danger);
}
</style>
