<script setup lang="ts">
import HIcon from "./HIcon.vue";
import { safeHref } from "../internal";
import type { NavItem } from "../themes";
withDefaults(
  defineProps<{
    items: NavItem[];
    active?: string;
    label?: string;
    collapsed?: boolean;
  }>(),
  { label: "Workspace" },
);
const emit = defineEmits<{ navigate: [id: string] }>();
</script>
<template>
  <nav
    :aria-label="label"
    class="h-navigation"
    :class="{ collapsed }"
    part="base"
  >
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
      :aria-label="collapsed ? item.label : undefined"
      :title="collapsed ? item.label : undefined"
      part="item"
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
      ><HIcon
        v-if="item.icon || collapsed"
        :name="item.icon || 'apps'"
        :size="18"
      /><span>{{ item.label }}</span
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
.collapsed a,
.collapsed button {
  justify-content: center;
  padding: 10px;
  min-height: 44px;
}
.collapsed a > span,
.collapsed button > span,
.collapsed small {
  display: none;
}
</style>
