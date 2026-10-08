<script setup lang="ts">
import HIcon from "./HIcon.vue";
import type { Tone, IconValue } from "../themes";
withDefaults(
  defineProps<{
    label: string;
    value: string | number;
    detail?: string;
    icon?: IconValue;
    tone?: Tone;
  }>(),
  { icon: "apps", tone: "accent" },
);
</script>
<template>
  <div class="h-stat" part="base" :class="tone">
    <span class="h-stat-icon" part="icon" aria-hidden="true"
      ><slot name="icon"><HIcon :name="icon" /></slot
    ></span>
    <div>
      <strong part="value"
        >{{ value
        }}<slot name="detail"
          ><small v-if="detail">{{ detail }}</small></slot
        ></strong
      ><span class="h-stat-label" part="label">{{ label }}</span>
    </div>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-stat {
  --stat-color: var(--h-accent-text);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: var(--h-card-padding);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
}
.h-stat-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: calc(var(--h-radius-control) + 2px);
  background: color-mix(in srgb, var(--stat-color) 10%, transparent);
  color: var(--stat-color);
}
.success {
  --stat-color: var(--h-success);
}
.warning {
  --stat-color: var(--h-warning);
}
.danger {
  --stat-color: var(--h-danger);
}
.info {
  --stat-color: var(--h-info);
}
.neutral {
  --stat-color: var(--h-muted);
}
strong {
  display: block;
  font-size: 25px;
  font-weight: 550;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
small {
  margin-left: 5px;
  font-size: max(var(--h-font-min-size, 12px), 12px);
  color: var(--h-muted);
  font-weight: 400;
}
.h-stat-label {
  display: block;
  margin-top: 5px;
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
}
.h-stat-icon :deep(svg),
.h-stat-icon :slotted(svg) {
  max-width: 24px;
  max-height: 24px;
}
</style>
