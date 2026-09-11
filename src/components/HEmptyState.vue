<script setup lang="ts">
import HIcon from "./HIcon.vue";
withDefaults(
  defineProps<{ title?: string; description?: string; icon?: string }>(),
  { title: "Your next chapter starts here.", icon: "apps" },
);
</script>
<template>
  <section class="h-empty" part="base">
    <span class="h-empty-icon" part="icon"
      ><HIcon :name="icon" :size="27"
    /></span>
    <h2 part="title">{{ title }}</h2>
    <p v-if="description" part="description">{{ description }}</p>
    <div class="h-empty-actions"><slot /></div>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-empty {
  padding: 56px 24px;
  text-align: center;
  border: 1px dashed var(--h-border);
  border-radius: var(--h-radius-card);
  font-family: var(--h-font);
  color: var(--h-text);
}
.h-empty-icon {
  display: grid;
  place-items: center;
  width: 60px;
  height: 60px;
  border-radius: calc(var(--h-radius-control) + 6px);
  margin: 0 auto 22px;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  border: 1px solid color-mix(in srgb, var(--h-accent) 15%, transparent);
}
h2 {
  font-size: 22px;
  font-weight: 500;
  letter-spacing: -0.6px;
}
p {
  max-width: 410px;
  font-size: 13px;
  line-height: 1.8;
  color: var(--h-muted);
  margin: 12px auto 0;
}
.h-empty-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 25px;
}
</style>
