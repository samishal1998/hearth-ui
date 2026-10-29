<script setup lang="ts">
import { computed } from "vue";
import HCodeSnippet from "./HCodeSnippet.vue";
const props = withDefaults(
  defineProps<{
    packages: string[];
    dev?: boolean;
    manager?: "npm" | "pnpm" | "yarn" | "bun";
    label?: string;
  }>(),
  { packages: () => [], manager: "npm", label: "Install packages" },
);
const emit = defineEmits<{
  "update:manager": [manager: string];
  copied: [manager: string];
  "copy-error": [message: string];
}>();
// Package names are command arguments, not arbitrary shell fragments.
const valid = computed(
  () =>
    props.packages.length > 0 &&
    props.packages.every((name) =>
      /^(?:@[a-z0-9._-]+\/)?[a-z0-9][a-z0-9._-]*(?:@[a-z0-9.*^~+_-]+)?$/i.test(
        name,
      ),
    ),
);
const options = computed(() =>
  valid.value
    ? ["npm", "pnpm", "yarn", "bun"].map((manager) => ({
        id: manager,
        label: manager,
        language: "sh",
        code: `${manager} ${manager === "npm" ? "install" : "add"}${props.dev ? " -D" : ""} ${props.packages.join(" ")}`,
      }))
    : [],
);
</script>
<template>
  <div class="h-package-install" part="base">
    <HCodeSnippet
      v-if="valid"
      :options="options"
      :model-value="manager"
      :label="label"
      @update:model-value="emit('update:manager', $event)"
      @copied="emit('copied', $event)"
      @copy-error="emit('copy-error', $event)"
    />
    <p v-else part="empty">
      Provide package names, with optional versions, to generate an install
      command.
    </p>
  </div>
</template>
<style scoped>
.h-package-install {
  min-width: 0;
  max-width: 100%;
}
p {
  color: var(--h-muted);
  font: var(--h-font-size)/1.6 var(--h-font);
  overflow-wrap: anywhere;
}
</style>
