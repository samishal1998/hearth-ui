<script setup lang="ts">
import { ref, watch, useId } from "vue";
import HIcon from "./HIcon.vue";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    defaultOpen?: boolean;
    label: string;
    disabled?: boolean;
  }>(),
  { open: undefined },
);
const emit = defineEmits<{
  "update:open": [open: boolean];
  change: [open: boolean];
}>();
const local = ref(props.open ?? !!props.defaultOpen),
  id = useId();
watch(
  () => props.open,
  (value) => {
    if (value !== undefined) local.value = value;
  },
);
function toggle(event: Event) {
  const next = (event.currentTarget as HTMLDetailsElement).open;
  if (local.value === next) return;
  local.value = next;
  emit("update:open", next);
  emit("change", next);
}
</script>
<template>
  <details :open="local" class="h-collapsible" part="base" @toggle="toggle">
    <summary
      :aria-disabled="disabled || undefined"
      :tabindex="disabled ? -1 : 0"
      :aria-controls="id"
      part="trigger"
      @click="disabled && $event.preventDefault()"
    >
      <slot name="trigger">{{ label }}</slot
      ><HIcon name="down" :size="16" />
    </summary>
    <div :id="id" part="body"><slot /></div>
  </details>
</template>
<style scoped>
@import "../styles/base.css";
.h-collapsible {
  min-width: 0;
  font: 13px/1.8 var(--h-font);
  color: var(--h-text);
}
summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  cursor: pointer;
  list-style: none;
}
summary::-webkit-details-marker {
  display: none;
}
[open] > summary > .h-icon {
  transform: rotate(180deg);
}
[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
