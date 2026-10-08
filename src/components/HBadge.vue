<script setup lang="ts">
import type { Tone, IconValue } from "../themes";
import HIcon from "./HIcon.vue";
withDefaults(
  defineProps<{
    tone?: Tone;
    dot?: boolean;
    label?: string;
    icon?: IconValue;
    size?: "sm" | "md";
    variant?: "soft" | "outline" | "dashed";
  }>(),
  {
    tone: "neutral",
    size: "sm",
    variant: "soft",
  },
);
</script>
<template>
  <span class="h-badge" part="base" :class="[tone, size, variant]"
    ><i v-if="dot" aria-hidden="true" /><slot name="icon"
      ><HIcon v-if="icon" :name="icon" :size="14" /></slot
    ><slot>{{ label }}</slot></span
  >
</template>
<style scoped>
.h-badge {
  --badge-color: var(--h-muted);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 8px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--badge-color) 10%, transparent);
  color: var(--badge-color);
  font: 500 max(var(--h-font-min-size, 12px), 11px)/1.5 var(--h-font);
  white-space: nowrap;
}
.accent {
  --badge-color: var(--h-accent-text);
}
.success {
  --badge-color: var(--h-success);
}
.warning {
  --badge-color: var(--h-warning);
}
.danger {
  --badge-color: var(--h-danger);
}
.info {
  --badge-color: var(--h-info);
}
i {
  width: 5px;
  height: 5px;
  flex-shrink: 0;
  border-radius: 50%;
  background: currentColor;
}
.outline,
.dashed {
  background: transparent;
  border: 1px solid var(--badge-color);
}
.dashed {
  border-style: dashed;
}
.md {
  padding: 5px 10px;
  font-size: max(var(--h-font-min-size, 12px), 13px);
}
</style>
