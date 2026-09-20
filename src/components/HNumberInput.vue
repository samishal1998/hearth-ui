<script setup lang="ts">
import { ref, watch, useId, computed } from "vue";
import { controlSync } from "../internal";
const props = withDefaults(
  defineProps<{
    modelValue?: number | null;
    value?: number | null;
    label: string;
    name?: string;
    min?: number;
    max?: number;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    readonly?: boolean;
    hint?: string;
    error?: string;
  }>(),
  { value: null, step: 1 },
);
const emit = defineEmits<{
  "update:modelValue": [value: number | null];
  change: [value: number | null];
  "control-sync": [];
}>();
const id = useId();
const input = ref<HTMLInputElement>();
const local = ref(
  props.modelValue !== undefined ? props.modelValue : props.value,
);
const locked = computed(
  () => props.disabled || props.formDisabled || props.readonly,
);
watch(
  () => [props.modelValue, props.value],
  () =>
    (local.value =
      props.modelValue !== undefined ? props.modelValue : props.value),
);
function update(commit = false) {
  const v = input.value!.valueAsNumber;
  local.value = Number.isFinite(v) ? v : null;
  emit("update:modelValue", local.value);
  if (commit) emit("change", local.value);
  emit("control-sync");
}
function increment(direction: number) {
  if (locked.value || !input.value) return;
  if (direction > 0) input.value.stepUp();
  else input.value.stepDown();
  update(true);
  input.value.focus();
}
controlSync(emit);
</script>
<template>
  <div class="h-number" part="base">
    <label :for="id" part="label">{{ label }}</label>
    <div class="h-number-controls">
      <button
        type="button"
        :aria-label="`Decrease ${label}`"
        :disabled="
          locked || (local !== null && min !== undefined && local <= min)
        "
        part="decrement"
        @click="increment(-1)"
      >
        −</button
      ><input
        :id="id"
        ref="input"
        type="number"
        data-h-number
        data-h-nullable
        :value="local ?? ''"
        :name="name"
        :min="min"
        :max="max"
        :step="step > 0 ? step : 1"
        :required="required"
        :disabled="disabled || formDisabled"
        :readonly="readonly"
        :aria-invalid="!!error"
        :aria-describedby="hint || error ? `${id}-help` : undefined"
        part="control"
        @input="update()"
        @change="update(true)"
      /><button
        type="button"
        :aria-label="`Increase ${label}`"
        :disabled="
          locked || (local !== null && max !== undefined && local >= max)
        "
        part="increment"
        @click="increment(1)"
      >
        +
      </button>
    </div>
    <p
      v-if="hint || error"
      :id="`${id}-help`"
      :role="error ? 'alert' : undefined"
      part="hint"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-number {
  font: 13px/1.7 var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  margin-bottom: 7px;
}
.h-number-controls {
  display: flex;
  gap: 6px;
}
input {
  min-width: 0;
  width: 100%;
  font: inherit;
  font-variant-numeric: tabular-nums;
  background: var(--h-bg);
  color: inherit;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  padding: 10px 12px;
}
button {
  flex: 0 0 44px;
  min-height: 44px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: inherit;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
}
button:hover:not(:disabled) {
  background: var(--h-raised);
}
:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
p {
  color: var(--h-muted);
  font-size: 11px;
  margin: 7px 0 0;
}
input[aria-invalid="true"] {
  border-color: var(--h-danger);
}
</style>
