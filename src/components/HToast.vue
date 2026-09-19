<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import HIcon from "./HIcon.vue";
import type { Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    title: string;
    description?: string;
    tone?: Tone;
    duration?: number;
    actionLabel?: string;
    dismissible?: boolean;
  }>(),
  { tone: "neutral", duration: 5000, dismissible: true },
);
const emit = defineEmits<{ dismiss: []; action: [] }>();
const root = ref<HTMLElement>();
let timer: ReturnType<typeof setTimeout> | undefined;
let remaining = props.duration;
let start = 0;
const hovered = ref(false);
const focused = ref(false);
let ended = false;
function pause() {
  clearTimeout(timer);
  if (start) remaining = Math.max(0, remaining - (Date.now() - start));
  start = 0;
}
function run() {
  if (
    ended ||
    hovered.value ||
    focused.value ||
    props.duration <= 0 ||
    document.hidden
  )
    return;
  start = Date.now();
  timer = setTimeout(dismiss, remaining);
}
function dismiss() {
  if (ended) return;
  ended = true;
  pause();
  emit("dismiss");
}
function visibility() {
  pause();
  run();
}
onMounted(() => {
  run();
  document.addEventListener("visibilitychange", visibility);
});
onBeforeUnmount(() => {
  pause();
  document.removeEventListener("visibilitychange", visibility);
});
watch(
  () => props.duration,
  () => {
    pause();
    remaining = props.duration;
    ended = false;
    run();
  },
);
</script>
<template>
  <div
    ref="root"
    class="h-toast"
    :class="tone"
    :role="tone === 'danger' ? 'alert' : 'status'"
    part="base"
    @pointerenter="
      hovered = true;
      pause();
    "
    @pointerleave="
      hovered = false;
      run();
    "
    @focusin="
      focused = true;
      pause();
    "
    @focusout="
      (e) => {
        if (!root?.contains(e.relatedTarget as Node)) {
          focused = false;
          run();
        }
      }
    "
  >
    <HIcon :name="tone === 'success' ? 'check' : 'info'" />
    <div class="h-toast-copy">
      <strong part="title">{{ title }}</strong>
      <p v-if="description" part="description">{{ description }}</p>
      <button
        v-if="actionLabel"
        type="button"
        class="h-toast-action"
        part="action"
        @click="emit('action')"
      >
        {{ actionLabel }}</button
      ><slot />
    </div>
    <button
      v-if="dismissible"
      class="h-toast-close"
      type="button"
      aria-label="Dismiss notification"
      @click="dismiss"
    >
      <HIcon name="close" :size="16" />
    </button>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-toast {
  --toast-color: var(--h-muted);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-width: 0;
  padding: 17px;
  border: 1px solid color-mix(in srgb, var(--toast-color) 28%, var(--h-border));
  border-radius: var(--h-radius-card);
  background: var(--h-raised);
  color: var(--h-text);
  font-family: var(--h-font);
  box-shadow: var(--h-shadow);
}
.accent {
  --toast-color: var(--h-accent-text);
}
.success {
  --toast-color: var(--h-success);
}
.danger {
  --toast-color: var(--h-danger);
}
.warning {
  --toast-color: var(--h-warning);
}
.info {
  --toast-color: var(--h-info);
}
.h-toast > .h-icon {
  color: var(--toast-color);
  margin-top: 2px;
}
.h-toast-copy {
  flex: 1;
  min-width: 0;
}
strong {
  font-size: 13px;
  font-weight: 550;
}
p {
  font-size: 12px;
  line-height: 1.7;
  color: var(--h-muted);
  margin-top: 4px;
  overflow-wrap: anywhere;
}
.h-toast-close {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin: -8px -8px -8px 0;
  border: 0;
  border-radius: 8px;
  background: none;
  color: var(--h-muted);
}
.h-toast-action {
  min-height: 36px;
  padding: 7px 0;
  border: 0;
  background: none;
  color: var(--h-accent-text);
  font-size: 12px;
  font-weight: 550;
}
</style>
