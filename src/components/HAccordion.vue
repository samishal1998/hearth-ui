<script setup lang="ts">
import { ref, watch, useId } from "vue";
import HIcon from "./HIcon.vue";
import type { AccordionItem } from "../themes";
const props = withDefaults(
  defineProps<{
    items: AccordionItem[];
    modelValue?: string[];
    value?: string[];
    multiple?: boolean;
    defaultOpen?: string[];
    compact?: boolean;
    variant?: "surface" | "flat";
  }>(),
  { items: () => [], value: undefined, variant: "surface" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string[]];
  change: [value: string[]];
}>();
const id = useId();
const local = ref(
  (
    props.modelValue ??
    props.value ??
    props.defaultOpen ??
    props.items.filter((item) => item.defaultOpen).map((item) => item.id)
  ).slice(0, props.multiple ? undefined : 1),
);
watch(
  () => [props.modelValue, props.value, props.multiple],
  () =>
    (local.value = (props.modelValue ?? props.value ?? local.value).slice(
      0,
      props.multiple ? undefined : 1,
    )),
);
function toggle(item: AccordionItem, e: Event) {
  const open = (e.currentTarget as HTMLDetailsElement).open;
  if (local.value.includes(item.id) === open) return;
  local.value = open
    ? props.multiple
      ? [...local.value, item.id]
      : [item.id]
    : local.value.filter((v) => v !== item.id);
  emit("update:modelValue", [...local.value]);
  emit("change", [...local.value]);
}
</script>
<template>
  <div class="h-accordion" :class="[variant, { compact }]" part="base">
    <details
      v-for="(item, i) in items"
      :key="item.id"
      :open="local.includes(item.id)"
      part="item"
      @toggle="toggle(item, $event)"
    >
      <summary
        :id="`${id}-trigger-${i}`"
        :aria-controls="`${id}-panel-${i}`"
        :aria-disabled="item.disabled || undefined"
        :tabindex="item.disabled ? -1 : 0"
        part="trigger"
        @click="
          (e) => {
            if (item.disabled) e.preventDefault();
          }
        "
      >
        <span
          ><slot
            :name="`header:${item.id}`"
            :item="item"
            :open="local.includes(item.id)"
            >{{ item.title }}</slot
          ></span
        ><HIcon name="down" :size="17" />
      </summary>
      <div
        :id="`${id}-panel-${i}`"
        role="region"
        :aria-labelledby="`${id}-trigger-${i}`"
        part="panel"
      >
        <slot :name="item.id"
          ><p>{{ item.description }}</p></slot
        >
      </div>
    </details>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-accordion {
  display: grid;
  gap: 10px;
  min-width: 0;
  color: var(--h-text);
  font-family: var(--h-font);
}
details {
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
}
summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  list-style: none;
  min-height: 54px;
  padding: 15px 18px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
summary::-webkit-details-marker {
  display: none;
}
summary > .h-icon {
  color: var(--h-muted);
  flex-shrink: 0;
  transition: transform var(--h-motion);
}
details[open] summary > .h-icon {
  transform: rotate(180deg);
}
summary[aria-disabled="true"] {
  opacity: 0.5;
  cursor: not-allowed;
}
[role="region"] {
  padding: 0 18px 18px;
  color: var(--h-muted);
  font-size: 13px;
  line-height: 1.85;
}
.flat {
  gap: 0;
}
.flat details {
  background: transparent;
  border: 0;
  border-bottom: 1px solid var(--h-border);
  border-radius: 0;
}
.compact summary {
  min-height: 40px;
  padding: 8px 12px;
}
.compact [role="region"] {
  padding: 0 12px 12px;
}
</style>
