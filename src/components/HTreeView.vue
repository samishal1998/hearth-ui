<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import HIcon from "./HIcon.vue";
import type { TreeItem } from "../themes";
import { nextCollectionId, createTypeahead } from "../primitives";
const props = withDefaults(
  defineProps<{
    items: TreeItem[];
    modelValue?: string;
    expanded?: string[];
    defaultExpanded?: string[];
    label: string;
    disabled?: boolean;
  }>(),
  { items: () => [] },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "update:expanded": [ids: string[]];
  activate: [id: string];
}>();
const local = ref(props.modelValue || ""),
  open = ref([...(props.expanded ?? props.defaultExpanded ?? [])]),
  active = ref(""),
  root = ref<HTMLElement>(),
  typeahead = createTypeahead();
watch(
  () => props.modelValue,
  (value) => (local.value = value || ""),
);
watch(
  () => props.expanded,
  (value) => {
    if (value) open.value = [...value];
  },
);
const visible = computed(() => {
  const result: {
    item: TreeItem;
    depth: number;
    parent?: string;
    position: number;
    size: number;
    disabled: boolean;
  }[] = [];
  function walk(
    items: TreeItem[],
    depth: number,
    parent?: string,
    blocked = false,
  ) {
    items.forEach((item, index) => {
      const disabled = blocked || !!item.disabled || !!props.disabled;
      result.push({
        item,
        depth,
        parent,
        position: index + 1,
        size: items.length,
        disabled,
      });
      if (item.children?.length && open.value.includes(item.id))
        walk(item.children, depth + 1, item.id, disabled);
    });
  }
  walk(props.items, 1);
  return result;
});
const focusId = computed(() =>
  visible.value.some((node) => node.item.id === active.value && !node.disabled)
    ? active.value
    : visible.value.find(
        (node) => node.item.id === local.value && !node.disabled,
      )?.item.id || visible.value.find((node) => !node.disabled)?.item.id,
);
function expand(id: string, value: boolean) {
  open.value = value
    ? [...new Set([...open.value, id])]
    : open.value.filter((key) => key !== id);
  emit("update:expanded", [...open.value]);
}
async function focus(id: string | undefined) {
  if (!id) return;
  active.value = id;
  await nextTick();
  root.value
    ?.querySelector<HTMLButtonElement>(`[data-id="${CSS.escape(id)}"]`)
    ?.focus();
}
function choose(node: (typeof visible.value)[number]) {
  if (node.disabled) return;
  local.value = node.item.id;
  active.value = node.item.id;
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
async function key(event: KeyboardEvent, node: (typeof visible.value)[number]) {
  if (event.isComposing || node.disabled) return;
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  const outward = rtl ? "ArrowLeft" : "ArrowRight",
    inward = rtl ? "ArrowRight" : "ArrowLeft";
  if (event.key === outward) {
    event.preventDefault();
    if (node.item.children?.length) {
      if (!open.value.includes(node.item.id)) expand(node.item.id, true);
      else
        focus(
          visible.value.find(
            (candidate) =>
              candidate.parent === node.item.id && !candidate.disabled,
          )?.item.id,
        );
    }
    return;
  }
  if (event.key === inward) {
    event.preventDefault();
    if (open.value.includes(node.item.id)) expand(node.item.id, false);
    else focus(node.parent);
    return;
  }
  if (["Enter", " "].includes(event.key)) {
    event.preventDefault();
    choose(node);
    if (event.key === "Enter") emit("activate", node.item.id);
    return;
  }
  const collection = visible.value.map((node) => ({
    id: node.item.id,
    textValue: node.item.label,
    disabled: node.disabled,
  }));
  const next = ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
    ? nextCollectionId(collection, node.item.id, event.key)
    : event.key.length === 1 && !event.ctrlKey && !event.metaKey
      ? typeahead.search(collection, event.key, node.item.id)
      : undefined;
  if (next) {
    event.preventDefault();
    focus(next);
  }
}
watch(visible, async (value, old) => {
  const previous = active.value;
  const tree = root.value?.getRootNode();
  const focused =
    typeof document === "undefined"
      ? null
      : tree instanceof ShadowRoot
        ? tree.activeElement
        : document.activeElement;
  const ownedFocus = !!focused && !!root.value?.contains(focused);
  if (
    previous &&
    !value.some((node) => node.item.id === previous && !node.disabled)
  ) {
    const parent = old?.find((node) => node.item.id === previous)?.parent;
    active.value =
      value.find((node) => node.item.id === parent && !node.disabled)?.item
        .id ||
      value.find((node) => !node.disabled)?.item.id ||
      "";
    await nextTick();
    if (ownedFocus) focus(active.value);
  }
});
</script>
<template>
  <div
    ref="root"
    role="tree"
    :aria-label="label"
    :aria-disabled="disabled || undefined"
    class="h-tree"
    part="base"
  >
    <button
      v-for="node in visible"
      :key="node.item.id"
      :data-id="node.item.id"
      role="treeitem"
      type="button"
      :aria-level="node.depth"
      :aria-posinset="node.position"
      :aria-setsize="node.size"
      :aria-expanded="
        node.item.children?.length ? open.includes(node.item.id) : undefined
      "
      :aria-selected="local === node.item.id"
      :disabled="node.disabled"
      :tabindex="node.item.id === focusId ? 0 : -1"
      :style="{ paddingInlineStart: `${12 + (node.depth - 1) * 20}px` }"
      part="item"
      @focus="active = node.item.id"
      @keydown="key($event, node)"
      @click="choose(node)"
    >
      <span
        class="h-tree-indicator"
        @click.stop="
          !node.disabled &&
          node.item.children?.length &&
          expand(node.item.id, !open.includes(node.item.id))
        "
        ><HIcon
          v-if="node.item.children?.length"
          :name="open.includes(node.item.id) ? 'down' : 'right'"
          :size="14" /></span
      ><slot :name="`item:${node.item.id}`" :item="node.item">{{
        node.item.label
      }}</slot>
    </button>
    <p v-if="!visible.length">No items.</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-tree {
  min-width: 0;
  color: var(--h-text);
  font: 13px/1.8 var(--h-font);
}
button {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: var(--h-radius-control);
  text-align: start;
  font: inherit;
  background: none;
  color: inherit;
  cursor: pointer;
}
button[aria-selected="true"],
button:hover {
  background: var(--h-accent-subtle);
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.h-tree-indicator {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}
.h-tree-indicator:dir(rtl) > .h-icon {
  transform: scaleX(-1);
}
p {
  color: var(--h-muted);
}
</style>
