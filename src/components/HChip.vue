<script setup lang="ts">
import HIcon from "./HIcon.vue";
import type { Tone } from "../themes";
withDefaults(
  defineProps<{
    label: string;
    value?: string;
    selected?: boolean;
    selectable?: boolean;
    removable?: boolean;
    disabled?: boolean;
    tone?: Tone;
  }>(),
  { tone: "neutral" },
);
const emit = defineEmits<{
  select: [value: string];
  remove: [value: string];
}>();
</script>
<template>
  <span class="h-chip" :class="[tone, { selected, disabled }]" part="base"
    ><button
      v-if="selectable"
      type="button"
      class="h-chip-label"
      :aria-pressed="!!selected"
      :disabled="disabled"
      part="label"
      @click="emit('select', value ?? label)"
    >
      {{ label }}</button
    ><span v-else class="h-chip-label" part="label">{{ label }}</span
    ><button
      v-if="removable"
      type="button"
      class="h-chip-remove"
      :aria-label="`Remove ${label}`"
      :disabled="disabled"
      part="remove"
      @click="emit('remove', value ?? label)"
    >
      <HIcon name="close" :size="14" /></button
  ></span>
</template>
<style scoped>
@import "../styles/base.css";
.h-chip {
  --chip-color: var(--h-muted);
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-pill);
  background: var(--h-surface);
  color: var(--chip-color);
  font: 12px var(--h-font);
}
.accent,
.selected {
  --chip-color: var(--h-accent-text);
  background: var(--h-accent-subtle);
  border-color: color-mix(in srgb, var(--h-accent) 30%, var(--h-border));
}
.success {
  --chip-color: var(--h-success);
}
.warning {
  --chip-color: var(--h-warning);
}
.danger {
  --chip-color: var(--h-danger);
}
.info {
  --chip-color: var(--h-info);
}
.h-chip-label {
  padding: 9px 13px;
  min-height: 38px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  border-radius: inherit;
  overflow-wrap: anywhere;
}
.h-chip-remove {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: inherit;
  flex-shrink: 0;
}
.h-chip:has(.h-chip-remove) .h-chip-label {
  padding-right: 4px;
}
.disabled {
  opacity: 0.5;
}
</style>
