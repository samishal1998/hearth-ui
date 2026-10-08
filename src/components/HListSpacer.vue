<script setup lang="ts">
withDefaults(defineProps<{ height?: number }>(), { height: 16 });
</script>
<template>
  <li
    role="presentation"
    aria-hidden="true"
    :style="{ height: `${Math.max(0, height)}px` }"
    part="base"
  />
</template>
<style scoped>
li {
  list-style: none;
  padding: 0;
  margin: 0;
}
</style>
