<script setup lang="ts">
import { ref, watch, useId, onMounted, onUpdated, computed } from "vue";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    value?: number;
    label: string;
    name?: string;
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    hint?: string;
    disabled?: boolean;
  }>(),
  { value: 0, min: 0, max: 100, step: 1, unit: "" },
);
const emit = defineEmits<{
  "update:modelValue": [value: number];
  change: [value: number];
  "control-sync": [];
}>();
const id = useId();
const input = ref<HTMLInputElement>();
const local = ref(props.modelValue ?? props.value);
const shown = ref(local.value);
const percentage = computed(() =>
  props.max === props.min
    ? 50
    : Math.max(
        0,
        Math.min(
          100,
          (100 * (shown.value - props.min)) / (props.max - props.min),
        ),
      ),
);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
function sync() {
  if (input.value) shown.value = input.value.valueAsNumber;
  emit("control-sync");
}
onMounted(sync);
onUpdated(sync);
function update(e: Event, change = false) {
  local.value = (e.target as HTMLInputElement).valueAsNumber;
  emit("update:modelValue", local.value);
  if (change) emit("change", local.value);
}
</script>
<template>
  <div class="h-range" part="base">
    <div class="h-range-label">
      <label :for="id" part="label">{{ label }}</label
      ><output :for="id" part="value">{{ shown }}{{ unit }}</output>
    </div>
    <div class="h-range-track">
      <div class="h-range-rail" aria-hidden="true">
        <span :style="{ width: `${percentage}%` }" />
      </div>
      <input
        :id="id"
        ref="input"
        data-h-number
        type="range"
        :name="name"
        :value="local"
        :min="min"
        :max="max"
        :step="step"
        :disabled="disabled"
        :aria-describedby="hint ? `${id}-help` : undefined"
        :aria-valuetext="unit ? `${shown}${unit}` : undefined"
        part="control"
        @input="update($event)"
        @change="update($event, true)"
      /><span
        class="h-range-thumb"
        :style="{
          insetInlineStart: `calc(${percentage}% + ${11 - percentage * 0.44}px)`,
        }"
        aria-hidden="true"
      />
    </div>
    <div class="h-range-scale" aria-hidden="true">
      <span>{{ min }}{{ unit }}</span
      ><span>{{ max }}{{ unit }}</span>
    </div>
    <p v-if="hint" :id="`${id}-help`" part="hint">{{ hint }}</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-range {
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
.h-range-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 12px;
}
output {
  color: var(--h-text);
  font-size: 16px;
  font-weight: 550;
  font-variant-numeric: tabular-nums;
}
input {
  appearance: none;
  position: absolute;
  inset: 0;
  width: 100%;
  height: 44px;
  margin: 0;
  padding: 0;
  background: transparent;
  cursor: pointer;
}
input:disabled {
  cursor: not-allowed;
}
input:disabled::-webkit-slider-thumb {
  cursor: not-allowed;
}
input:disabled::-moz-range-thumb {
  cursor: not-allowed;
}
.h-range-track {
  position: relative;
  height: 44px;
  min-width: 0;
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
.h-range-rail > span {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
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
  transition: box-shadow 120ms;
}
.h-range-thumb::after {
  content: "";
  position: absolute;
  inset: 6px;
  border-radius: 50%;
  background: var(--h-accent);
}
input::-webkit-slider-thumb {
  appearance: none;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  cursor: grab;
}
input::-moz-range-thumb {
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  cursor: grab;
}
input::-moz-range-track,
input::-moz-range-progress {
  background: transparent;
  border: 0;
}
input:focus-visible {
  outline: none;
}
input:focus-visible + .h-range-thumb,
input:active + .h-range-thumb {
  box-shadow:
    0 0 0 4px var(--h-accent-subtle),
    0 2px 5px #0003;
}
input:focus-visible + .h-range-thumb {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-range-track:has(input:disabled) {
  opacity: 0.5;
}
.h-range-scale {
  display: flex;
  justify-content: space-between;
  padding-inline: 12px;
  color: var(--h-faint);
  font-size: max(var(--h-font-min-size, 12px), 10px);
  font-variant-numeric: tabular-nums;
}
p {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  line-height: 1.8;
  color: var(--h-muted);
}
</style>
