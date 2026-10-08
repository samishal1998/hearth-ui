<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import HButton from "./HButton.vue";
import { useMobileLayout } from "../mobile";
import { useSlotPresence } from "../slots";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    title: string;
    description?: string;
    width?: string;
    mobileBreakpoint?: number;
  }>(),
  { width: "400px" },
);
const emit = defineEmits<{ "update:open": [open: boolean]; close: [] }>();
const root = ref<HTMLElement>(),
  frame = ref<HTMLElement>(),
  dialog = ref<HTMLDialogElement>(),
  mobile = useMobileLayout(dialog, () => props.mobileBreakpoint),
  id = useId();
const hasSlot = useSlotPresence(() => root.value);
async function sync() {
  await nextTick();
  if (!root.value || !frame.value || !dialog.value) return;
  let focused = document.activeElement as HTMLElement | null;
  while (focused?.shadowRoot?.activeElement)
    focused = focused.shadowRoot.activeElement as HTMLElement;
  let ancestor: Element | null = focused;
  while (ancestor && ancestor !== frame.value)
    ancestor =
      ancestor.assignedSlot ||
      ancestor.parentElement ||
      (ancestor.getRootNode() as ShadowRoot).host ||
      null;
  const restoreFocus =
    ancestor === frame.value &&
    frame.value.parentElement !== (mobile.value ? dialog.value : root.value);
  const target = mobile.value ? dialog.value : root.value;
  if (frame.value.parentElement !== target) target.append(frame.value);
  if (mobile.value && props.open && !dialog.value.open)
    dialog.value.showModal();
  if ((!mobile.value || !props.open) && dialog.value.open) dialog.value.close();
  if (restoreFocus && props.open && focused?.isConnected)
    focused.focus({ preventScroll: true });
}
function close() {
  emit("update:open", false);
  emit("close");
}
watch(() => [props.open, mobile.value], sync, { flush: "post" });
onMounted(sync);
onBeforeUnmount(() => dialog.value?.close());
</script>
<template>
  <aside
    ref="root"
    class="h-pane"
    :class="{ 'h-pane-mobile': mobile, closed: !open }"
    :style="{ '--h-pane-width': width }"
    :aria-label="title"
    part="base"
  >
    <div ref="frame" class="h-pane-frame">
      <header part="header">
        <div>
          <h2 :id="`${id}-title`">{{ title }}</h2>
          <p v-if="description">{{ description }}</p>
        </div>
        <HButton
          variant="ghost"
          icon="close"
          icon-only
          :label="`Close ${title}`"
          @click="close"
        />
      </header>
      <div class="h-pane-body" part="body"><slot /></div>
      <footer v-if="hasSlot('footer')" part="footer">
        <slot name="footer" />
      </footer>
    </div>
    <dialog
      ref="dialog"
      :aria-labelledby="`${id}-title`"
      class="h-pane-dialog"
      @cancel.prevent="close"
    />
  </aside>
</template>
<style scoped>
@import "../styles/base.css";
.h-pane {
  height: 100%;
  min-height: 0;
  max-height: 100%;
  display: flex;
  flex-direction: column;
  width: var(--h-pane-width);
  max-width: 100%;
  min-width: 0;
  border-inline-start: 1px solid var(--h-border);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-pane.closed:not(.h-pane-mobile) {
  display: none;
}
.h-pane-mobile {
  width: 0;
  border: 0;
}
.h-pane-frame {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: inherit;
  min-height: 0;
}
header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid var(--h-border);
  flex-shrink: 0;
}
h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 550;
  overflow-wrap: anywhere;
}
header p {
  color: var(--h-muted);
  font-size: 12px;
  margin: 6px 0 0;
}
.h-pane-body {
  overflow: auto;
  overscroll-behavior: contain;
  min-height: 0;
  flex: 1;
  padding: 20px;
}
footer {
  padding: 16px 20px;
  border-top: 1px solid var(--h-border);
}
footer:empty {
  display: none;
}
.h-pane-dialog {
  position: fixed;
  inset: 0;
  margin: 0;
  width: 100%;
  max-width: 100%;
  height: var(--h-overlay-height, 100dvh);
  max-height: 100dvh;
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
    env(safe-area-inset-bottom) env(safe-area-inset-left);
  border: 0;
  background: var(--h-raised);
  color: var(--h-text);
}
.h-pane-dialog::backdrop {
  background: #020612bb;
}
.h-pane-dialog .h-pane-frame {
  height: 100%;
}
</style>
