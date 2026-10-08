<script setup lang="ts">
withDefaults(
  defineProps<{
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    size?: "sm" | "md" | "lg" | "xl";
  }>(),
  { level: 2, size: "md" },
);
</script>
<template>
  <component :is="`h${level}`" class="h-heading" :class="size" part="base"
    ><slot
  /></component>
</template>
<style scoped>
.h-heading {
  margin: 0;
  font: 550 var(--h-heading-md, 24px)/1.3 var(--h-font);
  color: var(--h-text);
  text-wrap: balance;
  overflow-wrap: anywhere;
  letter-spacing: -0.025em;
}
.sm {
  font-size: var(--h-heading-sm, 18px);
}
.lg {
  font-size: var(--h-heading-lg, 32px);
}
.xl {
  font-size: var(--h-heading-xl, 40px);
}
</style>
