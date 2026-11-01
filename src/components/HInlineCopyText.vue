<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import HIcon from "./HIcon.vue";
import { copyText } from "../clipboard";
const props = withDefaults(
  defineProps<{
    value: string;
    label?: string;
    display?: string;
    disabled?: boolean;
    truncate?: boolean;
  }>(),
  { label: "value", truncate: true },
);
const emit = defineEmits<{ copied: []; "copy-error": [message: string] }>();
const copied = ref(false),
  message = ref("");
let timer: ReturnType<typeof setTimeout> | undefined;
async function copy() {
  if (props.disabled) return;
  clearTimeout(timer);
  try {
    await copyText(props.value);
    copied.value = true;
    message.value = `${props.label} copied.`;
    emit("copied");
    timer = setTimeout(() => {
      copied.value = false;
      message.value = "";
    }, 1800);
  } catch (error) {
    message.value = (error as Error).message;
    emit("copy-error", message.value);
  }
}
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <span class="h-inline-copy" part="base"
    ><button
      type="button"
      :disabled="disabled"
      :aria-label="`Copy ${label}: ${display ?? value}`"
      :title="display ?? value"
      part="control"
      @click="copy"
    >
      <span :class="{ truncate }" part="value">{{ display ?? value }}</span
      ><HIcon :name="copied ? 'check' : 'copy'" :size="14" /></button
    ><span class="h-sr-only" role="status" aria-atomic="true">{{
      message
    }}</span></span
  >
</template>
<style scoped>
@import "../styles/base.css";
.h-inline-copy {
  display: inline-flex;
  min-width: 0;
  max-width: 100%;
}
button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  max-width: 100%;
  min-height: 24px;
  padding: 2px 4px;
  border: 0;
  border-radius: 4px;
  background: none;
  color: var(--h-muted);
  font: 12px/1.6 var(--h-font-mono);
  text-align: start;
}
button > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
button:focus-visible {
  color: var(--h-accent-text);
}
button:disabled {
  opacity: 0.5;
}
@media (hover: hover) {
  button:hover:not(:disabled) {
    background: var(--h-accent-subtle);
    color: var(--h-text);
  }
}
@media (pointer: coarse) {
  button {
    min-height: 44px;
  }
}
</style>
