<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import type { TabItem } from "../themes";
const props = withDefaults(
  defineProps<{ items: TabItem[]; modelValue?: string; label?: string }>(),
  { items: () => [], label: "Sections" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();
const local = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (local.value = v),
);
const selected = computed(() =>
  props.items.some((i) => i.value === local.value && !i.disabled)
    ? local.value
    : props.items.find((i) => !i.disabled)?.value,
);
const root = ref<HTMLElement>();
const id = useId();
function select(value: string) {
  local.value = value;
  emit("update:modelValue", value);
  emit("change", value);
}
function key(e: KeyboardEvent) {
  const available = props.items.filter((i) => !i.disabled);
  if (
    !available.length ||
    !["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)
  )
    return;
  e.preventDefault();
  const at = available.findIndex((i) => i.value === selected.value);
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? available.length - 1
        : (at + (e.key === "ArrowRight" ? 1 : -1) + available.length) %
          available.length;
  select(available[next].value);
  const index = props.items.indexOf(available[next]);
  root.value?.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
}
</script>
<template>
  <div ref="root" class="h-tabs" part="base">
    <div
      class="h-tablist"
      part="list"
      role="tablist"
      :aria-label="label"
      @keydown="key"
    >
      <button
        v-for="(item, i) in items"
        :id="`${id}-tab-${i}`"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="selected === item.value"
        :aria-controls="`${id}-panel-${i}`"
        :tabindex="selected === item.value ? 0 : -1"
        :disabled="item.disabled"
        part="tab"
        @click="select(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
    <section
      v-for="(item, i) in items"
      :id="`${id}-panel-${i}`"
      :key="item.value"
      role="tabpanel"
      :aria-labelledby="`${id}-tab-${i}`"
      :hidden="selected !== item.value"
      tabindex="0"
      part="panel"
    >
      <slot :name="item.value" />
    </section>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-tabs {
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
.h-tablist {
  display: inline-flex;
  gap: 3px;
  padding: 4px;
  background: var(--h-surface);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  max-width: 100%;
  overflow: auto;
}
button {
  border: 0;
  border-radius: calc(var(--h-radius-control) - 4px);
  padding: 9px 15px;
  min-height: 40px;
  background: none;
  color: var(--h-muted);
  font-size: 12px;
  white-space: nowrap;
}
button[aria-selected="true"] {
  color: var(--h-text);
  background: color-mix(in srgb, var(--h-text) 8%, transparent);
  box-shadow: var(--h-shadow-soft);
}
button:disabled {
  opacity: 0.5;
}
section {
  margin-top: 20px;
  min-width: 0;
}
section[hidden] {
  display: none;
}
</style>
