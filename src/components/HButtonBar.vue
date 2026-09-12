<script setup lang="ts">
withDefaults(
  defineProps<{
    label?: string;
    align?: "start" | "center" | "end" | "between";
    orientation?: "horizontal" | "vertical";
  }>(),
  { label: "Actions", align: "start", orientation: "horizontal" },
);
</script>
<template>
  <div
    class="h-button-bar"
    part="base"
    role="group"
    :aria-label="label"
    :class="[align, orientation]"
  >
    <slot />
  </div>
</template>
<style scoped>
.h-button-bar {
  display: flex;
  align-items: center;
  gap: calc(var(--h-space) * 2);
  flex-wrap: wrap;
  min-width: 0;
}
.center {
  justify-content: center;
}
.end {
  justify-content: flex-end;
}
.between {
  justify-content: space-between;
}
.vertical {
  flex-direction: column;
  align-items: stretch;
}
.vertical.start,
.vertical.end,
.vertical.center {
  justify-content: flex-start;
}
</style>
