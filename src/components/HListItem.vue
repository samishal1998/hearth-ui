<script setup lang="ts">
import HIcon from "./HIcon.vue";
import HBadge from "./HBadge.vue";
import { safeHref } from "../internal";
import type { Tone } from "../themes";
withDefaults(
  defineProps<{
    title: string;
    description?: string;
    icon?: string;
    badge?: string;
    tone?: Tone;
    href?: string;
    interactive?: boolean;
    disabled?: boolean;
    selected?: boolean;
  }>(),
  { tone: "neutral" },
);
const emit = defineEmits<{ activate: [] }>();
</script>
<template>
  <li
    class="h-list-item"
    role="listitem"
    :class="{ selected, disabled }"
    part="base"
  >
    <component
      :is="safeHref(href) ? 'a' : interactive ? 'button' : 'div'"
      class="h-list-body"
      :type="interactive && !safeHref(href) ? 'button' : undefined"
      :href="disabled ? undefined : safeHref(href)"
      :disabled="interactive && !safeHref(href) ? disabled : undefined"
      :aria-disabled="disabled || undefined"
      :tabindex="disabled && href ? -1 : undefined"
      part="content"
      @click="
        (e: MouseEvent) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          if (interactive || href) emit('activate');
        }
      "
      ><slot name="leading"><HIcon v-if="icon" :name="icon" /></slot
      ><span class="h-list-copy"
        ><strong part="title">{{ title }}</strong
        ><small v-if="description" part="description">{{
          description
        }}</small></span
      ><slot name="trailing"
        ><HBadge v-if="badge" :label="badge" :tone="tone" /></slot></component
    ><slot name="actions" />
  </li>
</template>
<style scoped>
@import "../styles/base.css";
.h-list-item {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  border-bottom: 1px solid var(--h-list-divider, var(--h-border));
  font-family: var(--h-font);
  color: var(--h-text);
}
.h-list-body {
  display: flex;
  align-items: center;
  gap: 13px;
  flex: 1;
  min-width: 0;
  width: 100%;
  padding: 15px 8px;
  background: none;
  border: 0;
  border-radius: var(--h-radius-control);
  color: inherit;
  text-align: left;
  text-decoration: none;
}
.h-list-copy {
  flex: 1;
  min-width: 0;
}
strong {
  display: block;
  font-size: 13px;
  font-weight: 550;
  overflow-wrap: anywhere;
}
small {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.7;
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.h-list-body > .h-icon {
  color: var(--h-muted);
}
a.h-list-body:hover,
button.h-list-body:hover,
.selected .h-list-body {
  background: var(--h-accent-subtle);
}
.disabled {
  opacity: 0.5;
}
</style>
