<script setup lang="ts">
import { computed, useId } from "vue";
import { bounded, formatAmount } from "../visual-data";
const props = withDefaults(
  defineProps<{
    label: string;
    value: number;
    min?: number;
    max?: number;
    low?: number;
    high?: number;
    optimum?: number;
    unit?: string;
    valueText?: string;
    description?: string;
  }>(),
  { min: 0, max: 100, unit: "" },
);
const id = useId();
const minimum = computed(() => (Number.isFinite(props.min) ? props.min : 0));
const maximum = computed(() =>
  Number.isFinite(props.max) && props.max > minimum.value
    ? props.max
    : minimum.value + 100,
);
const amount = computed(() =>
  bounded(props.value, minimum.value, minimum.value, maximum.value),
);
const low = computed(() =>
  bounded(props.low, minimum.value, minimum.value, maximum.value),
);
const high = computed(() =>
  bounded(props.high, maximum.value, low.value, maximum.value),
);
const optimum = computed(() =>
  bounded(props.optimum, minimum.value, minimum.value, maximum.value),
);
const text = computed(
  () =>
    props.valueText ??
    `${formatAmount(amount.value)} / ${formatAmount(maximum.value, props.unit)}`,
);
</script>
<template>
  <div class="h-meter" part="base">
    <div class="h-meter-heading">
      <label :for="id">{{ label }}</label
      ><span part="value">{{ text }}</span>
    </div>
    <meter
      :id="id"
      :min="minimum"
      :max="maximum"
      :value="amount"
      :low="low"
      :high="high"
      :optimum="optimum"
      :aria-valuetext="text"
      :aria-describedby="description ? `${id}-help` : undefined"
      part="meter"
    />
    <p v-if="description" :id="`${id}-help`">{{ description }}</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-meter {
  min-width: 0;
  font: var(--h-font-size)/1.6 var(--h-font);
  color: var(--h-text);
}
.h-meter-heading {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.h-meter-heading span {
  color: var(--h-muted);
  font-variant-numeric: tabular-nums;
}
meter {
  display: block;
  width: 100%;
  height: 12px;
  appearance: none;
  background: var(--h-border);
  border-radius: var(--h-radius-pill);
  overflow: hidden;
  border: 0;
}
meter::-webkit-meter-bar {
  background: var(--h-border);
  border: 0;
  border-radius: var(--h-radius-pill);
}
meter::-webkit-meter-optimum-value {
  background: var(--h-success);
}
meter::-webkit-meter-suboptimum-value {
  background: var(--h-warning);
}
meter::-webkit-meter-even-less-good-value {
  background: var(--h-danger);
}
meter::-moz-meter-bar {
  background: var(--h-success);
}
meter:-moz-meter-sub-optimum::-moz-meter-bar {
  background: var(--h-warning);
}
meter:-moz-meter-sub-sub-optimum::-moz-meter-bar {
  background: var(--h-danger);
}
p {
  font-size: 12px;
  color: var(--h-muted);
  margin-top: 8px;
}
@media (forced-colors: active) {
  meter {
    appearance: auto;
  }
}
</style>
