<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "section" | "main";
    maxWidth?: string;
    padding?: string;
  }>(),
  {
    as: "div",
    maxWidth: "var(--h-content-max,1440px)",
    padding: "var(--h-page-padding,20px)",
  },
);
</script>
<template>
  <component
    :is="as"
    class="h-container"
    part="base"
    :style="{ maxWidth, paddingInline: padding }"
    ><slot
  /></component>
</template>
<style scoped>
.h-container {
  width: 100%;
  min-width: 0;
  margin-inline: auto;
  box-sizing: border-box;
}
</style>
