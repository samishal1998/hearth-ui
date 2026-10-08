<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import HButton from "./HButton.vue";
import type { IconValue } from "../themes";
import { useFloating, focusFirst } from "../floating";
import { useMobileLayout } from "../mobile";
import { useSlotPresence } from "../slots";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    label?: string;
    title?: string;
    icon?: IconValue;
    iconOnly?: boolean;
    panelLabel?: string;
    placement?: "top" | "bottom" | "left" | "right";
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost";
    mobileBreakpoint?: number;
  }>(),
  { label: "Options", placement: "bottom", variant: "secondary" },
);
const emit = defineEmits<{ "update:open": [open: boolean]; close: [] }>();
const trigger = ref<InstanceType<typeof HButton>>();
const anchor = ref<HTMLElement>();
const panel = ref<HTMLElement>();
const body = ref<HTMLElement>();
const mobile = useMobileLayout(panel, () => props.mobileBreakpoint);
const visible = ref(false);
const id = useId();
const hasSlot = useSlotPresence(() => panel.value?.parentElement ?? undefined);
useFloating(
  anchor,
  panel,
  visible,
  () => props.placement,
  () => mobile.value,
);
async function show() {
  if (props.disabled || !panel.value) return;
  panel.value.showPopover();
  visible.value = true;
  await nextTick();
  if (body.value) focusFirst(body.value);
}
function hide(focus = false) {
  panel.value?.hidePopover();
  if (focus) anchor.value?.focus();
}
function sync() {
  if (props.open) show();
  else hide();
}
onMounted(() => {
  anchor.value = trigger.value?.$el;
  sync();
});
watch(() => props.open, sync);
watch(
  () => props.disabled,
  (v) => {
    if (v) hide();
  },
);
onBeforeUnmount(() => hide());
function toggle() {
  const next = panel.value?.matches(":popover-open") || false;
  visible.value = next;
  emit("update:open", next);
  if (!next) emit("close");
}
</script>
<template>
  <span class="h-popover" part="base"
    ><HButton
      ref="trigger"
      :variant="variant"
      :icon="icon"
      :icon-only="iconOnly"
      :label="label"
      :disabled="disabled"
      :aria-expanded="visible"
      :aria-controls="id"
      aria-haspopup="dialog"
      @click="visible ? hide(true) : show()"
      >{{ label }}</HButton
    >
    <div
      :id="id"
      ref="panel"
      popover="auto"
      class="h-popover-panel h-mobile-overlay"
      :class="{ 'h-mobile': mobile }"
      role="dialog"
      :aria-label="panelLabel || title || label"
      tabindex="-1"
      part="panel"
      @toggle="toggle"
      @keydown.esc.stop.prevent="hide(true)"
    >
      <div v-if="title || mobile" class="h-overlay-header" part="header">
        <h2 part="title">{{ title || label }}</h2>
        <HButton
          v-if="mobile"
          icon="close"
          icon-only
          variant="ghost"
          :label="`Close ${title || label}`"
          @click="hide(true)"
        />
      </div>
      <div ref="body" class="h-overlay-body" tabindex="-1" part="body">
        <slot />
      </div>
      <div v-if="hasSlot('footer')" class="h-overlay-footer" part="footer">
        <slot name="footer" />
      </div></div
  ></span>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/mobile-overlay.css";
.h-popover {
  display: inline-block;
}
.h-popover-panel {
  position: fixed;
  inset: auto;
  margin: 0;
  width: var(--h-popover-width, 320px);
  max-width: calc(var(--h-overlay-width, 100vw) - 24px);
  max-height: calc(100dvh - 24px);
  overflow: auto;
  padding: 20px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-raised);
  color: var(--h-text);
  font: 13px/1.7 var(--h-font);
  box-shadow: var(--h-shadow);
}
.h-popover-panel h2 {
  font-size: 15px;
  font-weight: 550;
  margin-bottom: 14px;
}
.h-popover-panel:not(.h-mobile) .h-overlay-footer {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--h-border);
}
.h-overlay-footer:empty {
  display: none;
}
</style>
