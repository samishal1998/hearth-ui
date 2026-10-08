<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string;
    maxHeight?: string;
    axis?: "vertical" | "horizontal" | "both";
  }>(),
  { maxHeight: "400px", axis: "vertical" },
);
</script>
<template>
  <div
    class="h-scroll-area"
    part="viewport"
    role="region"
    :aria-label="label"
    tabindex="0"
    :style="{
      maxHeight,
      overflowX: axis === 'vertical' ? 'hidden' : 'auto',
      overflowY: axis === 'horizontal' ? 'hidden' : 'auto',
    }"
  >
    <slot />
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-scroll-area {
  min-width: 0;
  min-height: 0;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: var(--h-border-strong) transparent;
}
</style>
