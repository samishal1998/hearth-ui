<script setup lang="ts">
import HIcon from "./HIcon.vue";
import { ref } from "vue";
import type { IconValue } from "../themes";
import { useSlotPresence } from "../slots";
import { controlSync, safeHref } from "../internal";
defineOptions({ inheritAttrs: false });
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "regular" | "compact";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    icon?: IconValue;
    trailingIcon?: IconValue;
    label?: string;
    iconOnly?: boolean;
    href?: string;
    target?: string;
  }>(),
  { variant: "secondary", size: "regular", type: "button" },
);
const emit = defineEmits<{ "control-sync": [] }>();
const root = ref<HTMLElement>();
const hasSlot = useSlotPresence(() => root.value);
controlSync(emit);
</script>
<template>
  <component
    ref="root"
    :is="safeHref(href) ? 'a' : 'button'"
    v-bind="$attrs"
    class="h-button"
    part="control"
    :class="[variant, size, { 'icon-only': iconOnly }]"
    :href="disabled || loading ? undefined : safeHref(href)"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :type="safeHref(href) ? undefined : type"
    :disabled="safeHref(href) ? undefined : disabled || loading"
    :aria-disabled="disabled || loading || undefined"
    :aria-busy="loading || undefined"
    :aria-label="label ?? ($attrs['aria-label'] as string | undefined)"
    :tabindex="href && (disabled || loading) ? -1 : undefined"
    @click="
      (e: MouseEvent) => {
        if (disabled || loading) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      }
    "
    ><span v-if="loading" class="h-spinner" aria-hidden="true" />
    <span
      v-else-if="iconOnly"
      class="h-button-icon"
      part="icon"
      aria-hidden="true"
      ><slot name="icon"
        ><HIcon v-if="icon" :name="icon" :size="18" /><slot v-else /></slot
    ></span>
    <span
      v-else-if="icon || hasSlot('icon')"
      class="h-button-icon"
      part="icon"
      aria-hidden="true"
      ><slot name="icon"><HIcon :name="icon" :size="18" /></slot
    ></span>
    <span v-if="!iconOnly" part="label"
      ><slot>{{ label }}</slot></span
    >
    <span
      v-if="!iconOnly && (trailingIcon || hasSlot('trailing-icon'))"
      class="h-button-icon"
      part="trailing-icon"
      aria-hidden="true"
      ><slot name="trailing-icon"
        ><HIcon :name="trailingIcon" :size="18" /></slot
    ></span>
  </component>
</template>
<style scoped>
@import "../styles/base.css";
.h-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  min-height: var(--h-control-height);
  padding: 9px var(--h-control-padding);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-text);
  font-family: var(--h-font);
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  line-height: 1.4;
  white-space: nowrap;
  transition:
    background var(--h-motion),
    border-color var(--h-motion),
    transform var(--h-motion);
}
.h-button:hover {
  border-color: var(--h-border-strong);
  background: var(--h-raised);
}
.h-button:active {
  transform: scale(0.96);
}
.primary {
  background: var(--h-accent);
  border-color: var(--h-accent);
  color: var(--h-on-accent);
  box-shadow: 0 3px 15px var(--h-accent-subtle);
}
.primary:hover {
  background: var(--h-accent-hover);
  border-color: var(--h-accent-hover);
}
.ghost {
  background: transparent;
  border-color: transparent;
  color: var(--h-muted);
}
.ghost:hover {
  background: var(--h-accent-subtle);
  color: var(--h-text);
  border-color: transparent;
}
.danger {
  background: color-mix(in srgb, var(--h-danger) 10%, var(--h-surface));
  color: var(--h-danger);
  border-color: color-mix(in srgb, var(--h-danger) 30%, transparent);
}
.compact {
  min-height: 40px;
  font-size: 12px;
  padding: 7px 12px;
}
.icon-only {
  width: var(--h-control-height);
  min-width: 40px;
  min-height: 40px;
  padding: 8px;
}
.h-button:disabled,
.h-button[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
.h-button-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  line-height: 0;
}
.h-button-icon :deep(svg),
.h-button-icon :slotted(svg) {
  max-width: 24px;
  max-height: 24px;
}
.h-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: h-spin 0.7s linear infinite;
}
@media (pointer: coarse) {
  .h-button.compact,
  .h-button.icon-only {
    min-height: 44px;
    min-width: 44px;
  }
}
@keyframes h-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
