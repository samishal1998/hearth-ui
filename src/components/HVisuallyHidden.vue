<script setup lang="ts">
withDefaults(defineProps<{ as?: "span" | "div" }>(), { as: "span" });
</script>
<template>
  <component :is="as" class="h-sr-only" part="base"><slot /></component>
</template>
<style scoped>
@import "../styles/base.css";
</style>
