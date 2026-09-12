<script setup lang="ts">
import { ref, watch, useId, nextTick } from "vue";
import { controlSync } from "../internal";
import type { ChoiceOption } from "../themes";
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    options: ChoiceOption[];
    description?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    orientation?: "horizontal" | "vertical";
    formDisabled?: boolean;
  }>(),
  { value: "", options: () => [], orientation: "vertical" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const id = useId();
const root = ref<HTMLElement>();
const local = ref(props.modelValue ?? props.value);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
controlSync(emit);
async function select(value: string) {
  local.value = value;
  await nextTick();
  emit("update:modelValue", value);
  emit("change", value);
}
function key(e: KeyboardEvent) {
  if (
    ![
      "ArrowDown",
      "ArrowUp",
      "ArrowLeft",
      "ArrowRight",
      "Home",
      "End",
    ].includes(e.key)
  )
    return;
  const radios = [
    ...root.value!.querySelectorAll<HTMLInputElement>("input:not(:disabled)"),
  ];
  if (!radios.length) return;
  e.preventDefault();
  e.stopPropagation();
  const at = radios.indexOf(e.target as HTMLInputElement);
  const index =
    e.key === "Home"
      ? 0
      : e.key === "End"
        ? radios.length - 1
        : (at +
            (["ArrowDown", "ArrowRight"].includes(e.key) ? 1 : -1) +
            radios.length) %
          radios.length;
  radios[index].focus();
  radios[index].click();
}
</script>
<template>
  <fieldset
    ref="root"
    class="h-radio-group"
    part="base"
    :disabled="disabled || formDisabled"
    :aria-describedby="description || error ? `${id}-help` : undefined"
  >
    <legend part="label">{{ label }}</legend>
    <p
      v-if="description || error"
      :id="`${id}-help`"
      class="h-radio-help"
      :class="{ error }"
      :role="error ? 'alert' : undefined"
    >
      {{ error || description }}
    </p>
    <div class="h-radio-options" :class="orientation" @keydown="key">
      <label
        v-for="option in options"
        :key="option.value"
        class="h-radio-option"
        part="option"
        ><input
          type="radio"
          data-h-form-control
          data-h-form-value
          part="control"
          :name="name"
          :value="option.value"
          :checked="local === option.value"
          :disabled="option.disabled"
          :required="required"
          :aria-invalid="!!error"
          @change="select(option.value)"
        /><span
          ><strong>{{ option.label }}</strong
          ><small v-if="option.description">{{
            option.description
          }}</small></span
        ></label
      >
    </div>
  </fieldset>
</template>
<style scoped>
@import "../styles/base.css";
.h-radio-group {
  margin: 0;
  padding: 0;
  border: 0;
  min-width: 0;
  font-family: var(--h-font);
  color: var(--h-text);
}
legend {
  font-size: 12px;
  font-weight: 550;
  margin-bottom: 8px;
  padding: 0;
}
.h-radio-help {
  font-size: 11px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-bottom: 10px;
}
.h-radio-help.error {
  color: var(--h-danger);
}
.h-radio-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px 24px;
}
.h-radio-option {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  cursor: pointer;
}
input {
  margin: 0;
  width: 18px;
  height: 18px;
  accent-color: var(--h-accent);
  flex: 0 0 18px;
  cursor: pointer;
}
strong {
  font-size: 13px;
  font-weight: 500;
}
small {
  display: block;
  font-size: 11px;
  color: var(--h-muted);
  line-height: 1.8;
  margin-top: 3px;
}
.h-radio-option:has(input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}
input:disabled {
  cursor: not-allowed;
}
</style>
