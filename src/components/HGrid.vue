<script setup lang="ts">
withDefaults(
  defineProps<{
    columns?: number;
    minColumnWidth?: string;
    gap?: number;
    align?: "start" | "center" | "stretch";
  }>(),
  { minColumnWidth: "240px", gap: 4, align: "stretch" },
);
</script>
<template>
  <div
    class="h-grid"
    part="base"
    :style="{
      gridTemplateColumns: columns
        ? `repeat(${Math.max(1, Math.floor(columns))},minmax(0,1fr))`
        : `repeat(auto-fit,minmax(min(100%,${minColumnWidth}),1fr))`,
      gap: `calc(var(--h-space,4px) * ${Math.max(0, gap)})`,
      alignItems: align,
    }"
  >
    <slot />
  </div>
</template>
<style scoped>
.h-grid {
  display: grid;
  min-width: 0;
}
.h-grid > * {
  min-width: 0;
}
</style>
