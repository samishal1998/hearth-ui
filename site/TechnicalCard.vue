<script setup lang="ts">
import { useId } from "vue";
import { HCard } from "../src";
withDefaults(
  defineProps<{ title: string; description?: string; components?: string[] }>(),
  { components: () => [] },
);
const id = useId();
</script>
<template>
  <HCard :aria-labelledby="id">
    <template #header
      ><header class="technical-card-header">
        <h3 :id="id">{{ title }}</h3>
        <p v-if="description">{{ description }}</p>
      </header></template
    >
    <slot />
    <template v-if="components.length" #footer
      ><nav
        class="technical-card-references"
        :aria-label="`${title} component references`"
      >
        <span>API</span
        ><a
          v-for="component in components"
          :key="component"
          :href="`#components/${component}`"
          >{{ component }}</a
        >
      </nav></template
    >
  </HCard>
</template>
<style scoped>
.technical-card-header {
  margin-bottom: 20px;
  min-width: 0;
}
h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 550;
  letter-spacing: -0.3px;
  overflow-wrap: anywhere;
}
p {
  margin: 7px 0 0;
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.technical-card-references {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 12px;
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--h-border);
  font-size: 12px;
}
.technical-card-references > span {
  color: var(--h-faint);
  font-size: 11px;
  letter-spacing: 0.06em;
}
a {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  color: var(--h-accent-text);
  text-decoration: underline;
  text-underline-offset: 3px;
  overflow-wrap: anywhere;
}
a:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
  border-radius: 3px;
}
@media (pointer: coarse) {
  a {
    min-height: 44px;
  }
}
</style>
