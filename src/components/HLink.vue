<script setup lang="ts">
import { safeHref } from "../internal";
defineProps<{ href: string; target?: string; disabled?: boolean }>();
</script>
<template>
  <a
    :href="disabled ? undefined : safeHref(href)"
    :target="target"
    :rel="target === '_blank' ? 'noopener noreferrer' : undefined"
    :aria-disabled="disabled || undefined"
    :tabindex="disabled ? -1 : undefined"
    class="h-link"
    part="base"
    @click="disabled && $event.preventDefault()"
    ><slot
  /></a>
</template>
<style scoped>
@import "../styles/base.css";
.h-link {
  color: var(--h-accent-text);
  font: inherit;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
.h-link:hover {
  text-decoration-thickness: 2px;
}
.h-link[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
