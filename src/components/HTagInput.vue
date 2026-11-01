<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  useId,
  nextTick,
  onMounted,
  onBeforeUnmount,
  toRaw,
} from "vue";
import HIcon from "./HIcon.vue";
import { controlSync } from "../internal";
import type { ControlSize } from "../themes";
const props = withDefaults(
  defineProps<{
    label: string;
    modelValue?: string[];
    value?: string[];
    name?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    formDisabled?: boolean;
    hideLabel?: boolean;
    size?: ControlSize;
    maxTags?: number;
    validateValue?: (value: string) => boolean | string;
  }>(),
  { value: () => [], maxTags: 100, placeholder: "Add a tag…" },
);
const emit = defineEmits<{
  "update:modelValue": [values: string[]];
  change: [values: string[]];
  "control-sync": [];
}>();
const id = useId(),
  input = ref<HTMLInputElement>(),
  tags = ref([...new Set(props.modelValue ?? props.value)]),
  draft = ref(""),
  message = ref("");
const initial = [...tags.value];
let form: HTMLFormElement | null | undefined;
let lastEmitted: string[] | undefined;
const blocked = computed(() => props.disabled || props.formDisabled);
watch(
  () => [props.modelValue, props.value],
  () => {
    const incoming = props.modelValue ?? props.value;
    tags.value = [...new Set(incoming)];
    if (toRaw(incoming) !== lastEmitted) {
      draft.value = "";
      message.value = "";
    }
  },
);
function validity() {
  input.value?.setCustomValidity(
    blocked.value || props.readonly
      ? ""
      : props.error ||
          message.value ||
          (props.required && !tags.value.length ? "Add at least one tag." : ""),
  );
}
watch(
  [
    tags,
    draft,
    message,
    () => props.required,
    () => props.error,
    blocked,
    () => props.readonly,
  ],
  validity,
  { flush: "post" },
);
async function notify() {
  lastEmitted = [...tags.value];
  emit("update:modelValue", lastEmitted);
  await nextTick();
  validity();
  emit("control-sync");
  emit("change", [...tags.value]);
}
function commit(raw = draft.value) {
  if (blocked.value || props.readonly || input.value?.matches(":disabled"))
    return;
  const values = raw
    .split(/[,\n]+/)
    .map((value) => value.trim())
    .filter(Boolean);
  const next = [...tags.value];
  message.value = "";
  const limit = Number.isFinite(props.maxTags)
    ? Math.max(1, Math.floor(props.maxTags))
    : 100;
  for (let i = 0; i < values.length; i++) {
    const value = values[i];
    if (next.includes(value)) continue;
    const validation = props.validateValue?.(value);
    if (
      next.length >= limit ||
      validation === false ||
      typeof validation === "string"
    ) {
      message.value =
        next.length >= limit
          ? `Limit of ${limit} tags reached.`
          : typeof validation === "string"
            ? validation
            : `${value} is not valid.`;
      draft.value = values.slice(i).join(", ");
      tags.value = next;
      notify();
      return;
    }
    next.push(value);
  }
  draft.value = "";
  tags.value = next;
  notify();
}
function remove(index: number) {
  if (blocked.value || props.readonly || input.value?.matches(":disabled"))
    return;
  tags.value = tags.value.filter((_, i) => i !== index);
  message.value = "";
  notify();
  input.value?.focus();
}
function key(event: KeyboardEvent) {
  if (
    event.isComposing ||
    event.keyCode === 229 ||
    blocked.value ||
    props.readonly
  )
    return;
  if ((event.key === "Enter" || event.key === ",") && draft.value.trim()) {
    event.preventDefault();
    commit();
  } else if (event.key === "Backspace" && !draft.value && tags.value.length) {
    event.preventDefault();
    remove(tags.value.length - 1);
  }
}
function paste(event: ClipboardEvent) {
  if (blocked.value || props.readonly) return;
  const text = event.clipboardData?.getData("text") || "";
  if (!/[,\n]/.test(text)) return;
  event.preventDefault();
  const start = input.value?.selectionStart ?? draft.value.length,
    end = input.value?.selectionEnd ?? start;
  commit(draft.value.slice(0, start) + text + draft.value.slice(end));
}
function reset(event: Event) {
  queueMicrotask(() => {
    if (event.defaultPrevented) return;
    tags.value = [...initial];
    draft.value = "";
    message.value = "";
    emit("update:modelValue", [...tags.value]);
    nextTick(() => {
      validity();
      emit("control-sync");
    });
  });
}
onMounted(() => {
  validity();
  form = input.value?.form;
  form?.addEventListener("reset", reset);
});
onBeforeUnmount(() => form?.removeEventListener("reset", reset));
controlSync(emit);
</script>
<template>
  <div
    class="h-tag-input"
    :class="size ? `h-size-${size}` : undefined"
    part="base"
  >
    <label :for="id" :class="{ 'h-sr-only': hideLabel }" part="label">{{
      label
    }}</label>
    <div
      class="h-tag-control"
      :class="{ invalid: !!(error || message), disabled: blocked }"
      part="frame"
    >
      <ul v-if="tags.length" :aria-label="`${label} tags`">
        <li v-for="(tag, index) in tags" :key="tag">
          <span>{{ tag }}</span
          ><button
            type="button"
            :disabled="blocked || readonly"
            :aria-label="`Remove ${tag}`"
            @click="remove(index)"
          >
            <HIcon name="close" :size="14" /></button
          ><input
            type="hidden"
            data-h-form-value
            :name="name"
            :value="tag"
            :disabled="blocked"
          />
        </li>
      </ul>
      <input
        ref="input"
        :id="id"
        v-model="draft"
        data-h-form-control
        data-h-multiple
        :placeholder="placeholder"
        :disabled="blocked"
        :readonly="readonly"
        :required="required && !tags.length && !readonly"
        :aria-invalid="!!(error || message)"
        :aria-describedby="`${id}-help`"
        autocomplete="off"
        part="control"
        @input="message = ''"
        @keydown="key"
        @paste="paste"
      />
    </div>
    <p
      :id="`${id}-help`"
      :class="{ error: !!(error || message) }"
      :role="error || message ? 'alert' : undefined"
      part="hint"
    >
      {{
        error ||
        message ||
        hint ||
        "Press Enter or comma to add. Paste multiple values separated by commas or new lines."
      }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/field.css";
.h-tag-input {
  min-width: 0;
  font: var(--h-font-size)/1.6 var(--h-font);
  color: var(--h-text);
}
label {
  display: block;
  font-size: 12px;
  margin-bottom: calc(var(--h-space) * 2);
}
.h-tag-control {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
  min-height: var(--h-field-height);
  padding: 3px 6px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
}
.h-tag-control:focus-within {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.invalid {
  border-color: var(--h-danger);
}
.disabled {
  opacity: 0.55;
}
ul {
  display: contents;
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  border-radius: 5px;
  padding-inline-start: 6px;
  font-size: 12px;
}
li > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  min-width: 24px;
  min-height: 24px;
  border: 0;
  background: none;
  color: inherit;
  border-radius: 4px;
  padding: 0;
}
input:not([type="hidden"]) {
  min-width: 80px;
  flex: 1;
  width: 100%;
  border: 0;
  background: none;
  color: var(--h-text);
  padding: 3px;
  min-height: calc(var(--h-field-height) - 8px);
  font-size: max(var(--h-font-min-size), var(--h-field-font-size));
}
input:focus-visible {
  outline: none;
}
p {
  font-size: 12px;
  color: var(--h-muted);
  margin-top: 6px;
}
.error {
  color: var(--h-danger);
}
@media (pointer: coarse) {
  button {
    min-width: 44px;
    min-height: 44px;
  }
  input:not([type="hidden"]) {
    min-height: 44px;
  }
}
</style>
