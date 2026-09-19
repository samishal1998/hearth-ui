<script setup lang="ts">
import { ref, watch, onMounted, useId } from "vue";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    title: string;
    description?: string;
    side?: "left" | "right";
    width?: string;
  }>(),
  { side: "right", width: "440px" },
);
const emit = defineEmits<{ close: [] }>();
const panel = ref<HTMLDialogElement>();
const id = useId();
function sync() {
  if (!panel.value) return;
  if (props.open && !panel.value.open) panel.value.showModal();
  else if (!props.open && panel.value.open) panel.value.close();
}
onMounted(sync);
watch(() => props.open, sync, { flush: "post" });
function backdrop(e: MouseEvent) {
  if (e.target !== panel.value) return;
  const r = panel.value.getBoundingClientRect();
  if (
    e.clientX < r.left ||
    e.clientX > r.right ||
    e.clientY < r.top ||
    e.clientY > r.bottom
  )
    panel.value.close();
}
</script>
<template>
  <dialog
    ref="panel"
    class="h-sheet"
    :class="side"
    :style="{ '--h-sheet-width': width }"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="description ? `${id}-description` : undefined"
    part="panel"
    @close="emit('close')"
    @click="backdrop"
  >
    <div class="h-sheet-head" part="header">
      <div>
        <h2 :id="`${id}-title`">{{ title }}</h2>
        <p v-if="description" :id="`${id}-description`">{{ description }}</p>
      </div>
      <HButton
        icon="close"
        icon-only
        variant="ghost"
        label="Close panel"
        @click="panel?.close()"
      />
    </div>
    <div class="h-sheet-body" part="body"><slot /></div>
    <div class="h-sheet-footer" part="footer"><slot name="footer" /></div>
  </dialog>
</template>
<style scoped>
@import "../styles/base.css";
.h-sheet {
  position: fixed;
  inset: 0 0 0 auto;
  margin: 0;
  width: var(--h-sheet-width);
  max-width: 100vw;
  height: 100dvh;
  max-height: 100dvh;
  padding: 0;
  border: 0;
  border-inline-start: 1px solid var(--h-border);
  background: var(--h-raised);
  color: var(--h-text);
  font-family: var(--h-font);
  box-shadow: var(--h-shadow);
  overflow: auto;
}
.h-sheet.left {
  inset: 0 auto 0 0;
  border-inline-start: 0;
  border-inline-end: 1px solid var(--h-border);
}
.h-sheet::backdrop {
  background: #020612aa;
  backdrop-filter: blur(3px);
}
.h-sheet-head {
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 28px;
  border-bottom: 1px solid var(--h-border);
}
h2 {
  font-size: 23px;
  font-weight: 550;
  letter-spacing: -0.6px;
}
p {
  margin-top: 9px;
  color: var(--h-muted);
  font-size: 12px;
  line-height: 1.8;
}
.h-sheet-head > .h-button {
  flex-shrink: 0;
  margin: -8px -10px 0 0;
}
.h-sheet-body {
  padding: 28px;
  min-height: 100px;
}
.h-sheet-footer {
  padding: 0 28px 28px;
}
</style>
