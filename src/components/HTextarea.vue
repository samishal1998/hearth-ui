<script setup lang="ts">
import { ref, watch, useId } from "vue";
import { controlSync, describedBy } from "../internal";
import type { ControlSize } from "../themes";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    placeholder?: string;
    hint?: string;
    error?: string;
    rows?: number;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    minlength?: number;
    maxlength?: number;
    resize?: "vertical" | "none" | "both";
    hideLabel?: boolean;
    size?: ControlSize;
    submitOnEnter?: boolean;
  }>(),
  { value: "", rows: 4, resize: "vertical" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  submit: [value: string];
  "control-sync": [];
}>();
const id = useId();
const local = ref(props.modelValue ?? props.value);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
controlSync(emit);
function input(e: Event) {
  local.value = (e.target as HTMLTextAreaElement).value;
  emit("update:modelValue", local.value);
}
function key(event: KeyboardEvent) {
  if (
    !props.submitOnEnter ||
    event.defaultPrevented ||
    event.key !== "Enter" ||
    event.shiftKey ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    event.isComposing ||
    props.disabled ||
    props.readonly
  )
    return;
  event.preventDefault();
  event.stopPropagation();
  if ((event.currentTarget as HTMLTextAreaElement).checkValidity())
    emit("submit", local.value);
}
</script>
<template>
  <div
    class="h-textarea"
    :class="size ? `h-size-${size}` : undefined"
    part="base"
  >
    <label :for="id" :class="{ 'h-sr-only': hideLabel }" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    ><textarea
      v-bind="$attrs"
      :id="id"
      :name="name"
      :value="local"
      :placeholder="placeholder"
      :rows="Math.max(1, rows)"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :minlength="minlength"
      :maxlength="maxlength"
      :style="{ resize }"
      :aria-invalid="!!error"
      :aria-describedby="
        describedBy(
          $attrs['aria-describedby'],
          error || hint ? `${id}-help` : undefined,
        )
      "
      part="control"
      @input="input"
      @keydown="key"
      @change="emit('change', local)"
    />
    <p
      v-if="hint || error"
      :id="`${id}-help`"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
      part="hint"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/field.css";
.h-textarea {
  position: relative;
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
label {
  display: block;
  font-size: max(var(--h-font-min-size, 12px), 12px);
  font-weight: 500;
  margin-bottom: 7px;
}
label span {
  color: var(--h-accent-text);
}
textarea {
  display: block;
  width: 100%;
  min-height: var(--h-control-height);
  padding: var(--h-field-padding-y, 11px) var(--h-input-padding-x, 12px);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  color: var(--h-text);
  font-size: max(var(--h-font-min-size, 12px), var(--h-field-font-size, 13px));
  line-height: 1.8;
}
textarea::placeholder {
  color: var(--h-faint);
}
textarea:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
textarea[aria-invalid="true"] {
  border-color: var(--h-danger);
}
p {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  line-height: 1.7;
  margin-top: 7px;
  color: var(--h-muted);
}
p.error {
  color: var(--h-danger);
}
</style>
