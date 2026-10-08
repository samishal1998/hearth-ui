<script setup lang="ts">
withDefaults(defineProps<{ ratio?: number }>(), { ratio: 16 / 9 });
</script>
<template>
  <div
    class="h-aspect-ratio"
    part="base"
    :style="{
      aspectRatio: Number.isFinite(ratio) && ratio > 0 ? ratio : 16 / 9,
    }"
  >
    <slot />
  </div>
</template>
<style scoped>
.h-aspect-ratio {
  width: 100%;
  min-width: 0;
  overflow: hidden;
}
.h-aspect-ratio :deep(img),
.h-aspect-ratio :slotted(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
