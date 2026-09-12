<script setup lang="ts">
import { computed, useId } from "vue";
import type { Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    value?: number;
    max?: number;
    label?: string;
    description?: string;
    indeterminate?: boolean;
    tone?: Tone;
    showValue?: boolean;
  }>(),
  { max: 100, label: "Progress", tone: "accent", showValue: true },
);
const id = useId();
const maxValue = computed(() =>
  Number.isFinite(props.max) && props.max > 0 ? props.max : 100,
);
const amount = computed(() =>
  props.value === undefined || props.indeterminate
    ? undefined
    : Math.min(
        maxValue.value,
        Math.max(0, Number.isFinite(props.value) ? props.value : 0),
      ),
);
</script>
<template>
  <div class="h-progress" :class="tone" part="base">
    <div class="h-progress-label">
      <label :for="id" part="label">{{ label }}</label
      ><span v-if="showValue" part="value">{{
        amount === undefined
          ? "In progress"
          : `${Math.round((amount / maxValue) * 100)}%`
      }}</span>
    </div>
    <progress
      :id="id"
      :value="amount"
      :max="maxValue"
      :aria-valuetext="amount === undefined ? 'In progress' : undefined"
      :aria-describedby="description ? `${id}-help` : undefined"
      part="track"
    />
    <p v-if="description" :id="`${id}-help`" part="description">
      {{ description }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-progress {
  --progress-color: var(--h-accent);
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
.success {
  --progress-color: var(--h-success);
}
.warning {
  --progress-color: var(--h-warning);
}
.danger {
  --progress-color: var(--h-danger);
}
.info {
  --progress-color: var(--h-info);
}
.neutral {
  --progress-color: var(--h-muted);
}
.h-progress-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 12px;
  margin-bottom: 10px;
}
.h-progress-label > span {
  color: var(--h-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}
progress {
  display: block;
  appearance: none;
  width: 100%;
  height: var(--h-progress-height, 8px);
  border: 0;
  border-radius: var(--h-radius-pill);
  overflow: hidden;
  background: var(--h-border);
  color: var(--progress-color);
}
progress::-webkit-progress-bar {
  background: var(--h-border);
  border-radius: var(--h-radius-pill);
}
progress::-webkit-progress-value {
  background: var(--progress-color);
  border-radius: var(--h-radius-pill);
}
progress::-moz-progress-bar {
  background: var(--progress-color);
  border-radius: var(--h-radius-pill);
}
progress:indeterminate {
  background: linear-gradient(
    90deg,
    var(--h-border) 0 35%,
    var(--progress-color) 50%,
    var(--h-border) 65%
  );
  background-size: 200% 100%;
  animation: h-progress 1.5s linear infinite;
}
progress:indeterminate::-webkit-progress-bar {
  background: transparent;
}
p {
  font-size: 11px;
  color: var(--h-muted);
  line-height: 1.8;
  margin-top: 9px;
}
@keyframes h-progress {
  to {
    background-position: -200% 0;
  }
}
</style>
