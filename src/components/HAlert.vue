<script setup lang="ts">
import HIcon from "./HIcon.vue";
import type { Tone } from "../themes";
withDefaults(
  defineProps<{
    title?: string;
    description?: string;
    tone?: Tone;
    dismissible?: boolean;
  }>(),
  { tone: "info" },
);
const emit = defineEmits<{ dismiss: [] }>();
</script>
<template>
  <div
    class="h-alert"
    :class="tone"
    :role="tone === 'danger' ? 'alert' : 'status'"
    part="base"
  >
    <HIcon :name="tone === 'success' ? 'check' : 'info'" />
    <div class="h-alert-content">
      <strong v-if="title" part="title">{{ title }}</strong>
      <p v-if="description" part="description">{{ description }}</p>
      <slot />
    </div>
    <button
      v-if="dismissible"
      type="button"
      aria-label="Dismiss notification"
      @click="emit('dismiss')"
    >
      <HIcon name="close" :size="18" />
    </button>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-alert {
  --alert-color: var(--h-info);
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 17px 18px;
  background: color-mix(in srgb, var(--alert-color) 7%, var(--h-surface));
  border: 1px solid color-mix(in srgb, var(--alert-color) 24%, transparent);
  border-radius: var(--h-radius-control);
  font-family: var(--h-font);
  color: var(--h-text);
}
.h-alert > .h-icon {
  color: var(--alert-color);
  margin-top: 1px;
}
.success {
  --alert-color: var(--h-success);
}
.warning {
  --alert-color: var(--h-warning);
}
.danger {
  --alert-color: var(--h-danger);
}
.accent {
  --alert-color: var(--h-accent-text);
}
.neutral {
  --alert-color: var(--h-muted);
}
.h-alert-content {
  min-width: 0;
  flex: 1;
}
strong {
  font-size: 13px;
  font-weight: 550;
}
p {
  color: var(--h-muted);
  font-size: 12px;
  line-height: 1.8;
  margin-top: 3px;
}
button {
  border: 0;
  background: transparent;
  color: var(--alert-color);
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border-radius: var(--h-radius-control);
  margin: -9px -10px -9px 0;
  flex-shrink: 0;
}
</style>
