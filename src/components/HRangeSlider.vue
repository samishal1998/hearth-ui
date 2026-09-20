<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import type { NumberRange } from "../themes";
import { controlSync } from "../internal";
const props = withDefaults(
  defineProps<{
    modelValue?: NumberRange;
    value?: NumberRange;
    label: string;
    name?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    disabled?: boolean;
    formDisabled?: boolean;
    lowerLabel?: string;
    upperLabel?: string;
  }>(),
  {
    value: () => [0, 100],
    min: 0,
    max: 100,
    step: 1,
    unit: "",
    lowerLabel: "Minimum",
    upperLabel: "Maximum",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: NumberRange];
  change: [value: NumberRange];
  "control-sync": [];
}>();
const id = useId();
const low = computed(() => (Number.isFinite(props.min) ? props.min : 0));
const high = computed(() =>
  Number.isFinite(props.max)
    ? Math.max(low.value, props.max)
    : Math.max(low.value, 100),
);
const increment = computed(() =>
  Number.isFinite(props.step) && props.step > 0 ? props.step : 1,
);
function normalize(values: NumberRange): NumberRange {
  const clamp = (v: number) => {
    const steps = Math.max(
      0,
      Math.min(
        Math.floor((high.value - low.value) / increment.value),
        Math.round(
          ((Number.isFinite(v) ? v : low.value) - low.value) / increment.value,
        ),
      ),
    );
    return Number((low.value + steps * increment.value).toPrecision(12));
  };
  return [clamp(Math.min(...values)), clamp(Math.max(...values))];
}
const local = ref<NumberRange>(normalize(props.modelValue ?? props.value));
watch(
  () => [props.modelValue, props.value, props.min, props.max, props.step],
  () => (local.value = normalize(props.modelValue ?? props.value)),
);
function update(event: Event, index: number, commit = false) {
  const input = event.target as HTMLInputElement;
  const v = input.valueAsNumber;
  local.value =
    index === 0
      ? [Math.min(v, local.value[1]), local.value[1]]
      : [local.value[0], Math.max(v, local.value[0])];
  input.value = String(local.value[index]);
  emit("update:modelValue", [...local.value]);
  if (commit) emit("change", [...local.value]);
  emit("control-sync");
}
function track(event: PointerEvent) {
  if (
    props.disabled ||
    props.formDisabled ||
    event.target !== event.currentTarget ||
    event.button !== 0
  )
    return;
  const root = event.currentTarget as HTMLElement;
  const rect = root.getBoundingClientRect();
  let fraction = Math.max(
    0,
    Math.min(
      1,
      (event.clientX - rect.left - 12) / Math.max(1, rect.width - 24),
    ),
  );
  if (getComputedStyle(root).direction === "rtl") fraction = 1 - fraction;
  const value = low.value + fraction * (high.value - low.value);
  const index =
    Math.abs(value - local.value[0]) <= Math.abs(value - local.value[1])
      ? 0
      : 1;
  const input = root.querySelectorAll("input")[index]!;
  input.value = String(value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.focus();
}
controlSync(emit);
</script>
<template>
  <fieldset
    class="h-range-slider"
    :disabled="disabled || formDisabled"
    part="base"
  >
    <legend :id="id" part="label">{{ label }}</legend>
    <div class="h-range-values" part="value">
      <span>{{ lowerLabel }}: {{ local[0] }}{{ unit }}</span
      ><span>{{ upperLabel }}: {{ local[1] }}{{ unit }}</span>
    </div>
    <div class="h-range-track" part="track" @pointerdown="track">
      <input
        v-for="(_, index) in local"
        :key="index"
        type="range"
        :aria-label="`${label}: ${index === 0 ? lowerLabel : upperLabel}`"
        :aria-valuemin="index === 0 ? low : local[0]"
        :aria-valuemax="index === 0 ? local[1] : high"
        :aria-valuetext="`${local[index]}${unit}`"
        data-h-form-value
        data-h-multiple
        data-h-number
        :name="name"
        :value="local[index]"
        :min="low"
        :max="high"
        :step="increment"
        :disabled="disabled || formDisabled"
        :part="index === 0 ? 'lower' : 'upper'"
        @input="update($event, index)"
        @change="update($event, index, true)"
      />
    </div>
  </fieldset>
</template>
<style scoped>
@import "../styles/base.css";
.h-range-slider {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  font: 12px/1.7 var(--h-font);
  color: var(--h-text);
}
legend {
  padding: 0;
  font-weight: 500;
}
.h-range-values {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  color: var(--h-muted);
  font-variant-numeric: tabular-nums;
}
.h-range-track {
  position: relative;
  height: 44px;
  margin-inline: 12px;
}
.h-range-track::before {
  content: "";
  position: absolute;
  inset-inline: 0;
  top: 20px;
  height: 4px;
  background: var(--h-border-strong);
  border-radius: 2px;
}
input {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 44px;
  margin: 0;
  background: none;
  pointer-events: none;
  color: var(--h-accent-text);
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 24px;
  height: 24px;
  border: 2px solid var(--h-bg);
  border-radius: 50%;
  background: var(--h-accent);
  pointer-events: auto;
  cursor: grab;
}
input::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 2px solid var(--h-bg);
  border-radius: 50%;
  background: var(--h-accent);
  pointer-events: auto;
  cursor: grab;
}
input:focus-visible {
  z-index: 1;
}
fieldset:disabled {
  opacity: 0.55;
}
input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}
input:disabled::-moz-range-thumb {
  cursor: not-allowed;
}
</style>
