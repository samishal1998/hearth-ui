<script setup lang="ts">
import { ref, watch, useId, computed, nextTick } from "vue";
import { controlSync, describedBy } from "../internal";
import HIcon from "./HIcon.vue";
import type { ControlSize, IconValue } from "../themes";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    type?:
      | "text"
      | "email"
      | "password"
      | "url"
      | "search"
      | "number"
      | "tel"
      | "date"
      | "time"
      | "datetime-local";
    placeholder?: string;
    hint?: string;
    error?: string;
    required?: boolean;
    disabled?: boolean;
    readonly?: boolean;
    autocomplete?: string;
    minlength?: number;
    maxlength?: number;
    min?: string | number;
    max?: string | number;
    step?: string | number;
    pattern?: string;
    hideLabel?: boolean;
    size?: ControlSize;
    leadingIcon?: IconValue;
    clearable?: boolean;
  }>(),
  { type: "text", value: "", clearable: undefined },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const local = ref(props.modelValue ?? props.value);
const id = useId();
const control = ref<HTMLInputElement>();
const canClear = computed(() => props.clearable ?? props.type === "search");
const showClear = computed(
  () => canClear.value && !!local.value && !props.disabled && !props.readonly,
);
async function clear() {
  if (props.disabled || props.readonly || control.value?.disabled) return;
  local.value = "";
  emit("update:modelValue", "");
  await nextTick();
  emit("control-sync");
  emit("change", "");
  control.value?.focus();
}
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
function input(e: Event) {
  local.value = (e.target as HTMLInputElement).value;
  emit("update:modelValue", local.value);
}
controlSync(emit);
</script>
<template>
  <div class="h-field" :class="size ? `h-size-${size}` : undefined" part="base">
    <label :for="id" :class="{ 'h-sr-only': hideLabel }" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    >
    <div class="h-field-control" :class="{ invalid: !!error }" part="frame">
      <div
        v-if="$slots.leading || leadingIcon"
        class="h-field-leading"
        part="leading"
      >
        <slot name="leading"><HIcon :name="leadingIcon" :size="18" /></slot>
      </div>
      <input
        v-bind="$attrs"
        ref="control"
        :id="id"
        part="control"
        :value="local"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        :readonly="readonly"
        :autocomplete="autocomplete"
        :minlength="minlength"
        :maxlength="maxlength"
        :min="min"
        :max="max"
        :step="step"
        :pattern="pattern"
        :aria-invalid="!!error"
        :aria-describedby="
          describedBy(
            $attrs['aria-describedby'],
            error || hint ? `${id}-help` : undefined,
          )
        "
        @input="input"
        @change="emit('change', local)"
      />
      <div
        v-if="$slots.trailing || canClear"
        class="h-field-adornment"
        part="adornment"
      >
        <button
          v-if="canClear"
          type="button"
          class="h-field-clear"
          :style="{ visibility: showClear ? 'visible' : 'hidden' }"
          :disabled="!showClear"
          :aria-label="`Clear ${label}`"
          @click="clear"
        >
          <HIcon name="close" :size="16" />
        </button>
        <slot name="trailing" />
      </div>
    </div>
    <p
      v-if="error || hint"
      :id="`${id}-help`"
      part="hint"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
    >
      {{ error || hint }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/field.css";
.h-field {
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
input {
  display: block;
  width: 100%;
  flex: 1;
  min-width: 0;
  min-height: calc(var(--h-control-height) - 2px);
  padding: var(--h-field-padding-y, 10px) var(--h-input-padding-x, 12px);
  background-color: inherit;
  color: var(--h-text);
  border: 0;
  border-radius: inherit;
  font-size: max(var(--h-font-min-size, 12px), var(--h-field-font-size, 13px));
  line-height: 1.4;
  transition: border-color var(--h-motion);
}
.h-field-control:hover {
  border-color: var(--h-border-strong);
}
input::placeholder {
  color: var(--h-faint);
}
.h-field-control:has(input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}
.h-field-control.invalid {
  border-color: var(--h-danger);
}
p {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
  line-height: 1.7;
  margin-top: 7px;
}
.error {
  color: var(--h-danger);
}
.h-field-control {
  position: relative;
  min-width: 0;
  display: flex;
  align-items: center;
  min-height: var(--h-control-height);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
}
input:focus-visible {
  outline: none;
}
.h-field-control:has(input:focus-visible) {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.h-field-adornment {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  padding: 3px;
}
.h-field-adornment :deep(.h-popover > .h-button) {
  width: var(--h-adornment-size, 44px);
  height: var(--h-adornment-size, 44px);
  min-height: var(--h-adornment-size, 44px);
  min-width: var(--h-adornment-size, 44px);
  padding: 4px;
  border-radius: max(4px, calc(var(--h-radius-control) - 4px));
}
.h-field-leading {
  display: inline-flex;
  align-items: center;
  flex: 0 0 auto;
  padding-inline-start: 12px;
  color: var(--h-muted);
}
.h-field-clear {
  width: var(--h-adornment-size, 44px);
  height: var(--h-adornment-size, 44px);
  display: grid;
  place-items: center;
  border: 0;
  border-radius: max(4px, calc(var(--h-radius-control) - 4px));
  background: none;
  color: var(--h-muted);
  cursor: pointer;
  padding: 4px;
}
.h-field-clear:hover {
  color: var(--h-text);
  background: var(--h-surface);
}
input[type="search"]::-webkit-search-cancel-button {
  appearance: none;
}
</style>
