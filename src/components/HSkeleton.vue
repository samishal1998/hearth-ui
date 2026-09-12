<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: "text" | "rectangle" | "circle";
    lines?: number;
    width?: string;
    height?: string;
    label?: string;
    animated?: boolean;
  }>(),
  {
    variant: "text",
    lines: 3,
    label: "Loading content",
    animated: true,
  },
);
</script>
<template>
  <div
    class="h-skeleton"
    :class="[variant, { animated }]"
    :role="label ? 'status' : undefined"
    :aria-label="label || undefined"
    :aria-hidden="!label || undefined"
    :style="{
      width: width || (variant === 'circle' ? height || '48px' : '100%'),
    }"
    part="base"
  >
    <span
      v-for="n in variant === 'text'
        ? Math.min(20, Math.max(1, Math.floor(lines) || 1))
        : 1"
      :key="n"
      class="h-skeleton-block"
      :style="{
        height:
          height ||
          (variant === 'text'
            ? '12px'
            : variant === 'circle'
              ? width || '48px'
              : '100px'),
      }"
      aria-hidden="true"
      part="block"
    />
  </div>
</template>
<style scoped>
.h-skeleton {
  display: grid;
  gap: 10px;
  min-width: 0;
  max-width: 100%;
}
.h-skeleton-block {
  display: block;
  border-radius: 6px;
  background: color-mix(in srgb, var(--h-muted) 15%, var(--h-surface));
}
.text .h-skeleton-block:last-child {
  width: 72%;
}
.circle {
  width: 48px;
  aspect-ratio: 1;
}
.circle .h-skeleton-block {
  border-radius: 50%;
  aspect-ratio: 1;
}
.rectangle .h-skeleton-block {
  border-radius: var(--h-radius-control);
}
.animated .h-skeleton-block {
  animation: h-skeleton 1.6s ease-in-out infinite;
}
@keyframes h-skeleton {
  50% {
    opacity: 0.45;
  }
}
@media (prefers-reduced-motion: reduce) {
  .animated .h-skeleton-block {
    animation: none;
  }
}
</style>
