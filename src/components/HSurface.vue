<script setup lang="ts">
withDefaults(
  defineProps<{
    as?: "div" | "section" | "article" | "aside";
    tone?: "default" | "raised" | "inset";
    padding?: "none" | "sm" | "md" | "lg";
    bordered?: boolean;
  }>(),
  { as: "div", tone: "default", bordered: true },
);
</script>
<template>
  <component
    :is="as"
    class="h-surface"
    :class="[tone, { borderless: !bordered }]"
    :data-padding="padding"
    part="base"
    ><slot
  /></component>
</template>
<style scoped>
@import "../styles/base.css";
.h-surface {
  min-width: 0;
  padding: var(--h-surface-padding, calc(var(--h-space, 4px) * 4));
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
}
.raised {
  background: var(--h-raised);
  box-shadow: var(--h-shadow-soft);
}
.inset {
  background: var(--h-bg);
  box-shadow: inset 0 1px 3px rgb(0 0 0/0.08);
}
.borderless {
  border: 0;
}
[data-padding="none"] {
  padding: 0;
}
[data-padding="sm"] {
  padding: calc(var(--h-space, 4px) * 2);
}
[data-padding="md"] {
  padding: calc(var(--h-space, 4px) * 4);
}
[data-padding="lg"] {
  padding: calc(var(--h-space, 4px) * 6);
}
</style>
