<script setup lang="ts">
withDefaults(defineProps<{ label?: string; divided?: boolean }>(), {
  label: "Items",
  divided: true,
});
</script>
<template>
  <ul class="h-list" :class="{ divided }" :aria-label="label" part="base">
    <slot />
  </ul>
</template>
<style scoped>
.h-list {
  list-style: none;
  margin: 0;
  padding: 0;
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
  --h-list-divider: transparent;
}
.h-list.divided {
  --h-list-divider: var(--h-border);
}
</style>
