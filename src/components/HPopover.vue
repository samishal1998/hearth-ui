<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import HButton from "./HButton.vue";
import { useFloating, focusFirst } from "../floating";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    label?: string;
    title?: string;
    icon?: string;
    placement?: "top" | "bottom" | "left" | "right";
    disabled?: boolean;
    variant?: "primary" | "secondary" | "ghost";
  }>(),
  { label: "Options", placement: "bottom", variant: "secondary" },
);
const emit = defineEmits<{ "update:open": [open: boolean]; close: [] }>();
const trigger = ref<InstanceType<typeof HButton>>();
const anchor = ref<HTMLElement>();
const panel = ref<HTMLElement>();
const visible = ref(false);
const id = useId();
useFloating(anchor, panel, visible, () => props.placement);
async function show() {
  if (props.disabled || !panel.value) return;
  panel.value.showPopover();
  visible.value = true;
  await nextTick();
  if (panel.value) focusFirst(panel.value);
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
      class="h-popover-panel"
      role="dialog"
      :aria-label="title || label"
      tabindex="-1"
      part="panel"
      @toggle="toggle"
      @keydown.esc.stop.prevent="hide(true)"
    >
      <h2 v-if="title" part="title">{{ title }}</h2>
      <slot /></div
  ></span>
</template>
<style scoped>
@import "../styles/base.css";
.h-popover {
  display: inline-block;
}
.h-popover-panel {
  position: fixed;
  inset: auto;
  margin: 0;
  width: var(--h-popover-width, 320px);
  max-width: calc(100vw - 24px);
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
</style>
