<script setup lang="ts">
import { ref, watch, computed, useId, nextTick } from "vue";
import HIcon from "./HIcon.vue";
import type { ChoiceOption } from "../themes";
import {
  nextCollectionId,
  toggleSelection,
  createTypeahead,
} from "../primitives";
const props = withDefaults(
  defineProps<{
    options: ChoiceOption[];
    modelValue?: string | string[];
    value?: string | string[];
    label: string;
    multiple?: boolean;
    disabled?: boolean;
  }>(),
  { options: () => [], value: "" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string | string[]];
  change: [value: string | string[]];
}>();
const id = useId(),
  root = ref<HTMLElement>(),
  selected = ref<string[]>([]),
  active = ref(""),
  typeahead = createTypeahead();
function sync() {
  const value = props.modelValue ?? props.value;
  selected.value = Array.isArray(value) ? [...value] : value ? [value] : [];
}
sync();
watch(() => [props.modelValue, props.value], sync);
const collection = computed(() =>
  props.options.map((option) => ({
    id: option.value,
    textValue: option.label,
    disabled: props.disabled || option.disabled,
  })),
);
const activeId = computed(() =>
  collection.value.some((item) => item.id === active.value && !item.disabled)
    ? active.value
    : collection.value.find((item) => !item.disabled)?.id,
);
function select(value: string) {
  if (
    props.disabled ||
    props.options.find((item) => item.value === value)?.disabled
  )
    return;
  selected.value = toggleSelection(selected.value, value, props.multiple);
  active.value = value;
  const output = props.multiple ? [...selected.value] : selected.value[0] || "";
  emit("update:modelValue", output);
  emit("change", output);
  root.value?.focus({ preventScroll: true });
}
async function key(event: KeyboardEvent) {
  if (event.isComposing || props.disabled) return;
  if (["Enter", " "].includes(event.key)) {
    event.preventDefault();
    if (activeId.value) select(activeId.value);
    return;
  }
  const next = ["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)
    ? nextCollectionId(collection.value, activeId.value, event.key)
    : event.key.length === 1 && !event.ctrlKey && !event.metaKey
      ? typeahead.search(collection.value, event.key, activeId.value)
      : undefined;
  if (next) {
    event.preventDefault();
    active.value = next;
    await nextTick();
    root.value
      ?.querySelector(`[data-value="${CSS.escape(next)}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }
}
</script>
<template>
  <div
    ref="root"
    role="listbox"
    :aria-label="label"
    :aria-multiselectable="multiple || undefined"
    :aria-disabled="disabled || undefined"
    :aria-activedescendant="
      activeId
        ? `${id}-${options.findIndex((option) => option.value === activeId)}`
        : undefined
    "
    :tabindex="disabled ? -1 : 0"
    class="h-listbox"
    part="base"
    @keydown="key"
  >
    <button
      v-for="(option, index) in options"
      :id="`${id}-${index}`"
      :key="option.value"
      :data-value="option.value"
      role="option"
      type="button"
      tabindex="-1"
      :disabled="disabled || option.disabled"
      :aria-selected="selected.includes(option.value)"
      :class="{ active: option.value === activeId }"
      part="option"
      @mousedown.prevent
      @click="select(option.value)"
    >
      <span
        ><slot :name="`option:${option.value}`" :option="option"
          ><strong>{{ option.label }}</strong
          ><small v-if="option.description">{{
            option.description
          }}</small></slot
        ></span
      ><HIcon v-if="selected.includes(option.value)" name="check" :size="16" />
    </button>
    <p v-if="!options.length">No options.</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-listbox {
  min-width: 0;
  max-height: var(--h-listbox-max-height, 300px);
  overflow: auto;
  overscroll-behavior: contain;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  padding: 4px;
  font: 13px/1.7 var(--h-font);
  color: var(--h-text);
  background: var(--h-bg);
}
button {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 10px;
  width: 100%;
  text-align: start;
  background: none;
  border: 0;
  border-radius: max(4px, calc(var(--h-radius-control) - 4px));
  color: inherit;
  font: inherit;
  cursor: pointer;
}
.active,
button:hover {
  background: var(--h-accent-subtle);
}
[aria-selected="true"] {
  color: var(--h-accent-text);
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
strong {
  display: block;
  font-weight: 550;
}
small {
  display: block;
  color: var(--h-muted);
}
p {
  margin: 12px;
  color: var(--h-muted);
}
</style>
