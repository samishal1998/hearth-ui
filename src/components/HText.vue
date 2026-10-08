<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "span" | "p" | "div" | "small" | "strong" | "code";
    size?: "sm" | "md" | "lg";
    tone?: "default" | "muted" | "accent" | "danger";
    weight?: "regular" | "medium" | "bold";
  }>(),
  { as: "span", size: "md", tone: "default", weight: "regular" },
);
</script>
<template>
  <component :is="as" class="h-text" :class="[size, tone, weight]" part="base"
    ><slot
  /></component>
</template>
<style scoped>
.h-text {
  margin: 0;
  font-family: var(--h-font);
  font-size: max(var(--h-font-min-size, 12px), var(--h-text-md, 14px));
  line-height: 1.8;
  color: var(--h-text);
  overflow-wrap: anywhere;
  text-wrap: pretty;
}
.sm {
  font-size: max(var(--h-font-min-size, 12px), var(--h-text-sm, 12px));
}
.lg {
  font-size: max(var(--h-font-min-size, 12px), var(--h-text-lg, 16px));
}
.muted {
  color: var(--h-muted);
}
.accent {
  color: var(--h-accent-text);
}
.danger {
  color: var(--h-danger);
}
.medium {
  font-weight: 550;
}
.bold {
  font-weight: 650;
}
code {
  font-family: var(--h-font-mono);
}
</style>
