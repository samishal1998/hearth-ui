<script setup lang="ts">
defineProps<{ title?: string; description?: string }>();
</script>
<template>
  <article class="h-card" part="base">
    <slot name="header"
      ><header v-if="title || description" part="header">
        <h2 v-if="title">{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </header></slot
    >
    <div class="h-card-body" part="body"><slot /></div>
    <slot name="footer" />
  </article>
</template>
<style scoped>
@import "../styles/base.css";
.h-card {
  padding: var(--h-card-padding);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
  box-shadow: var(--h-shadow-soft);
  min-width: 0;
}
header {
  margin-bottom: 20px;
}
h2 {
  font-size: 17px;
  font-weight: 550;
  letter-spacing: -0.4px;
}
p {
  font-size: 12px;
  color: var(--h-muted);
  margin-top: 7px;
  line-height: 1.8;
}
.h-card-body {
  min-width: 0;
}
::slotted([slot="header"]) {
  display: block;
  margin-bottom: 20px;
}
::slotted([slot="footer"]) {
  display: block;
  margin-top: 20px;
}
</style>
