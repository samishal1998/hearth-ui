<script setup lang="ts">
withDefaults(defineProps<{ label: string; gap?: number }>(), { gap: 3 });
</script>
<template>
  <div
    class="h-toolbar"
    role="group"
    :aria-label="label"
    part="base"
    :style="{ gap: `calc(var(--h-space,4px) * ${Math.max(0, gap)})` }"
  >
    <slot />
  </div>
</template>
<style scoped>
.h-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  min-width: 0;
}
.h-toolbar > * {
  min-width: 0;
}
</style>
