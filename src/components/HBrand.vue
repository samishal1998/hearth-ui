<script setup lang="ts">
withDefaults(
  defineProps<{ name?: string; logo?: string; tagline?: string }>(),
  { name: "hearth" },
);
</script>
<template>
  <span class="h-brand" part="base"
    ><img v-if="logo" :src="logo" alt="" /><span
      ><span class="h-wordmark">{{ name }}<span class="h-dot">.</span></span
      ><small v-if="tagline">{{ tagline }}</small></span
    ></span
  >
</template>
<style scoped>
.h-brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-wordmark {
  font-size: 28px;
  font-weight: 760;
  letter-spacing: -1.5px;
  line-height: 1.1;
}
.h-dot {
  color: var(--h-accent);
}
img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}
small {
  display: block;
  font-size: 11px;
  color: var(--h-muted);
  margin-top: 5px;
  letter-spacing: 0;
}
</style>
