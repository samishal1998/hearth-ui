<script setup lang="ts">
import HIcon from "./HIcon.vue";
import { controlSync, safeHref } from "../internal";
defineOptions({ inheritAttrs: false });
withDefaults(
  defineProps<{
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "regular" | "compact";
    type?: "button" | "submit" | "reset";
    disabled?: boolean;
    loading?: boolean;
    icon?: string;
    trailingIcon?: string;
    label?: string;
    iconOnly?: boolean;
    href?: string;
    target?: string;
  }>(),
  { variant: "secondary", size: "regular", type: "button" },
);
const emit = defineEmits<{ "control-sync": [] }>();
controlSync(emit);
</script>
<template>
  <component
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
    ><span v-if="loading" class="h-spinner" aria-hidden="true" /><HIcon
      v-else-if="icon"
      :name="icon"
      :size="18" /><span v-if="!iconOnly" part="label"
      ><slot>{{ label }}</slot></span
    ><HIcon v-if="trailingIcon && !iconOnly" :name="trailingIcon" :size="18"
  /></component>
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
.h-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: h-spin 0.7s linear infinite;
}
@keyframes h-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
