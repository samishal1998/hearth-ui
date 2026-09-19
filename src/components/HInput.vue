<script setup lang="ts">
import { ref, watch, useId } from "vue";
import { controlSync } from "../internal";
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
const local = ref(props.modelValue ?? props.value);
const id = useId();
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
function input(e: Event) {
  local.value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", local.value);
}
controlSync(emit);
</script>
<template>
  <div class="h-field" part="base">
    <label :for="id" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    ><input
      v-bind="$attrs"
      :id="id"
      part="control"
      :value="local"
      :type="type"
      :name="name"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :minlength="minlength"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :step="step"
      :pattern="pattern"
      :aria-invalid="!!error"
      :aria-describedby="error || hint ? `${id}-help` : undefined"
      @input="input"
      @change="emit('change', local)"
    />
    <p
      v-if="error || hint"
      :id="`${id}-help`"
      part="hint"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-field {
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 7px;
}
label span {
  color: var(--h-accent-text);
}
input {
  display: block;
  width: 100%;
  min-height: var(--h-control-height);
  padding: 10px 12px;
  background: var(--h-bg);
  color: var(--h-text);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  font-size: 13px;
  transition: border-color var(--h-motion);
}
input:hover {
  border-color: var(--h-border-strong);
}
input::placeholder {
  color: var(--h-faint);
}
input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
input[aria-invalid="true"] {
  border-color: var(--h-danger);
}
p {
  font-size: 11px;
  color: var(--h-muted);
  line-height: 1.7;
  margin-top: 7px;
}
.error {
  color: var(--h-danger);
}
</style>
