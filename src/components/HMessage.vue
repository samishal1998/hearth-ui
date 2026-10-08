<script setup lang="ts">
import HBadge from "./HBadge.vue";
withDefaults(
  defineProps<{
    roleLabel?: string;
    author?: string;
    timestamp?: string;
    dateTime?: string;
    tone?: "default" | "user" | "system";
  }>(),
  { roleLabel: "Assistant", tone: "default" },
);
</script>
<template>
  <article class="h-message" :class="tone" part="base">
    <header part="header">
      <HBadge :label="roleLabel" /><strong v-if="author">{{ author }}</strong
      ><time v-if="timestamp" :datetime="dateTime">{{ timestamp }}</time
      ><slot name="actions" />
    </header>
    <div class="h-message-body" part="body"><slot /></div>
    <slot name="footer" />
  </article>
</template>
<style scoped>
.h-message {
  min-width: 0;
  color: var(--h-text);
  font: 14px/1.85 var(--h-font);
  padding: 20px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
}
.user {
  background: var(--h-accent-subtle);
}
.system {
  border-style: dashed;
  background: transparent;
}
header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
strong {
  font-size: 13px;
}
time {
  font-size: max(var(--h-font-min-size, 12px), 12px);
  color: var(--h-muted);
  margin-inline-start: auto;
  font-variant-numeric: tabular-nums;
}
.h-message-body {
  min-width: 0;
  overflow-wrap: anywhere;
}
.h-message-body :deep(p) {
  margin: 0 0 12px;
}
.h-message-body :deep(p:last-child) {
  margin-bottom: 0;
}
</style>
