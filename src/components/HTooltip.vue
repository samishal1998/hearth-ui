<script setup lang="ts">
import { ref, onBeforeUnmount, useId, watch } from "vue";
import HIcon from "./HIcon.vue";
import { useFloating } from "../floating";
const props = withDefaults(
  defineProps<{
    text: string;
    label?: string;
    icon?: string;
    placement?: "top" | "bottom" | "left" | "right";
    delay?: number;
    disabled?: boolean;
  }>(),
  { icon: "info", placement: "top", delay: 350 },
);
const anchor = ref<HTMLElement>();
const panel = ref<HTMLElement>();
const visible = ref(false);
const id = useId();
const hovering = ref(false);
const focused = ref(false);
let timer: ReturnType<typeof setTimeout> | undefined;
let described: HTMLElement | undefined;
let previous: string | null = null;
let applied = "";
useFloating(anchor, panel, visible, () => props.placement);
function restore() {
  if (described && described.getAttribute("aria-description") === applied) {
    if (previous === null) described.removeAttribute("aria-description");
    else described.setAttribute("aria-description", previous);
  }
  described = undefined;
}
function show(target?: HTMLElement) {
  if (props.disabled || !props.text) return;
  if (target && target !== described) {
    restore();
    described = target;
    previous = target.getAttribute("aria-description");
    applied = [previous, props.text].filter(Boolean).join(" ");
    target.setAttribute("aria-description", applied);
  }
  if (panel.value?.isConnected && !panel.value.matches(":popover-open"))
    panel.value.showPopover();
  visible.value = true;
}
function enter() {
  hovering.value = true;
  clearTimeout(timer);
  if (!visible.value)
    timer = setTimeout(() => show(), Math.max(0, props.delay));
}
function hide() {
  clearTimeout(timer);
  if (panel.value?.isConnected && panel.value.matches(":popover-open"))
    panel.value.hidePopover();
  visible.value = false;
  restore();
}
function leave() {
  hovering.value = false;
  clearTimeout(timer);
  if (!focused.value) timer = setTimeout(hide, 100);
}
function focus(e: FocusEvent) {
  focused.value = true;
  clearTimeout(timer);
  show(
    e.composedPath()[0] instanceof HTMLElement
      ? (e.composedPath()[0] as HTMLElement)
      : undefined,
  );
}
function blur() {
  focused.value = false;
  if (!hovering.value) hide();
}
function escape(e: KeyboardEvent) {
  if (e.key === "Escape" && visible.value) {
    e.preventDefault();
    e.stopPropagation();
    hide();
  }
}
watch(
  () => props.disabled,
  (v) => {
    if (v) hide();
  },
);
onBeforeUnmount(hide);
</script>
<template>
  <span
    ref="anchor"
    class="h-tooltip"
    part="base"
    @pointerenter="enter"
    @pointerleave="leave"
    @focusin="focus"
    @focusout="blur"
    @keydown="escape"
    ><slot
      ><button
        type="button"
        class="h-tooltip-trigger"
        :aria-label="label || text"
        :aria-describedby="id"
        :disabled="disabled"
        part="trigger"
      >
        <HIcon :name="icon" :size="18" /></button></slot
    ><span
      :id="id"
      ref="panel"
      class="h-tooltip-content"
      role="tooltip"
      popover="manual"
      part="content"
      @pointerenter="enter"
      @pointerleave="leave"
      >{{ text }}</span
    ></span
  >
</template>
<style scoped>
@import "../styles/base.css";
.h-tooltip {
  display: inline-flex;
  align-items: center;
}
.h-tooltip-trigger {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-muted);
}
.h-tooltip-content {
  position: fixed;
  inset: auto;
  margin: 0;
  max-width: min(280px, calc(100vw - 24px));
  padding: 8px 11px;
  border: 1px solid var(--h-border);
  border-radius: 7px;
  background: var(--h-raised);
  color: var(--h-text);
  font: 12px/1.6 var(--h-font);
  box-shadow: var(--h-shadow-soft);
}
</style>
