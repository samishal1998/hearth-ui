<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    name: string;
    src?: string;
    size?: number;
    shape?: "circle" | "rounded";
    tone?: Tone;
    decorative?: boolean;
  }>(),
  { size: 40, shape: "circle", tone: "accent" },
);
const failed = ref(false);
watch(
  () => props.src,
  () => (failed.value = false),
);
const initials = computed(
  () =>
    props.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] || "")
      .join("")
      .toUpperCase() || "?",
);
const length = computed(() =>
  Math.max(16, Number.isFinite(props.size) ? props.size : 40),
);
</script>
<template>
  <span
    class="h-avatar"
    :class="[shape, tone]"
    :role="decorative ? undefined : 'img'"
    :aria-label="decorative ? undefined : name"
    :aria-hidden="decorative || undefined"
    :style="{
      width: `${length}px`,
      height: `${length}px`,
      fontSize: `${length * 0.34}px`,
    }"
    part="base"
    ><img
      v-if="src && !failed"
      :src="src"
      alt=""
      part="image"
      @error="failed = true"
    /><span v-else aria-hidden="true" part="fallback">{{
      initials
    }}</span></span
  >
</template>
<style scoped>
.h-avatar {
  --avatar-color: var(--h-accent-text);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  flex-shrink: 0;
  overflow: hidden;
  box-sizing: border-box;
  font-family: var(--h-font);
  font-weight: 550;
  color: var(--avatar-color);
  background: color-mix(in srgb, var(--avatar-color) 15%, var(--h-surface));
  border: 1px solid color-mix(in srgb, var(--avatar-color) 20%, transparent);
}
.circle {
  border-radius: 50%;
}
.rounded {
  border-radius: var(--h-radius-control);
}
.success {
  --avatar-color: var(--h-success);
}
.info {
  --avatar-color: var(--h-info);
}
.warning {
  --avatar-color: var(--h-warning);
}
.danger {
  --avatar-color: var(--h-danger);
}
.neutral {
  --avatar-color: var(--h-muted);
}
img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
