<script setup lang="ts">
import { ref, watch, useId, onMounted, onUpdated } from "vue";
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
    />
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
  color: var(--h-accent-text);
  font-variant-numeric: tabular-nums;
}
input {
  display: block;
  width: 100%;
  height: 44px;
  margin: 0;
  accent-color: var(--h-accent);
  cursor: pointer;
}
input:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
p {
  font-size: 11px;
  line-height: 1.8;
  color: var(--h-muted);
}
</style>
