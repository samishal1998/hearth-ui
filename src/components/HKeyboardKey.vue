<script setup lang="ts">
withDefaults(defineProps<{ keys: string[]; label?: string }>(), {
  keys: () => [],
});
</script>
<template>
  <span
    class="h-keyboard-key"
    role="group"
    part="base"
    :aria-label="label || keys.join(' + ')"
  >
    <template v-for="(key, index) in keys" :key="index"
      ><span v-if="index" class="h-key-plus" aria-hidden="true">+</span
      ><kbd aria-hidden="true" part="key">{{ key }}</kbd></template
    >
  </span>
</template>
<style scoped>
@import "../styles/base.css";
.h-keyboard-key {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  vertical-align: middle;
  color: var(--h-muted);
}
kbd {
  min-width: 24px;
  padding: 2px 6px;
  border: 1px solid var(--h-border-strong);
  border-bottom-width: 2px;
  border-radius: 5px;
  background: var(--h-surface);
  font: 12px/1.5 var(--h-font-mono);
  text-align: center;
  overflow-wrap: anywhere;
}
.h-key-plus {
  font-size: 11px;
}
</style>
