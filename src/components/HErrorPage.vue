<script setup lang="ts">
import { computed } from "vue";
import HBrand from "./HBrand.vue";
import HButton from "./HButton.vue";
import HButtonBar from "./HButtonBar.vue";
const props = withDefaults(
  defineProps<{
    kind?: "not-found" | "forbidden" | "unavailable";
    brand?: string;
    title?: string;
    description?: string;
    homeHref?: string;
    retryable?: boolean;
  }>(),
  { kind: "not-found", brand: "hearth", homeHref: "/" },
);
const emit = defineEmits<{ retry: [] }>();
const presets = {
  "not-found": {
    code: "404",
    title: "A different trail.",
    description:
      "This page has moved or does not exist. Your next starting point is close by.",
  },
  forbidden: {
    code: "403",
    title: "This space is private.",
    description:
      "Sign in with an account that has access, or head back to your workspace.",
  },
  unavailable: {
    code: "503",
    title: "A little pause.",
    description:
      "This service is temporarily unavailable. Give it a moment and try again.",
  },
};
const detail = computed(() => presets[props.kind]);
</script>
<template>
  <main class="h-error-page" part="base">
    <HBrand :name="brand" />
    <div class="h-error-content">
      <span class="h-error-code" aria-hidden="true" part="code">{{
        detail.code
      }}</span>
      <h1 part="title">{{ title || detail.title }}</h1>
      <p part="description">{{ description || detail.description }}</p>
      <HButtonBar align="center" label="Recovery actions"
        ><HButton :href="homeHref" variant="primary" icon="home"
          >Back to your workspace</HButton
        ><HButton v-if="retryable" @click="emit('retry')">Try again</HButton
        ><slot name="actions"
      /></HButtonBar>
    </div>
    <slot name="footer" />
  </main>
</template>
<style scoped>
@import "../styles/base.css";
.h-error-page {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
}
.h-error-content {
  margin: auto;
  text-align: center;
  padding-block: 65px;
  max-width: 550px;
}
.h-error-code {
  display: block;
  font-size: clamp(70px, 15vw, 140px);
  font-weight: 550;
  letter-spacing: -6px;
  line-height: 1;
  color: var(--h-accent-text);
  opacity: 0.8;
}
h1 {
  font-size: clamp(30px, 5vw, 45px);
  font-weight: 550;
  letter-spacing: -1.4px;
  margin: 25px 0 15px;
}
p {
  font-size: 14px;
  line-height: 1.9;
  color: var(--h-muted);
  margin-bottom: 25px;
}
</style>
