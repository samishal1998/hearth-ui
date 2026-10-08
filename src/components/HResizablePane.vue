<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from "vue";
import HButton from "./HButton.vue";
import { useMobileLayout } from "../mobile";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    value?: number;
    min?: number;
    max?: number;
    step?: number;
    label?: string;
    mobileBreakpoint?: number;
  }>(),
  { value: 320, min: 200, max: 700, step: 20, label: "Inspector width" },
);
const emit = defineEmits<{
  "update:modelValue": [width: number];
  change: [width: number];
}>();
const root = ref<HTMLElement>(),
  mobile = useMobileLayout(root, () => props.mobileBreakpoint);
const available = ref(Infinity);
let observer: ResizeObserver | undefined;
onMounted(() => {
  if (root.value) {
    available.value = root.value.clientWidth;
    observer = new ResizeObserver(
      (entries) => (available.value = entries[0].contentRect.width),
    );
    observer.observe(root.value);
  }
});
onBeforeUnmount(() => observer?.disconnect());
const minimum = computed(() =>
    Math.min(
      Math.max(100, Number.isFinite(props.min) ? props.min : 200),
      Math.max(100, available.value - 120),
    ),
  ),
  maximum = computed(() =>
    Math.max(
      minimum.value,
      Math.min(
        Number.isFinite(props.max) ? props.max : 700,
        Math.max(100, available.value - 120),
      ),
    ),
  );
const stepSize = computed(() =>
  Number.isFinite(props.step) && props.step > 0 ? props.step : 20,
);
const clamp = (value: number) =>
  Math.max(
    minimum.value,
    Math.min(maximum.value, Number.isFinite(value) ? value : 320),
  );
const width = ref(clamp(props.modelValue ?? props.value));
watch(
  () => [props.modelValue, props.value, props.min, props.max],
  () => (width.value = clamp(props.modelValue ?? props.value)),
);
function update(value: number, commit = false) {
  width.value = clamp(value);
  emit("update:modelValue", width.value);
  if (commit) emit("change", width.value);
}
let drag:
  { pointer: number; x: number; width: number; rtl: boolean } | undefined;
function start(event: PointerEvent) {
  if (event.button !== 0 || mobile.value) return;
  drag = {
    pointer: event.pointerId,
    x: event.clientX,
    width: width.value,
    rtl:
      getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl",
  };
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  (event.currentTarget as HTMLElement).focus({ preventScroll: true });
  event.preventDefault();
}
function move(event: PointerEvent) {
  if (drag && drag.pointer === event.pointerId)
    update(drag.width + (drag.x - event.clientX) * (drag.rtl ? -1 : 1));
}
function end(event: PointerEvent) {
  if (drag?.pointer !== event.pointerId) return;
  drag = undefined;
  emit("change", width.value);
}
function key(event: KeyboardEvent) {
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  if (event.key === "Home" || event.key === "End") {
    event.preventDefault();
    update(event.key === "Home" ? minimum.value : maximum.value, true);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    update(
      width.value +
        (event.key === "ArrowLeft" ? 1 : -1) * (rtl ? -1 : 1) * stepSize.value,
      true,
    );
  }
}
function cancel(event: PointerEvent) {
  if (drag?.pointer !== event.pointerId) return;
  const previous = drag.width;
  drag = undefined;
  update(previous);
}
watch([minimum, maximum], () => (width.value = clamp(width.value)));
</script>
<template>
  <div ref="root" class="h-resizable" :class="{ mobile }" part="base">
    <div class="h-resizable-main" part="content"><slot /></div>
    <div
      v-if="!mobile"
      class="h-resizer"
      role="separator"
      aria-orientation="vertical"
      :aria-label="label"
      :aria-valuemin="minimum"
      :aria-valuemax="maximum"
      :aria-valuenow="width"
      tabindex="0"
      part="handle"
      @pointerdown="start"
      @pointermove="move"
      @pointerup="end"
      @pointercancel="cancel"
      @lostpointercapture="cancel"
      @keydown="key"
    />
    <aside
      class="h-resizable-pane"
      :style="{ width: mobile ? '100%' : `${width}px` }"
      part="pane"
    >
      <div v-if="!mobile" class="h-resize-controls">
        <HButton
          size="compact"
          variant="ghost"
          icon="minus"
          icon-only
          label="Decrease pane width"
          :disabled="width <= minimum"
          @click="update(width - stepSize, true)"
        /><HButton
          size="compact"
          variant="ghost"
          icon="plus"
          icon-only
          label="Increase pane width"
          :disabled="width >= maximum"
          @click="update(width + stepSize, true)"
        />
      </div>
      <slot name="pane" />
    </aside>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-resizable {
  display: flex;
  min-width: 0;
  min-height: 0;
}
.h-resizable-main {
  flex: 1;
  min-width: 0;
}
.h-resizable-pane {
  min-width: 0;
  max-width: 100%;
  flex-shrink: 0;
}
.h-resizer {
  width: 24px;
  position: relative;
  cursor: col-resize;
  touch-action: none;
  flex-shrink: 0;
}
.h-resizer::after {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline: 11px;
  background: var(--h-border);
}
.h-resizer:hover::after {
  background: var(--h-accent);
}
.h-resize-controls {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}
.mobile {
  flex-direction: column;
  gap: 20px;
}
@media (pointer: coarse) {
  .h-resizer {
    width: 44px;
  }
  .h-resizer::after {
    inset-inline: 21px;
  }
}
</style>
