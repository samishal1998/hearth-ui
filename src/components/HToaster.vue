<script setup lang="ts">
import HToast from "./HToast.vue";
import type { ToastItem } from "../themes";
withDefaults(
  defineProps<{
    items: ToastItem[];
    position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
    limit?: number;
    label?: string;
  }>(),
  {
    items: () => [],
    position: "bottom-right",
    limit: 3,
    label: "Notifications",
  },
);
const emit = defineEmits<{ dismiss: [id: string]; action: [id: string] }>();
</script>
<template>
  <section class="h-toaster" :class="position" :aria-label="label" part="base">
    <HToast
      v-for="toast in items.slice(-Math.max(1, limit))"
      :key="toast.id"
      v-bind="toast"
      @dismiss="emit('dismiss', toast.id)"
      @action="emit('action', toast.id)"
    /><slot />
  </section>
</template>
<style scoped>
.h-toaster {
  position: fixed;
  z-index: 100;
  display: grid;
  gap: 10px;
  width: 380px;
  max-width: calc(100vw - 32px);
  padding: 0;
  pointer-events: none;
}
.h-toaster > * {
  pointer-events: auto;
}
.top-right {
  top: 16px;
  right: 16px;
}
.top-left {
  top: 16px;
  left: 16px;
}
.bottom-right {
  bottom: 16px;
  right: 16px;
}
.bottom-left {
  bottom: 16px;
  left: 16px;
}
</style>
