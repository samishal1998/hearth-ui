<script setup lang="ts">
import { ref, watch, watchEffect } from "vue";
import { controlSync } from "../internal";
const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    checked?: boolean;
    indeterminate?: boolean;
    label: string;
    description?: string;
    name?: string;
    value?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  { modelValue: undefined, checked: false, value: "on" },
);
const emit = defineEmits<{
  "update:modelValue": [value: boolean];
  "update:indeterminate": [value: boolean];
  change: [value: boolean];
  "control-sync": [];
}>();
const input = ref<HTMLInputElement>();
const local = ref(props.modelValue ?? props.checked);
watch(
  () => [props.modelValue, props.checked],
  () => (local.value = props.modelValue ?? props.checked),
);
watchEffect(() => {
  if (input.value) input.value.indeterminate = !!props.indeterminate;
});
controlSync(emit);
function change(e: Event) {
  local.value = (e.target as HTMLInputElement).checked;
  emit("update:indeterminate", false);
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
</script>
<template>
  <label class="h-checkbox" part="base"
    ><input
      ref="input"
      type="checkbox"
      part="control"
      :name="name"
      :value="value"
      :checked="local"
      :disabled="disabled"
      :required="required"
      @change="change"
    /><span
      ><strong part="label">{{ label }}</strong
      ><small v-if="description" part="description">{{
        description
      }}</small></span
    ></label
  >
</template>
<style scoped>
@import "../styles/base.css";
.h-checkbox {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  font-family: var(--h-font);
  color: var(--h-text);
  cursor: pointer;
}
input {
  width: 18px;
  height: 18px;
  flex: 0 0 18px;
  margin: 0;
  accent-color: var(--h-accent);
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
.h-checkbox:has(input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}
input:disabled {
  cursor: not-allowed;
}
</style>
