<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, nextTick, useId } from "vue";
import HButton from "./HButton.vue";
const props = withDefaults(
  defineProps<{ label: string; follow?: boolean; maxHeight?: string }>(),
  { follow: true, maxHeight: "480px" },
);
const emit = defineEmits<{ "update:follow": [follow: boolean] }>();
const id = useId(),
  viewport = ref<HTMLElement>(),
  content = ref<HTMLElement>(),
  following = ref(props.follow),
  pending = ref(false);
let observer: ResizeObserver | undefined,
  frame = 0,
  release = 0,
  adjusting = false,
  anchor: Element | undefined,
  offset = 0;
function children() {
  const el = content.value;
  if (!el) return [];
  const slot = el.querySelector("slot");
  return slot
    ? [...slot.assignedElements({ flatten: true })]
    : [...el.children];
}
function capture() {
  const el = viewport.value;
  if (!el) return;
  const top = el.getBoundingClientRect().top;
  anchor = children().find(
    (child) => child.getBoundingClientRect().bottom > top,
  );
  offset = anchor ? anchor.getBoundingClientRect().top - top : 0;
}
function setFollow(value: boolean) {
  if (following.value !== value) {
    following.value = value;
    emit("update:follow", value);
  }
}
function scroll() {
  if (adjusting) return;
  const el = viewport.value;
  if (!el) return;
  const atEnd = el.scrollHeight - el.scrollTop - el.clientHeight < 24;
  setFollow(atEnd);
  if (atEnd) pending.value = false;
  capture();
}
function measure() {
  const el = viewport.value;
  if (!el) return;
  adjusting = true;
  if (following.value) {
    el.scrollTop = el.scrollHeight;
    pending.value = false;
  } else {
    if (anchor?.isConnected)
      el.scrollTop +=
        anchor.getBoundingClientRect().top -
        el.getBoundingClientRect().top -
        offset;
    pending.value = true;
  }
  capture();
  cancelAnimationFrame(release);
  release = requestAnimationFrame(() => (adjusting = false));
}
function schedule() {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(measure);
}
function latest() {
  setFollow(true);
  measure();
}
watch(
  () => props.follow,
  (value) => {
    following.value = value;
    if (value) nextTick(latest);
  },
);
onMounted(() => {
  observer = new ResizeObserver(schedule);
  if (content.value) observer.observe(content.value);
  if (viewport.value) observer.observe(viewport.value);
  content.value?.addEventListener("slotchange", schedule);
  measure();
});
onBeforeUnmount(() => {
  observer?.disconnect();
  cancelAnimationFrame(frame);
  cancelAnimationFrame(release);
  content.value?.removeEventListener("slotchange", schedule);
});
defineExpose({ scrollToLatest: latest });
</script>
<template>
  <section class="h-message-scroller" part="base">
    <div
      :id="id"
      ref="viewport"
      class="h-message-viewport"
      role="region"
      :aria-label="label"
      tabindex="0"
      :style="{ maxHeight }"
      part="viewport"
      @scroll="scroll"
    >
      <div ref="content" class="h-message-content" part="content"><slot /></div>
    </div>
    <div v-if="pending || !following" class="h-message-jump">
      <HButton size="compact" :aria-controls="id" @click="latest"
        >Jump to latest</HButton
      >
    </div>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-message-scroller {
  position: relative;
  min-width: 0;
  max-width: 100%;
  min-height: 0;
}
.h-message-viewport {
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
  min-width: 0;
  min-height: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  color: var(--h-text);
  font: var(--h-font-size)/1.7 var(--h-font);
}
.h-message-content {
  display: flex;
  flex-direction: column;
  gap: var(--h-gap);
  padding: var(--h-control-padding);
  min-width: 0;
  overflow-wrap: anywhere;
}
.h-message-jump {
  display: flex;
  justify-content: center;
  padding-top: 8px;
}
</style>
