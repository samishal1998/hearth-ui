<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from "vue";
import HIcon from "./HIcon.vue";
import { safeHref } from "../internal";
import type { NavigationItem, NavItem } from "../themes";
withDefaults(
  defineProps<{ items: NavigationItem[]; active?: string; label?: string }>(),
  { items: () => [], label: "Main navigation" },
);
const emit = defineEmits<{ navigate: [id: string] }>();
const root = ref<HTMLElement>();
const alignEnd = ref(false);
function close(focus = false) {
  root.value
    ?.querySelectorAll<HTMLDetailsElement>("details[open]")
    .forEach((d) => {
      d.open = false;
      if (focus) d.querySelector("summary")?.focus();
    });
}
function escape(e: KeyboardEvent) {
  if (e.key === "Escape" && root.value?.querySelector("details[open]")) {
    e.preventDefault();
    e.stopPropagation();
    close(true);
  }
}
function outside(e: PointerEvent) {
  if (root.value && !e.composedPath().includes(root.value)) close();
}
onMounted(() =>
  root.value?.ownerDocument.addEventListener("pointerdown", outside),
);
onBeforeUnmount(() =>
  root.value?.ownerDocument.removeEventListener("pointerdown", outside),
);
function toggle(e: Event) {
  const details = e.currentTarget as HTMLDetailsElement;
  if (!details.open) return;
  root.value?.querySelectorAll<HTMLDetailsElement>("details").forEach((d) => {
    if (d !== details) d.open = false;
  });
  alignEnd.value =
    details.getBoundingClientRect().left +
      (details.querySelector(".h-menu-popup")?.getBoundingClientRect().width ||
        280) >
    window.innerWidth - 16;
}
function activate(item: NavItem, e: Event) {
  if (item.disabled) {
    e.preventDefault();
    return;
  }
  emit("navigate", item.id);
  close();
}
async function down(e: KeyboardEvent, disabled?: boolean) {
  if (disabled || e.key !== "ArrowDown") return;
  e.preventDefault();
  const details = (e.currentTarget as HTMLElement)
    .parentElement as HTMLDetailsElement;
  details.open = true;
  await nextTick();
  details
    .querySelector<HTMLElement>(
      '.h-menu-popup a:not([aria-disabled="true"]),.h-menu-popup button:not(:disabled)',
    )
    ?.focus();
}
</script>
<template>
  <nav
    ref="root"
    class="h-menu"
    part="base"
    :aria-label="label"
    @keydown="escape"
    @focusout="
      (e) => {
        if (!root?.contains(e.relatedTarget as Node)) close();
      }
    "
  >
    <template v-for="item in items" :key="item.id"
      ><details
        v-if="item.children?.length"
        :class="{ current: item.children.some((c) => c.id === active) }"
        @toggle="toggle"
      >
        <summary
          part="trigger"
          :aria-disabled="item.disabled || undefined"
          :tabindex="item.disabled ? -1 : 0"
          @click="
            (e) => {
              if (item.disabled) e.preventDefault();
            }
          "
          @keydown="down($event, item.disabled)"
        >
          <HIcon v-if="item.icon" :name="item.icon" :size="17" />{{ item.label
          }}<HIcon name="down" :size="14" />
        </summary>
        <div class="h-menu-popup" :class="{ end: alignEnd }" part="popup">
          <component
            :is="safeHref(child.href) ? 'a' : 'button'"
            v-for="child in item.children"
            :key="child.id"
            :href="child.disabled ? undefined : safeHref(child.href)"
            :type="safeHref(child.href) ? undefined : 'button'"
            :disabled="safeHref(child.href) ? undefined : child.disabled"
            :tabindex="child.disabled ? -1 : undefined"
            :aria-disabled="child.disabled || undefined"
            :aria-current="active === child.id ? 'page' : undefined"
            part="item"
            @click="activate(child, $event)"
            ><HIcon v-if="child.icon" :name="child.icon" :size="17" />{{
              child.label
            }}</component
          >
        </div>
      </details>
      <component
        :is="safeHref(item.href) ? 'a' : 'button'"
        v-else
        :href="item.disabled ? undefined : safeHref(item.href)"
        :type="safeHref(item.href) ? undefined : 'button'"
        :disabled="safeHref(item.href) ? undefined : item.disabled"
        :tabindex="item.disabled ? -1 : undefined"
        :aria-disabled="item.disabled || undefined"
        :aria-current="active === item.id ? 'page' : undefined"
        part="item"
        @click="activate(item, $event)"
        ><HIcon v-if="item.icon" :name="item.icon" :size="17" />{{
          item.label
        }}</component
      ></template
    >
  </nav>
</template>
<style scoped>
@import "../styles/base.css";
.h-menu {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-family: var(--h-font);
  min-width: 0;
}
details {
  position: relative;
}
a,
button,
summary {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 10px 13px;
  color: var(--h-muted);
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  border: 0;
  border-radius: var(--h-radius-control);
  background: none;
  cursor: pointer;
  list-style: none;
  white-space: nowrap;
}
summary::-webkit-details-marker {
  display: none;
}
a:hover,
button:hover,
summary:hover,
[aria-current="page"],
.current > summary,
details[open] > summary {
  color: var(--h-accent-text);
  background: var(--h-accent-subtle);
}
[aria-disabled="true"] {
  opacity: 0.45;
  cursor: not-allowed;
}
.h-menu-popup {
  position: absolute;
  z-index: 30;
  top: calc(100% + 7px);
  left: 0;
  min-width: 200px;
  width: min(280px, calc(100vw - 32px));
  padding: 6px;
  background: var(--h-raised);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  box-shadow: var(--h-shadow);
}
.h-menu-popup.end {
  left: auto;
  right: 0;
}
.h-menu-popup a,
.h-menu-popup button {
  width: 100%;
  text-align: left;
  white-space: normal;
}
</style>
