<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import HButton from "./HButton.vue";
import HIcon from "./HIcon.vue";
import { useFloating } from "../floating";
import type { MenuAction } from "../themes";
const props = withDefaults(
  defineProps<{
    items: MenuAction[];
    label?: string;
    icon?: string;
    open?: boolean;
    disabled?: boolean;
    placement?: "top" | "bottom" | "left" | "right";
  }>(),
  { items: () => [], label: "Actions", placement: "bottom" },
);
const emit = defineEmits<{
  select: [id: string];
  "update:open": [open: boolean];
}>();
const trigger = ref<InstanceType<typeof HButton>>();
const anchor = ref<HTMLElement>();
const panel = ref<HTMLElement>();
const visible = ref(false);
const id = useId();
useFloating(anchor, panel, visible, () => props.placement);
const choices = () => [
  ...(panel.value?.querySelectorAll<HTMLButtonElement>(
    "[role=menuitem]:not(:disabled)",
  ) || []),
];
async function show(last = false) {
  if (props.disabled) return;
  panel.value?.showPopover();
  visible.value = true;
  await nextTick();
  const buttons = choices();
  (last ? buttons.at(-1) : buttons[0])?.focus();
}
function close(focus = true) {
  panel.value?.hidePopover();
  if (focus) anchor.value?.focus();
}
function toggle() {
  visible.value = panel.value?.matches(":popover-open") || false;
  emit("update:open", visible.value);
}
function pick(action: MenuAction) {
  if (action.disabled) return;
  close();
  emit("select", action.id);
}
function key(e: KeyboardEvent) {
  const buttons = choices();
  const at = buttons.indexOf(e.target as HTMLButtonElement);
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const n =
      e.key === "Home"
        ? 0
        : e.key === "End"
          ? buttons.length - 1
          : (at + (e.key === "ArrowDown" ? 1 : -1) + buttons.length) %
            buttons.length;
    buttons[n]?.focus();
  } else if (e.key === "Escape") {
    e.preventDefault();
    e.stopPropagation();
    close();
  } else if (e.key === "Tab") {
    close();
  } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
    const ordered = [...buttons.slice(at + 1), ...buttons.slice(0, at + 1)];
    ordered
      .find((b) =>
        b.textContent?.trim().toLowerCase().startsWith(e.key.toLowerCase()),
      )
      ?.focus();
  }
}
onMounted(() => {
  anchor.value = trigger.value?.$el;
  if (props.open) show();
});
watch(
  () => props.open,
  (v) => (v ? show() : close(false)),
);
watch(
  () => props.disabled,
  (v) => {
    if (v) close(false);
  },
);
onBeforeUnmount(() => close(false));
</script>
<template>
  <span class="h-dropdown" part="base"
    ><HButton
      ref="trigger"
      :icon="icon"
      trailing-icon="down"
      :disabled="disabled"
      aria-haspopup="menu"
      :aria-expanded="visible"
      :aria-controls="id"
      @click="visible ? close() : show()"
      @keydown.down.prevent="show()"
      @keydown.up.prevent="show(true)"
      >{{ label }}</HButton
    >
    <div
      :id="id"
      ref="panel"
      popover="auto"
      class="h-dropdown-panel"
      role="menu"
      :aria-label="label"
      part="menu"
      @toggle="toggle"
      @keydown="key"
    >
      <template v-for="action in items" :key="action.id"
        ><hr v-if="action.separatorBefore" role="separator" />
        <button
          type="button"
          role="menuitem"
          tabindex="-1"
          :disabled="action.disabled"
          :class="{ danger: action.danger }"
          part="item"
          @click="pick(action)"
        >
          <HIcon v-if="action.icon" :name="action.icon" :size="16" /><span>{{
            action.label
          }}</span
          ><kbd v-if="action.shortcut">{{ action.shortcut }}</kbd>
        </button></template
      >
      <p v-if="!items.length" class="h-menu-empty">No actions available.</p>
    </div></span
  >
</template>
<style scoped>
@import "../styles/base.css";
.h-dropdown {
  display: inline-block;
}
.h-dropdown-panel {
  position: fixed;
  inset: auto;
  margin: 0;
  min-width: 200px;
  max-width: calc(100vw - 24px);
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 5px;
  background: var(--h-raised);
  color: var(--h-text);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  font-family: var(--h-font);
  box-shadow: var(--h-shadow);
}
[role="menuitem"] {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  width: 100%;
  padding: 9px 12px;
  background: none;
  border: 0;
  border-radius: 6px;
  color: var(--h-text);
  font-size: 12px;
  text-align: left;
}
[role="menuitem"]:hover,
[role="menuitem"]:focus-visible {
  background: var(--h-accent-subtle);
}
[role="menuitem"]:disabled {
  opacity: 0.45;
}
.danger {
  color: var(--h-danger) !important;
}
kbd {
  margin-left: auto;
  font: 10px var(--h-font-mono);
  color: var(--h-muted);
}
hr {
  border: 0;
  border-top: 1px solid var(--h-border);
  margin: 5px;
}
.h-menu-empty {
  padding: 12px;
  font-size: 12px;
  color: var(--h-muted);
}
</style>
