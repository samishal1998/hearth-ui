<script setup lang="ts">
import { computed, ref, watch, useId } from "vue";
import type { TabItem } from "../themes";
const props = withDefaults(
  defineProps<{
    items: TabItem[];
    modelValue?: string;
    label?: string;
    orientation?: "horizontal" | "vertical";
    activation?: "automatic" | "manual";
    variant?: "pill" | "underline";
  }>(),
  {
    items: () => [],
    label: "Sections",
    orientation: "horizontal",
    activation: "automatic",
    variant: "pill",
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
}>();
const local = ref(props.modelValue);
const focused = ref<string>();
watch(
  () => props.modelValue,
  (v) => {
    local.value = v;
    focused.value = undefined;
  },
);
const selected = computed(() =>
  props.items.some((i) => i.value === local.value && !i.disabled)
    ? local.value
    : props.items.find((i) => !i.disabled)?.value,
);
const root = ref<HTMLElement>();
const id = useId();
function select(value: string) {
  focused.value = value;
  local.value = value;
  emit("update:modelValue", value);
  emit("change", value);
}
function key(e: KeyboardEvent) {
  const available = props.items.filter((i) => !i.disabled);
  if (
    !available.length ||
    !(
      props.orientation === "vertical"
        ? ["ArrowUp", "ArrowDown", "Home", "End"]
        : ["ArrowLeft", "ArrowRight", "Home", "End"]
    ).includes(e.key)
  )
    return;
  e.preventDefault();
  const at = available.findIndex(
    (i) => i.value === (focused.value || selected.value),
  );
  const next =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? available.length - 1
        : (at +
            (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) +
            available.length) %
          available.length;
  focused.value = available[next].value;
  if (props.activation === "automatic") select(available[next].value);
  const index = props.items.indexOf(available[next]);
  root.value?.querySelectorAll<HTMLButtonElement>("[role=tab]")[index]?.focus();
}
</script>
<template>
  <div ref="root" class="h-tabs" :class="[orientation, variant]" part="base">
    <div
      class="h-tablist"
      part="list"
      role="tablist"
      :aria-label="label"
      :aria-orientation="orientation"
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
        :tabindex="
          (props.items.some((i) => i.value === focused && !i.disabled)
            ? focused
            : selected) === item.value
            ? 0
            : -1
        "
        :disabled="item.disabled"
        part="tab"
        @click="select(item.value)"
        @focus="focused = item.value"
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
.vertical {
  display: grid;
  grid-template-columns: minmax(100px, 180px) minmax(0, 1fr);
  gap: 20px;
}
.vertical .h-tablist {
  display: flex;
  flex-direction: column;
  align-self: start;
}
.vertical button {
  text-align: left;
  white-space: normal;
}
.vertical section {
  margin-top: 0;
  overflow-wrap: anywhere;
}
.underline .h-tablist {
  border: 0;
  border-bottom: 1px solid var(--h-border);
  border-radius: 0;
  background: none;
  padding: 0;
}
.underline button {
  border-radius: 0;
  border-bottom: 2px solid transparent;
  background: none;
  box-shadow: none;
}
.underline button[aria-selected="true"] {
  color: var(--h-accent-text);
  border-bottom-color: var(--h-accent);
}
.vertical.underline .h-tablist {
  border-bottom: 0;
  border-inline-end: 1px solid var(--h-border);
}
</style>
