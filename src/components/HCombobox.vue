<script setup lang="ts">
import {
  computed,
  ref,
  watch,
  useId,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  nextTick,
} from "vue";
import HIcon from "./HIcon.vue";
import type { ComboboxOption, ComboboxProps } from "../themes";
const props = withDefaults(defineProps<ComboboxProps>(), {
  options: () => [],
  placeholder: "Search options…",
  clearable: true,
  emptyText: "No matching options.",
});
const emit = defineEmits<{
  "update:modelValue": [value: string | string[]];
  change: [value: string | string[]];
  search: [query: string];
  "control-sync": [];
}>();
const id = useId();
const root = ref<HTMLElement>();
const input = ref<HTMLInputElement>();
const list = ref<HTMLElement>();
const open = ref(false);
const query = ref("");
const active = ref(-1);
function normalize(value?: string | string[]) {
  const values = [
    ...new Set(
      (Array.isArray(value) ? value : value ? [value] : []).filter(
        (v) => typeof v === "string",
      ),
    ),
  ];
  return props.multiple ? values : values[0] || "";
}
const local = ref(normalize(props.modelValue ?? props.value));
const selected = computed(() =>
  Array.isArray(local.value) ? local.value : local.value ? [local.value] : [],
);
const blocked = computed(() => props.disabled || props.formDisabled);
const filtered = computed(() =>
  props.loading
    ? []
    : props.options.filter((option) =>
        `${option.label} ${option.description || ""} ${(option.keywords || []).join(" ")}`
          .toLowerCase()
          .includes(query.value.toLowerCase()),
      ),
);
const displayLabel = (value: string) =>
  props.options.find((o) => o.value === value)?.label || value;
watch(
  () => [props.modelValue, props.value, props.multiple],
  () => (local.value = normalize(props.modelValue ?? props.value)),
);
watch(
  filtered,
  () => (active.value = filtered.value.findIndex((o) => !o.disabled)),
);
watch(blocked, (v) => {
  if (v) close();
});
function sync() {
  input.value?.setCustomValidity(
    props.required && !selected.value.length
      ? "Choose an option from the list."
      : "",
  );
  emit("control-sync");
}
onMounted(sync);
onUpdated(sync);
function outside(e: PointerEvent) {
  if (root.value && !e.composedPath().includes(root.value)) close();
}
onMounted(() =>
  root.value?.ownerDocument.addEventListener("pointerdown", outside),
);
onBeforeUnmount(() =>
  root.value?.ownerDocument.removeEventListener("pointerdown", outside),
);
function close() {
  open.value = false;
  query.value = "";
  active.value = -1;
}
function show() {
  if (blocked.value || input.value?.matches(":disabled")) return;
  open.value = true;
  active.value = filtered.value.findIndex((o) => !o.disabled);
}
function search(e: Event) {
  query.value = (e.target as HTMLInputElement).value;
  show();
  emit("search", query.value);
}
async function commit(values: string[]) {
  local.value = normalize(values);
  query.value = "";
  if (!props.multiple) open.value = false;
  await nextTick();
  emit(
    "update:modelValue",
    Array.isArray(local.value) ? [...local.value] : local.value,
  );
  emit("change", Array.isArray(local.value) ? [...local.value] : local.value);
}
function choose(option: ComboboxOption) {
  if (option.disabled || blocked.value || input.value?.matches(":disabled"))
    return;
  commit(
    props.multiple
      ? selected.value.includes(option.value)
        ? selected.value.filter((v) => v !== option.value)
        : [...selected.value, option.value]
      : [option.value],
  );
}
async function move(direction: number) {
  const indices = filtered.value.flatMap((o, i) => (o.disabled ? [] : [i]));
  if (!indices.length) {
    active.value = -1;
    return;
  }
  const index = indices.indexOf(active.value);
  active.value = indices[(index + direction + indices.length) % indices.length];
  await nextTick();
  list.value
    ?.querySelector<HTMLElement>(`[id="${id}-option-${active.value}"]`)
    ?.scrollIntoView({ block: "nearest" });
}
function lastEnabled() {
  for (let i = filtered.value.length - 1; i >= 0; i--)
    if (!filtered.value[i].disabled) return i;
  return -1;
}
function key(e: KeyboardEvent) {
  if (e.isComposing) return;
  if (["ArrowDown", "ArrowUp"].includes(e.key)) {
    e.preventDefault();
    e.stopPropagation();
    if (!open.value) {
      show();
      if (e.key === "ArrowUp") active.value = lastEnabled();
    } else move(e.key === "ArrowDown" ? 1 : -1);
  } else if (e.key === "Enter" && open.value) {
    e.preventDefault();
    e.stopPropagation();
    const option = filtered.value[active.value];
    if (option) choose(option);
  } else if (e.key === "Escape" && open.value) {
    e.preventDefault();
    e.stopPropagation();
    close();
  } else if ((e.key === "Home" || e.key === "End") && open.value) {
    e.preventDefault();
    active.value =
      e.key === "Home"
        ? filtered.value.findIndex((o) => !o.disabled)
        : lastEnabled();
  } else if (
    e.key === "Backspace" &&
    props.multiple &&
    !query.value &&
    selected.value.length
  ) {
    e.preventDefault();
    commit(selected.value.slice(0, -1));
  } else if (e.key === "Tab") close();
}
</script>
<template>
  <fieldset
    ref="root"
    class="h-combobox"
    part="base"
    :disabled="blocked"
    @focusout="
      (e) => {
        if (!root?.contains(e.relatedTarget as Node)) close();
      }
    "
  >
    <label :for="id" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <div class="h-combo-anchor">
      <div
        class="h-combo-control"
        part="control"
        :class="{ invalid: error, expanded: open }"
      >
        <div
          v-if="multiple && selected.length"
          class="h-chips"
          part="selection"
        >
          <span v-for="value in selected" :key="value" class="h-chip"
            ><span>{{ displayLabel(value) }}</span
            ><button
              type="button"
              :aria-label="`Remove ${displayLabel(value)}`"
              @mousedown.prevent
              @click="commit(selected.filter((v) => v !== value))"
            >
              <HIcon name="close" :size="12" /></button
          ></span>
        </div>
        <div class="h-combo-line">
          <input
            :id="id"
            ref="input"
            data-h-form-control
            :data-h-multiple="multiple ? '' : undefined"
            role="combobox"
            aria-autocomplete="list"
            :aria-expanded="open && !blocked"
            :aria-controls="`${id}-list`"
            :aria-activedescendant="
              open && active >= 0 ? `${id}-option-${active}` : undefined
            "
            :aria-invalid="!!error"
            :aria-describedby="hint || error ? `${id}-help` : undefined"
            :value="
              open ? query : multiple ? '' : displayLabel(selected[0] || '')
            "
            :placeholder="placeholder"
            :required="required && !selected.length"
            autocomplete="off"
            @focus="show"
            @input="search"
            @keydown="key"
          /><button
            v-if="clearable && selected.length"
            type="button"
            class="h-combo-action"
            :aria-label="`Clear ${label}`"
            @mousedown.prevent
            @click="commit([])"
          >
            <HIcon name="close" :size="15" /></button
          ><button
            type="button"
            class="h-combo-action"
            tabindex="-1"
            :aria-label="`Toggle ${label} options`"
            @mousedown.prevent
            @click="
              () => {
                if (open) close();
                else {
                  input?.focus();
                  show();
                }
              }
            "
          >
            <HIcon name="down" :size="17" />
          </button>
        </div>
      </div>
      <div v-if="open && !blocked" class="h-combo-popup" part="popup">
        <div
          ref="list"
          :id="`${id}-list`"
          role="listbox"
          :aria-label="label"
          :aria-multiselectable="multiple || undefined"
        >
          <button
            v-for="(option, i) in filtered"
            :id="`${id}-option-${i}`"
            :key="option.value"
            type="button"
            role="option"
            part="option"
            tabindex="-1"
            :aria-selected="selected.includes(option.value)"
            :disabled="option.disabled"
            :class="{ active: i === active }"
            @mousedown.prevent
            @pointermove="active = i"
            @click="choose(option)"
          >
            <span
              ><strong>{{ option.label }}</strong
              ><small v-if="option.description">{{
                option.description
              }}</small></span
            ><HIcon
              v-if="selected.includes(option.value)"
              name="check"
              :size="16"
            />
          </button>
        </div>
        <p v-if="!filtered.length" role="status" class="h-combo-empty">
          {{ loading ? "Loading options…" : emptyText }}
        </p>
      </div>
    </div>
    <input
      v-for="(value, index) in selected"
      :key="`${index}-${value}`"
      data-h-form-value
      type="hidden"
      :name="name"
      :value="value"
    />
    <p
      v-if="hint || error"
      :id="`${id}-help`"
      class="h-combo-hint"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
      part="hint"
    >
      {{ error || hint }}
    </p>
    <span class="h-sr-only" aria-live="polite">{{
      multiple ? `${selected.length} selected.` : ""
    }}</span>
  </fieldset>
</template>
<style scoped>
@import "../styles/base.css";
.h-combobox {
  position: relative;
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
  font-family: var(--h-font);
  color: var(--h-text);
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 7px;
}
label > span {
  color: var(--h-accent-text);
}
.h-combo-control {
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  min-width: 0;
}
.h-combo-anchor {
  position: relative;
  min-width: 0;
}
.h-combo-control:focus-within {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-combo-control.invalid {
  border-color: var(--h-danger);
}
.h-combo-line {
  display: flex;
  align-items: center;
  min-height: var(--h-control-height);
  padding: 4px 6px;
  padding-inline-start: 12px;
  gap: 4px;
}
input[role="combobox"] {
  min-width: 0;
  flex: 1;
  width: 100%;
  min-height: 40px;
  border: 0;
  background: none;
  color: var(--h-text);
  padding: 8px 0;
  font-size: 13px;
}
input[role="combobox"]:focus-visible {
  outline: none;
}
input::placeholder {
  color: var(--h-faint);
}
.h-combo-action {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: 0;
  border-radius: calc(var(--h-radius-control) - 4px);
  background: none;
  color: var(--h-muted);
}
.h-combo-action:hover {
  color: var(--h-accent-text);
}
.h-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 9px 10px 0;
}
.h-chip {
  display: inline-flex;
  align-items: center;
  max-width: 100%;
  padding: 2px 3px 2px 8px;
  border-radius: 6px;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  font-size: 11px;
}
.h-chip > span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.h-chip button {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 0;
  background: none;
  color: inherit;
  border-radius: 4px;
  flex-shrink: 0;
}
/* ponytail: local popup can be clipped by overflow ancestors; use anchored popovers if portal positioning becomes necessary. */
.h-combo-popup {
  position: absolute;
  z-index: 20;
  inset-inline: 0;
  top: 100%;
  margin-top: 7px;
  max-height: 260px;
  overflow: auto;
  padding: 5px;
  background: var(--h-raised);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  box-shadow: var(--h-shadow);
}
[role="option"] {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  width: 100%;
  padding: 10px;
  border: 0;
  border-radius: calc(var(--h-radius-control) - 4px);
  background: transparent;
  color: var(--h-text);
  text-align: left;
  font-size: 13px;
}
[role="option"].active,
[role="option"]:hover {
  background: var(--h-accent-subtle);
}
[role="option"][aria-selected="true"] {
  color: var(--h-accent-text);
}
[role="option"]:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
[role="option"] strong {
  font-size: 13px;
  font-weight: 500;
}
[role="option"] small {
  display: block;
  font-size: 11px;
  color: var(--h-muted);
  margin-top: 3px;
  line-height: 1.7;
}
.h-combo-empty {
  padding: 14px;
  font-size: 12px;
  color: var(--h-muted);
}
.h-combo-hint {
  font-size: 11px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-top: 7px;
}
.h-combo-hint.error {
  color: var(--h-danger);
}
.h-combobox:has(input[role="combobox"]:disabled) .h-combo-control {
  opacity: 0.55;
}
.h-combobox:has(input[role="combobox"]:disabled) .h-combo-popup {
  display: none;
}
</style>
