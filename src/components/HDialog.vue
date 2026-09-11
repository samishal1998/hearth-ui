<script setup lang="ts">
import { ref, watch, onMounted, useId } from "vue";
import HButton from "./HButton.vue";
const props = defineProps<{
  open?: boolean;
  title: string;
  description?: string;
}>();
const emit = defineEmits<{ close: [] }>();
const dialog = ref<HTMLDialogElement>();
const id = useId();
function sync() {
  if (!dialog.value) return;
  if (props.open && !dialog.value.open) dialog.value.showModal();
  if (!props.open && dialog.value.open) dialog.value.close();
}
onMounted(sync);
watch(() => props.open, sync, { flush: "post" });
function backdrop(e: MouseEvent) {
  if (e.target !== dialog.value) return;
  const rect = dialog.value.getBoundingClientRect();
  if (
    e.clientX < rect.left ||
    e.clientX > rect.right ||
    e.clientY < rect.top ||
    e.clientY > rect.bottom
  )
    dialog.value.close();
}
</script>
<template>
  <dialog
    ref="dialog"
    class="h-dialog"
    part="dialog"
    :aria-labelledby="`${id}-title`"
    :aria-describedby="description ? `${id}-description` : undefined"
    @close="emit('close')"
    @click="backdrop"
  >
    <div class="h-dialog-head" part="header">
      <div>
        <h2 :id="`${id}-title`">{{ title }}</h2>
        <p v-if="description" :id="`${id}-description`">{{ description }}</p>
      </div>
      <HButton
        variant="ghost"
        icon="close"
        icon-only
        label="Close dialog"
        @click="dialog?.close()"
      />
    </div>
    <div part="body"><slot /></div>
    <slot name="footer" />
  </dialog>
</template>
<style scoped>
@import "../styles/base.css";
.h-dialog {
  width: 560px;
  max-width: calc(100% - 28px);
  max-height: calc(100dvh - 40px);
  padding: 28px;
  color: var(--h-text);
  background: var(--h-raised);
  font-family: var(--h-font);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-panel);
  box-shadow: 0 25px 100px #0006;
  overscroll-behavior: contain;
}
.h-dialog::backdrop {
  background: rgb(2 6 18 / 0.7);
  backdrop-filter: blur(5px);
}
.h-dialog-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 25px;
}
.h-dialog-head > .h-button {
  margin: -8px -10px 0 0;
}
h2 {
  font-size: 23px;
  font-weight: 550;
  letter-spacing: -0.7px;
}
p {
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-top: 8px;
}
::slotted([slot="footer"]) {
  display: block;
  margin-top: 24px;
}
</style>
