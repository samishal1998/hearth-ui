<script setup lang="ts">
import type { Tone } from "../themes";
withDefaults(defineProps<{ tone?: Tone; dot?: boolean; label?: string }>(), {
  tone: "neutral",
});
</script>
<template>
  <span class="h-badge" part="base" :class="tone"
    ><i v-if="dot" aria-hidden="true" /><slot>{{ label }}</slot></span
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
  font: 500 11px/1.5 var(--h-font);
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
</style>
