<script setup lang="ts">
import { ref, onBeforeUnmount, nextTick, useId, watch } from "vue";
import HButton from "./HButton.vue";
import HIcon from "./HIcon.vue";
import { useMobileLayout } from "../mobile";
import { nextCollectionId, createTypeahead } from "../primitives";
import type { MenuAction } from "../themes";
const props = withDefaults(
  defineProps<{
    items: MenuAction[];
    label?: string;
    disabled?: boolean;
    mobileBreakpoint?: number;
  }>(),
  { items: () => [], label: "Context actions" },
);
const emit = defineEmits<{
  select: [id: string];
  "update:open": [open: boolean];
}>();
const visible = ref(false);
const panel = ref<HTMLElement>(),
  root = ref<HTMLElement>(),
  mobile = useMobileLayout(panel, () => props.mobileBreakpoint),
  id = useId(),
  typeahead = createTypeahead();
let invoker: HTMLElement | undefined;
function editableTarget(event: Event) {
  return event
    .composedPath()
    .some(
      (node) =>
        node instanceof HTMLElement &&
        node.matches("input,textarea,[contenteditable=true]"),
    );
}
async function show(event?: MouseEvent, last = false) {
  if (props.disabled || !panel.value) return;
  if (event && editableTarget(event)) return;
  event?.preventDefault();
  invoker =
    root.value?.getRootNode() instanceof ShadowRoot
      ? ((root.value.getRootNode() as ShadowRoot).activeElement as HTMLElement)
      : (document.activeElement as HTMLElement);
  panel.value.showPopover();
  visible.value = true;
  await nextTick();
  if (!mobile.value) {
    const anchor = root.value!.getBoundingClientRect(),
      box = panel.value.getBoundingClientRect();
    panel.value.style.left = `${Math.max(12, Math.min(event?.clientX ?? anchor.left, innerWidth - box.width - 12))}px`;
    panel.value.style.top = `${Math.max(12, Math.min(event?.clientY ?? anchor.bottom, innerHeight - box.height - 12))}px`;
  }
  const items = [
    ...panel.value.querySelectorAll<HTMLButtonElement>(
      "[role=menuitem]:not(:disabled)",
    ),
  ];
  (last ? items.at(-1) : items[0])?.focus();
}
function close() {
  visible.value = false;
  if (panel.value?.matches(":popover-open")) panel.value.hidePopover();
  if (invoker?.isConnected) invoker.focus({ preventScroll: true });
}
function key(event: KeyboardEvent) {
  if (event.isComposing) return;
  if (event.key === "Escape" || event.key === "Tab") {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
    }
    close();
    return;
  }
  const buttons = [
    ...(panel.value?.querySelectorAll<HTMLButtonElement>("[role=menuitem]") ||
      []),
  ];
  const items = buttons.map((button, index) => ({
      id: String(index),
      textValue: button.textContent || "",
      disabled: button.disabled,
    })),
    at = String(buttons.indexOf(event.target as HTMLButtonElement));
  const next = ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
    ? nextCollectionId(items, at, event.key, { wrap: true })
    : event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ? typeahead.search(items, event.key, at)
      : undefined;
  if (next) {
    event.preventDefault();
    buttons[Number(next)]?.focus();
  }
}
onBeforeUnmount(close);
watch(mobile, async () => {
  await nextTick();
  if (!panel.value?.matches(":popover-open")) return;
  panel.value.style.removeProperty("left");
  panel.value.style.removeProperty("top");
  if (!mobile.value && root.value) {
    const box = root.value.getBoundingClientRect();
    panel.value.style.left = `${Math.max(12, Math.min(box.left, innerWidth - panel.value.offsetWidth - 12))}px`;
    panel.value.style.top = `${Math.max(12, Math.min(box.bottom, innerHeight - panel.value.offsetHeight - 12))}px`;
  }
});
</script>
<template>
  <div
    ref="root"
    class="h-context-menu"
    part="base"
    @contextmenu="show"
    @keydown="
      $event.key === 'F10' &&
      $event.shiftKey &&
      !editableTarget($event) &&
      ($event.preventDefault(), show())
    "
  >
    <slot /><HButton
      :label="label"
      :disabled="disabled"
      icon="more"
      icon-only
      variant="ghost"
      aria-haspopup="menu"
      :aria-controls="`${id}-menu`"
      :aria-expanded="visible"
      @click="show()"
      @keydown.down.prevent="show()"
      @keydown.up.prevent="show(undefined, true)"
    />
    <div
      ref="panel"
      :id="id"
      popover="auto"
      class="h-context-panel h-mobile-overlay"
      :class="{ 'h-mobile': mobile }"
      part="panel"
      @toggle="
        visible = panel?.matches(':popover-open') || false;
        emit('update:open', visible);
      "
      @keydown="key"
    >
      <div v-if="mobile" class="h-overlay-header">
        <strong>{{ label }}</strong
        ><HButton
          icon="close"
          icon-only
          :label="`Close ${label}`"
          variant="ghost"
          @click="close"
        />
      </div>
      <div
        :id="`${id}-menu`"
        class="h-overlay-body"
        role="menu"
        :aria-label="label"
      >
        <button
          v-for="item in items"
          :key="item.id"
          type="button"
          role="menuitem"
          tabindex="-1"
          :disabled="item.disabled"
          :class="{ danger: item.danger }"
          @click="
            close();
            emit('select', item.id);
          "
        >
          <HIcon v-if="item.icon" :name="item.icon" :size="16" />{{
            item.label
          }}
        </button>
        <p v-if="!items.length">No actions available.</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/mobile-overlay.css";
.h-context-menu {
  min-width: 0;
}
.h-context-panel {
  position: fixed;
  inset: auto;
  margin: 0;
  min-width: 200px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 24px);
  overflow: auto;
  background: var(--h-raised);
  color: var(--h-text);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  padding: 4px;
  box-shadow: var(--h-shadow);
  font: 13px/1.8 var(--h-font);
}
[role="menuitem"] {
  display: flex;
  gap: 10px;
  align-items: center;
  min-height: 44px;
  width: 100%;
  border: 0;
  border-radius: 6px;
  padding: 10px;
  text-align: start;
  color: inherit;
  background: none;
  font: inherit;
  cursor: pointer;
}
[role="menuitem"]:hover,
[role="menuitem"]:focus-visible {
  background: var(--h-accent-subtle);
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.danger {
  color: var(--h-danger);
}
</style>
