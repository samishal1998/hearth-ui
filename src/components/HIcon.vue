<script setup lang="ts">
import { computed } from "vue";
import { paths } from "../icons";
import type { IconValue, IconDefinition } from "../themes";
const props = withDefaults(defineProps<{ name?: IconValue; size?: number }>(), {
  name: "apps",
  size: 20,
});
const definition = computed<IconDefinition>(() =>
  typeof props.name === "string"
    ? { paths: [paths[props.name] || paths.apps] }
    : props.name,
);
</script>
<template>
  <svg
    class="h-icon"
    part="icon"
    :width="size"
    :height="size"
    :viewBox="definition?.viewBox || '0 0 24 24'"
    :fill="definition?.fill || 'none'"
    stroke="currentColor"
    :stroke-width="definition?.strokeWidth ?? 1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path
      v-for="(path, index) in definition?.paths || []"
      :key="index"
      :d="path"
      :fill-rule="definition?.fillRule"
    />
  </svg>
</template>
<style scoped>
.h-icon {
  display: inline-block;
  flex: 0 0 auto;
  vertical-align: middle;
}
</style>
