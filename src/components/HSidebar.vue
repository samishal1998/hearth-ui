<script setup lang="ts">
import { ref, watch } from "vue";
import HBrand from "./HBrand.vue";
import HButton from "./HButton.vue";
import HNavList from "./HNavList.vue";
import type { NavItem, SidebarSection } from "../themes";
const props = withDefaults(
  defineProps<{
    brand?: string;
    logo?: string;
    items?: NavItem[];
    sections?: SidebarSection[];
    active?: string;
    label?: string;
    collapsed?: boolean;
    collapsible?: boolean;
  }>(),
  {
    brand: "hearth",
    items: () => [],
    sections: () => [],
    label: "Workspace",
    collapsible: true,
  },
);
const emit = defineEmits<{
  navigate: [id: string];
  "update:collapsed": [collapsed: boolean];
}>();
const compact = ref(props.collapsed);
watch(
  () => props.collapsed,
  (v) => (compact.value = v),
);
function toggle() {
  compact.value = !compact.value;
  emit("update:collapsed", compact.value);
}
</script>
<template>
  <aside
    class="h-sidebar-panel"
    :class="{ collapsed: compact }"
    part="base"
    :aria-label="label"
  >
    <div class="h-sidebar-heading" part="header">
      <slot name="header"
        ><HBrand v-if="!compact" :name="brand" :logo="logo" /><span
          v-else
          class="h-sidebar-initial"
          :aria-label="brand"
          >{{ brand.slice(0, 1).toUpperCase() }}<i>.</i></span
        ></slot
      >
    </div>
    <div class="h-sidebar-lists" part="navigation">
      <HNavList
        v-if="items.length"
        :items="items"
        :active="active"
        :label="label"
        :collapsed="compact"
        @navigate="emit('navigate', $event)"
      />
      <section v-for="section in sections" :key="section.label">
        <h2 :class="{ 'h-sr-only': compact }">{{ section.label }}</h2>
        <HNavList
          :items="section.items"
          :active="active"
          :label="section.label"
          :collapsed="compact"
          @navigate="emit('navigate', $event)"
        />
      </section>
      <slot />
    </div>
    <div class="h-sidebar-footer" part="footer">
      <slot name="footer" /><HButton
        v-if="collapsible"
        variant="ghost"
        icon="layout"
        :icon-only="compact"
        :label="compact ? 'Expand sidebar' : 'Collapse sidebar'"
        :aria-expanded="!compact"
        @click="toggle"
        >Collapse sidebar</HButton
      >
    </div>
  </aside>
</template>
<style scoped>
@import "../styles/base.css";
.h-sidebar-panel {
  display: flex;
  flex-direction: column;
  gap: 26px;
  width: var(--h-sidebar-width);
  min-height: var(--h-sidebar-height, 420px);
  padding: 24px 16px 16px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-panel);
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-sidebar-panel.collapsed {
  width: 80px;
  padding-inline: 10px;
}
.h-sidebar-heading {
  padding: 0 10px;
}
.h-sidebar-lists {
  display: grid;
  gap: 24px;
}
.h-sidebar-lists h2 {
  font-size: 10px;
  font-weight: 500;
  color: var(--h-muted);
  letter-spacing: 1.2px;
  text-transform: uppercase;
  padding-inline: 15px;
  margin-bottom: 10px;
}
.h-sidebar-footer {
  display: grid;
  gap: 12px;
  margin-top: auto;
}
.h-sidebar-footer > .h-button {
  justify-content: flex-start;
}
.collapsed .h-sidebar-footer > .h-button {
  justify-content: center;
  margin: 0 auto;
}
.h-sidebar-initial {
  font-size: 29px;
  font-weight: 650;
  letter-spacing: -1px;
}
.h-sidebar-initial i {
  font-style: normal;
  color: var(--h-accent);
}
</style>
