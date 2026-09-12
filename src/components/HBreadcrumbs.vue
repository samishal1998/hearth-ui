<script setup lang="ts">
import type { NavItem } from "../themes";
import { safeHref } from "../internal";
withDefaults(defineProps<{ items: NavItem[]; label?: string }>(), {
  items: () => [],
  label: "Breadcrumb",
});
const emit = defineEmits<{ navigate: [id: string] }>();
</script>
<template>
  <nav class="h-breadcrumbs" :aria-label="label" part="base">
    <ol>
      <li v-for="(item, i) in items" :key="item.id">
        <span v-if="i" class="h-crumb-separator" aria-hidden="true">/</span
        ><span
          v-if="i === items.length - 1 || item.disabled"
          :aria-current="i === items.length - 1 ? 'page' : undefined"
          part="current"
          >{{ item.label }}</span
        ><component
          v-else
          :is="safeHref(item.href) ? 'a' : 'button'"
          :href="safeHref(item.href)"
          :type="safeHref(item.href) ? undefined : 'button'"
          part="item"
          @click="emit('navigate', item.id)"
          >{{ item.label }}</component
        >
      </li>
    </ol>
  </nav>
</template>
<style scoped>
@import "../styles/base.css";
.h-breadcrumbs {
  font-family: var(--h-font);
  font-size: 12px;
  min-width: 0;
}
ol {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px 12px;
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 40px;
  color: var(--h-text);
}
a,
button {
  border: 0;
  background: none;
  color: var(--h-muted);
  font-size: inherit;
  padding: 8px 0;
  text-decoration: none;
  overflow-wrap: anywhere;
}
a:hover,
button:hover {
  color: var(--h-accent-text);
}
li > span {
  overflow-wrap: anywhere;
}
.h-crumb-separator {
  color: var(--h-faint);
}
</style>
