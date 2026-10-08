<script setup lang="ts">
import { ref, watch, useId, computed, onBeforeUnmount } from "vue";
import { controlSync } from "../internal";
import HIcon from "./HIcon.vue";
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
const announcement = ref("");
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
  announcement.value = `${props.label}: ${local.value ?? "empty"}`;
}
let hold: ReturnType<typeof setTimeout> | undefined,
  repeat: ReturnType<typeof setInterval> | undefined,
  repeated = false;
function stopHold() {
  clearTimeout(hold);
  clearInterval(repeat);
  if (typeof window !== "undefined")
    window.removeEventListener("blur", stopHold);
}
function beginHold(event: PointerEvent, direction: number) {
  if (locked.value || event.button !== 0) return;
  stopHold();
  repeated = false;
  const button = event.currentTarget as HTMLButtonElement;
  window.addEventListener("blur", stopHold);
  hold = setTimeout(() => {
    const step = () => {
      if (!button.isConnected || button.disabled || locked.value) {
        stopHold();
        return;
      }
      repeated = true;
      increment(direction);
    };
    step();
    if (button.isConnected && !button.disabled && !locked.value)
      repeat = setInterval(step, 85);
  }, 400);
}
function clickStep(event: MouseEvent, direction: number) {
  if (!repeated || event.detail === 0) increment(direction);
  repeated = false;
}
watch(locked, (value) => {
  if (value) stopHold();
});
onBeforeUnmount(stopHold);
controlSync(emit);
</script>
<template>
  <div
    class="h-number"
    :class="{ disabled: disabled || formDisabled, invalid: !!error }"
    part="base"
  >
    <label :for="id" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <div class="h-number-controls">
      <button
        type="button"
        :aria-label="`Decrease ${label}`"
        :aria-controls="id"
        :disabled="
          locked || (local !== null && min !== undefined && local <= min)
        "
        part="decrement"
        @pointerdown="beginHold($event, -1)"
        @pointerup="stopHold"
        @pointercancel="stopHold"
        @pointerleave="stopHold"
        @click="clickStep($event, -1)"
      >
        <HIcon name="minus" :size="16" /></button
      ><input
        :id="id"
        ref="input"
        type="number"
        placeholder="—"
        data-h-number
        data-h-nullable
        :value="local ?? ''"
        :name="name"
        :min="min"
        :max="max"
        :step="Number.isFinite(step) && step > 0 ? step : 1"
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
        :aria-controls="id"
        :disabled="
          locked || (local !== null && max !== undefined && local >= max)
        "
        part="increment"
        @pointerdown="beginHold($event, 1)"
        @pointerup="stopHold"
        @pointercancel="stopHold"
        @pointerleave="stopHold"
        @click="clickStep($event, 1)"
      >
        <HIcon name="plus" :size="16" />
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
    <span class="h-sr-only" role="status">{{ announcement }}</span>
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
  align-items: center;
  width: 100%;
  max-width: var(--h-number-width, 280px);
  padding: 3px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  transition: border-color 150ms;
}
input {
  min-width: 0;
  width: 100%;
  font: inherit;
  font-variant-numeric: tabular-nums;
  background: transparent;
  color: inherit;
  border: 0;
  border-radius: 0;
  padding: 8px 4px;
  min-height: 44px;
  text-align: center;
  font-weight: 550;
  appearance: textfield;
}
input::-webkit-inner-spin-button,
input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}
input:focus-visible {
  outline: none;
}
.h-number-controls:has(input:focus-visible) {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-number-controls:hover {
  border-color: var(--h-border-strong);
}
input::placeholder {
  color: var(--h-faint);
  font-weight: 400;
}
button {
  flex: 0 0 44px;
  min-height: 44px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: max(4px, calc(var(--h-radius-control) - 4px));
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 18px;
  cursor: pointer;
  transition:
    background 150ms,
    color 150ms,
    transform 150ms;
}
button:hover:not(:disabled) {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
}
button:active:not(:disabled) {
  transform: scale(0.96);
}
button:focus-visible {
  outline-offset: -2px;
}
button:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.disabled .h-number-controls {
  opacity: 0.55;
}
.disabled input {
  cursor: not-allowed;
}
p {
  color: var(--h-muted);
  font-size: max(var(--h-font-min-size, 12px), 11px);
  margin: 7px 0 0;
}
.invalid .h-number-controls {
  border-color: var(--h-danger);
}
.invalid p,
label > span {
  color: var(--h-danger);
}
.h-number-controls input {
  font-size: var(--h-field-font-size, 16px);
}
</style>
