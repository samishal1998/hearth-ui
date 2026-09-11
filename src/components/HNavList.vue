<script setup lang="ts">
import HIcon from "./HIcon.vue";
import { safeHref } from "../internal";
import type { NavItem } from "../themes";
defineProps<{ items: NavItem[]; active?: string }>();
const emit = defineEmits<{ navigate: [id: string] }>();
</script>
<template>
  <nav aria-label="Workspace" class="h-navigation">
    <component
      :is="safeHref(item.href) ? 'a' : 'button'"
      v-for="item in items"
      :key="item.id"
      :href="item.disabled ? undefined : safeHref(item.href)"
      :type="safeHref(item.href) ? undefined : 'button'"
      :disabled="safeHref(item.href) ? undefined : item.disabled"
      :aria-disabled="item.disabled || undefined"
      :tabindex="item.disabled ? -1 : undefined"
      :aria-current="active === item.id ? 'page' : undefined"
      :class="{ active: active === item.id }"
      @click="
        (e: Event) => {
          if (item.disabled) {
            e.preventDefault();
            return;
          }
          emit('navigate', item.id);
        }
      "
      ><HIcon v-if="item.icon" :name="item.icon" :size="18" /><span>{{
        item.label
      }}</span
      ><small v-if="item.badge !== undefined">{{
        item.badge
      }}</small></component
    >
  </nav>
</template>
<style scoped>
@import "../styles/base.css";
.h-navigation {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-family: var(--h-font);
}
a,
button {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 15px;
  min-height: 46px;
  border: 1px solid transparent;
  border-radius: var(--h-radius-control);
  color: var(--h-muted);
  background: none;
  font-size: 13px;
  text-decoration: none;
  text-align: left;
  transition:
    background var(--h-motion),
    color var(--h-motion);
}
a:hover,
button:hover {
  background: var(--h-surface);
  color: var(--h-text);
}
.active {
  background: var(--h-accent-subtle);
  border-color: color-mix(in srgb, var(--h-accent) 13%, transparent);
  color: var(--h-accent-text);
}
small {
  margin-left: auto;
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 5px;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  font-variant-numeric: tabular-nums;
}
[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
