<script setup lang="ts">
import type { StepItem } from "../themes";
withDefaults(
  defineProps<{
    items: StepItem[];
    modelValue?: string;
    label?: string;
    interactive?: boolean;
    orientation?: "horizontal" | "vertical";
  }>(),
  { label: "Progress", orientation: "horizontal" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();
function select(id: string) {
  emit("update:modelValue", id);
  emit("change", id);
}
</script>
<template>
  <ol
    class="h-stepper"
    :class="orientation"
    :aria-label="label"
    role="list"
    part="base"
  >
    <li
      v-for="(item, index) in items"
      :key="item.id"
      :aria-current="item.id === modelValue ? 'step' : undefined"
      :class="{ current: item.id === modelValue, complete: item.completed }"
      part="item"
    >
      <component
        :is="interactive ? 'button' : 'div'"
        :type="interactive ? 'button' : undefined"
        :disabled="interactive ? item.disabled : undefined"
        class="h-step"
        part="step"
        @click="interactive && !item.disabled && select(item.id)"
        ><span class="h-step-number" aria-hidden="true" part="marker">{{
          item.completed ? "✓" : index + 1
        }}</span
        ><span class="h-step-copy"
          ><span class="h-step-title" part="title"
            >{{ item.label
            }}<span v-if="item.completed" class="h-sr-only">
              — Completed</span
            ></span
          ><span
            v-if="item.description"
            class="h-step-description"
            part="description"
            >{{ item.description }}</span
          ></span
        ></component
      >
    </li>
  </ol>
</template>
<style scoped>
@import "../styles/base.css";
.h-stepper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  list-style: none;
  padding: 0;
  margin: 0;
  font: 13px/1.7 var(--h-font);
  color: var(--h-muted);
}
li {
  min-width: 0;
  flex: 1 1 140px;
}
.vertical {
  flex-direction: column;
}
.vertical li {
  flex-basis: auto;
}
.h-step {
  display: flex;
  align-items: center;
  gap: 10px;
  text-align: start;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  padding: 10px 12px;
  min-height: 44px;
  width: 100%;
  background: transparent;
  color: inherit;
  font: inherit;
}
.h-step-number {
  display: grid;
  place-items: center;
  flex: 0 0 26px;
  height: 26px;
  background: var(--h-surface);
  border-radius: 50%;
  font-variant-numeric: tabular-nums;
}
.h-step-copy {
  min-width: 0;
  overflow-wrap: anywhere;
}
.h-step-title {
  display: block;
  font-weight: 550;
}
.h-step-description {
  display: block;
  font-size: 11px;
}
.current {
  color: var(--h-text);
}
.current .h-step {
  border-color: var(--h-accent-text);
  background: var(--h-accent-subtle);
}
.complete .h-step-number {
  color: var(--h-success);
}
button {
  cursor: pointer;
}
button:hover:not(:disabled) {
  background: var(--h-raised);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
