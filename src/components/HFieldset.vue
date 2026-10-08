<script setup lang="ts">
defineProps<{ label: string; description?: string; disabled?: boolean }>();
</script>
<template>
  <fieldset class="h-fieldset" part="base" :disabled="disabled">
    <legend part="label">{{ label }}</legend>
    <p v-if="description" part="description">{{ description }}</p>
    <div part="body"><slot /></div>
  </fieldset>
</template>
<style scoped>
.h-fieldset {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  font: 14px/1.8 var(--h-font);
  color: var(--h-text);
}
legend {
  font-weight: 550;
  margin-bottom: 8px;
}
p {
  margin: 0 0 16px;
  color: var(--h-muted);
  font-size: max(var(--h-font-min-size, 12px), 12px);
}
</style>
