<script setup lang="ts">
withDefaults(
  defineProps<{
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
    label?: string;
  }>(),
  { orientation: "horizontal", decorative: true },
);
</script>
<template>
  <div
    class="h-separator"
    :class="orientation"
    :role="decorative ? 'presentation' : 'separator'"
    :aria-orientation="decorative ? undefined : orientation"
    :aria-label="label"
    part="base"
  >
    <span v-if="label">{{ label }}</span>
  </div>
</template>
<style scoped>
.h-separator {
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--h-muted);
  font: 11px var(--h-font);
  min-width: 0;
}
.horizontal {
  width: 100%;
  margin-block: var(--h-separator-space, 20px);
}
.horizontal::before,
.horizontal::after {
  content: "";
  height: 1px;
  flex: 1;
  background: var(--h-border);
}
.horizontal:not(:has(span))::after {
  display: none;
}
.vertical {
  align-self: stretch;
  width: 1px;
  min-height: 24px;
  background: var(--h-border);
  margin-inline: var(--h-separator-space, 12px);
}
.vertical span {
  writing-mode: vertical-rl;
  background: var(--h-bg);
  padding-block: 5px;
}
</style>
