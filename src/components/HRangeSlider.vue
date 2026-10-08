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
const id = useId(),
  trackElement = ref<HTMLElement>();
const blocked = computed(() => props.disabled || props.formDisabled);
const low = computed(() => (Number.isFinite(props.min) ? props.min : 0));
const high = computed(() =>
  Number.isFinite(props.max)
    ? Math.max(low.value, props.max)
    : Math.max(low.value, 100),
);
const increment = computed(() =>
  Number.isFinite(props.step) && props.step > 0 ? props.step : 1,
);
function snap(value: number) {
  const ticks = Math.max(
    0,
    Math.min(
      Math.floor((high.value - low.value) / increment.value + 1e-9),
      Math.round(
        ((Number.isFinite(value) ? value : low.value) - low.value) /
          increment.value,
      ),
    ),
  );
  return Math.max(
    low.value,
    Math.min(
      high.value,
      Number((low.value + ticks * increment.value).toPrecision(15)),
    ),
  );
}
function normalize(value: NumberRange): NumberRange {
  const a = snap(value[0]),
    b = snap(value[1]);
  return [Math.min(a, b), Math.max(a, b)];
}
const local = ref<NumberRange>(normalize(props.modelValue ?? props.value));
const active = ref<number | null>(null);
const percentages = computed(() =>
  local.value.map((value) =>
    high.value === low.value
      ? 50
      : (100 * (value - low.value)) / (high.value - low.value),
  ),
);
const controls = () =>
  trackElement.value?.querySelectorAll<HTMLInputElement>("input");
watch(
  () => [props.modelValue, props.value, props.min, props.max, props.step],
  () => {
    local.value = normalize(props.modelValue ?? props.value);
  },
);
function setValue(value: number, index: number) {
  if (blocked.value) return;
  const next = snap(value);
  local.value =
    index === 0
      ? [Math.min(next, local.value[1]), local.value[1]]
      : [local.value[0], Math.max(next, local.value[0])];
  controls()?.forEach((input, i) => (input.value = String(local.value[i])));
  emit("update:modelValue", [...local.value]);
  emit("control-sync");
}
function update(event: Event, index: number, commit = false) {
  setValue((event.target as HTMLInputElement).valueAsNumber, index);
  if (commit) emit("change", [...local.value]);
}
type Drag = {
  pointer: number;
  index: number;
  startX: number;
  startValue: number;
  start: NumberRange;
  fromThumb: boolean;
  rtl: boolean;
  travel: number;
};
let drag: Drag | undefined;
function start(event: PointerEvent) {
  if (blocked.value || event.button !== 0 || high.value === low.value) return;
  const root = trackElement.value!;
  const rect = root.getBoundingClientRect();
  const rtl = getComputedStyle(root).direction === "rtl",
    travel = Math.max(1, rect.width - 44);
  let fraction = Math.max(
    0,
    Math.min(1, (event.clientX - rect.left - 22) / travel),
  );
  if (rtl) fraction = 1 - fraction;
  const value = low.value + fraction * (high.value - low.value);
  const hit =
    event.target instanceof HTMLInputElement
      ? Number(event.target.dataset.index)
      : undefined;
  const equal = local.value[0] === local.value[1];
  const index =
    Math.abs(value - local.value[0]) === Math.abs(value - local.value[1])
      ? value <= local.value[0]
        ? 0
        : 1
      : Math.abs(value - local.value[0]) < Math.abs(value - local.value[1])
        ? 0
        : 1;
  drag = {
    pointer: event.pointerId,
    index,
    startX: event.clientX,
    startValue: local.value[index],
    start: [...local.value],
    fromThumb: hit !== undefined,
    rtl,
    travel,
  };
  event.preventDefault();
  root.setPointerCapture(event.pointerId);
  active.value = index;
  controls()?.[index]?.focus({ preventScroll: true });
  if (hit === undefined && !equal) setValue(value, index);
  if (hit === undefined && equal) {
    setValue(value, index);
    drag.fromThumb = false;
  }
}
function move(event: PointerEvent) {
  if (!drag || drag.pointer !== event.pointerId || blocked.value) return;
  const delta =
    (((event.clientX - drag.startX) * (drag.rtl ? -1 : 1)) / drag.travel) *
    (high.value - low.value);
  if (
    drag.start[0] === drag.start[1] &&
    drag.fromThumb &&
    Math.abs(delta) > 0
  ) {
    drag.index = delta < 0 ? 0 : 1;
    active.value = drag.index;
    controls()?.[drag.index]?.focus({ preventScroll: true });
  }
  if (drag.fromThumb) setValue(drag.startValue + delta, drag.index);
  else {
    const rect = trackElement.value!.getBoundingClientRect();
    let fraction = Math.max(
      0,
      Math.min(1, (event.clientX - rect.left - 22) / drag.travel),
    );
    if (drag.rtl) fraction = 1 - fraction;
    setValue(low.value + fraction * (high.value - low.value), drag.index);
  }
}
function finish(event: PointerEvent) {
  if (!drag || drag.pointer !== event.pointerId) return;
  const start = drag.start;
  drag = undefined;
  active.value = null;
  if (trackElement.value?.hasPointerCapture(event.pointerId))
    trackElement.value.releasePointerCapture(event.pointerId);
  if (start[0] !== local.value[0] || start[1] !== local.value[1])
    emit("change", [...local.value]);
}
function cancel(event: PointerEvent) {
  if (!drag || drag.pointer !== event.pointerId) return;
  const original = normalize(drag.start);
  drag = undefined;
  active.value = null;
  if (trackElement.value?.hasPointerCapture(event.pointerId))
    trackElement.value.releasePointerCapture(event.pointerId);
  if (original[0] === local.value[0] && original[1] === local.value[1]) return;
  local.value = original;
  controls()?.forEach(
    (input, index) => (input.value = String(original[index])),
  );
  emit("update:modelValue", [...original]);
  emit("control-sync");
}
controlSync(emit);
</script>
<template>
  <fieldset class="h-range-slider" :disabled="blocked" part="base">
    <legend :id="id" part="label">{{ label }}</legend>
    <div class="h-range-values" part="value">
      <div v-for="(value, index) in local" :key="index" class="h-range-bound">
        <span>{{ index === 0 ? lowerLabel : upperLabel }}</span
        ><output :for="`${id}-${index}`" aria-live="off"
          >{{ value }}<small v-if="unit">{{ unit }}</small></output
        >
      </div>
    </div>
    <div
      ref="trackElement"
      class="h-range-track"
      :class="{ dragging: active !== null }"
      part="track"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="finish"
      @pointercancel="cancel"
      @lostpointercapture="cancel"
    >
      <div class="h-range-rail" aria-hidden="true" part="rail">
        <div
          class="h-range-fill"
          part="fill"
          :style="{
            insetInlineStart: `${percentages[0]}%`,
            width: `${percentages[1] - percentages[0]}%`,
          }"
        />
      </div>
      <template v-for="(_, index) in local" :key="index"
        ><input
          :id="`${id}-${index}`"
          type="range"
          :data-index="index"
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
          :disabled="blocked"
          :part="index === 0 ? 'lower' : 'upper'"
          @input="update($event, index)"
          @change="update($event, index, true)" /><span
          class="h-range-thumb"
          :class="{ active: active === index }"
          :data-thumb="index"
          :style="{
            insetInlineStart: `calc(${percentages[index]}% + ${11 - percentages[index] * 0.44}px)`,
          }"
          aria-hidden="true"
      /></template>
    </div>
    <div class="h-range-scale" aria-hidden="true">
      <span>{{ min }}{{ unit }}</span
      ><span>{{ max }}{{ unit }}</span>
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
  margin-bottom: 12px;
}
.h-range-values {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 4px;
}
.h-range-bound {
  display: grid;
  gap: 1px;
  min-width: 0;
}
.h-range-bound:last-child {
  text-align: end;
}
.h-range-bound > span {
  color: var(--h-muted);
  font-size: 11px;
}
output {
  font-size: 20px;
  font-weight: 550;
  line-height: 1.5;
  font-variant-numeric: tabular-nums;
}
output small {
  margin-inline-start: 3px;
  font-size: 12px;
  color: var(--h-muted);
  font-weight: 400;
}
.h-range-track {
  position: relative;
  height: 44px;
  touch-action: pan-y;
  cursor: pointer;
}
.h-range-rail {
  position: absolute;
  inset-inline: 22px;
  top: 19px;
  height: 6px;
  border-radius: 999px;
  background: var(--h-border-strong);
  pointer-events: none;
  overflow: hidden;
}
.h-range-fill {
  position: absolute;
  inset-block: 0;
  background: var(--h-accent);
  border-radius: inherit;
}
.h-range-thumb {
  position: absolute;
  top: 11px;
  width: 22px;
  height: 22px;
  border: 2px solid var(--h-accent);
  border-radius: 50%;
  background: var(--h-raised);
  box-shadow: 0 2px 5px #0003;
  pointer-events: none;
  transition:
    box-shadow 120ms,
    background 120ms;
}
.h-range-thumb::after {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: var(--h-accent);
}
input {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 44px;
  padding: 0;
  margin: 0;
  background: none;
  pointer-events: none;
  color: var(--h-accent-text);
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  pointer-events: auto;
  cursor: grab;
}
input::-moz-range-thumb {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  pointer-events: auto;
  cursor: grab;
}
input::-moz-range-track,
input::-moz-range-progress {
  background: transparent;
  border: 0;
}
input:focus-visible {
  outline: none;
  z-index: 2;
}
input:focus-visible + .h-range-thumb,
.h-range-thumb.active {
  box-shadow:
    0 0 0 4px var(--h-accent-subtle),
    0 2px 5px #0003;
  z-index: 3;
}
input:focus-visible + .h-range-thumb {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-range-slider:has(input[part="lower"]:focus-visible)
  .h-range-bound:first-child
  output,
.h-range-slider:has(input[part="upper"]:focus-visible)
  .h-range-bound:last-child
  output {
  color: var(--h-accent-text);
}
.dragging,
.dragging input::-webkit-slider-thumb {
  cursor: grabbing;
}
.h-range-scale {
  display: flex;
  justify-content: space-between;
  color: var(--h-faint);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  padding-inline: 12px;
}
fieldset:disabled {
  opacity: 0.5;
}
.h-range-slider:disabled .h-range-track {
  cursor: not-allowed;
}
input:disabled::-webkit-slider-thumb {
  pointer-events: none;
  cursor: not-allowed;
}
input:disabled::-moz-range-thumb {
  pointer-events: none;
  cursor: not-allowed;
}
</style>
