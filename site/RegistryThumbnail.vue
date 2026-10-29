<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { examples } from "../scripts/agent-examples.mjs";
const props = defineProps<{ name: string; tag: string; category: string }>();
const host = ref<HTMLElement>();
let alive = true;
const schematic =
  ["Layouts", "Foundation"].includes(props.category) ||
  [
    "HDialog",
    "HSheet",
    "HCommandPalette",
    "HAlertDialog",
    "HToaster",
    "HContextMenu",
    "HVisuallyHidden",
  ].includes(props.name);
onMounted(async () => {
  if (schematic) return;
  const { registerElements } = await import("@hearth/elements");
  if (!alive || !host.value) return;
  registerElements();
  const example = examples[props.name];
  if (!example) return;
  const element = document.createElement(props.tag);
  Object.assign(element, example.props || {}, { open: false, active: false });
  if (example.children) element.innerHTML = example.children;
  const mount = document.createElement(example.mountTag || "div");
  mount.append(element);
  host.value.append(mount);
});
onBeforeUnmount(() => (alive = false));
</script>
<template>
  <div class="registry-thumbnail" aria-hidden="true" inert>
    <div v-if="schematic" class="thumbnail-frame">
      <div class="thumbnail-rail"><i /><i /><i /></div>
      <div class="thumbnail-page">
        <span /><span />
        <div><i /><i /><i /></div>
        <span />
      </div>
    </div>
    <div v-else ref="host" class="thumbnail-component" />
  </div>
</template>
<style scoped>
.registry-thumbnail {
  position: relative;
  height: 152px;
  width: 100%;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid var(--h-border);
  background: linear-gradient(135deg, var(--h-bg), var(--h-surface));
  pointer-events: none;
}
.thumbnail-component {
  width: 140%;
  max-height: 210px;
  transform: scale(0.65);
  transform-origin: center;
  padding: 20px;
}
.thumbnail-frame {
  display: flex;
  width: 76%;
  height: 100px;
  border: 1px solid var(--h-border-strong);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: var(--h-shadow-soft);
  background: var(--h-surface);
}
.thumbnail-rail {
  width: 22%;
  padding: 12px 8px;
  border-inline-end: 1px solid var(--h-border);
  display: grid;
  align-content: start;
  gap: 8px;
}
.thumbnail-rail i,
.thumbnail-page > span {
  display: block;
  height: 5px;
  border-radius: 2px;
  background: var(--h-border-strong);
  opacity: 0.6;
}
.thumbnail-rail i:first-child {
  background: var(--h-accent);
  opacity: 1;
}
.thumbnail-page {
  flex: 1;
  display: grid;
  align-content: start;
  gap: 9px;
  padding: 14px;
}
.thumbnail-page > span:first-child {
  width: 55%;
  background: var(--h-accent);
}
.thumbnail-page > div {
  display: flex;
  gap: 6px;
  height: 28px;
}
.thumbnail-page i {
  flex: 1;
  border: 1px solid var(--h-border);
  border-radius: 4px;
  background: var(--h-raised);
}
</style>
