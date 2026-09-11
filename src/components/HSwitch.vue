<script setup lang="ts">
import { ref, watch } from "vue";
import { controlSync } from "../internal";
const props = withDefaults(
  defineProps<{
    modelValue?: boolean;
    checked?: boolean;
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
  change: [value: boolean];
  "control-sync": [];
}>();
const local = ref(props.modelValue ?? props.checked);
watch(
  () => [props.modelValue, props.checked],
  () => (local.value = props.modelValue ?? props.checked),
);
controlSync(emit);
function change(e: Event) {
  local.value = (e.target as HTMLInputElement).checked;
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
</script>
<template>
  <label class="h-switch" part="base" :class="{ disabled }"
    ><span class="h-switch-copy"
      ><strong part="label">{{ label }}</strong
      ><small v-if="description" part="description">{{
        description
      }}</small></span
    ><span class="h-toggle"
      ><input
        type="checkbox"
        role="switch"
        :aria-label="label"
        :name="name"
        :value="value"
        :checked="local"
        :disabled="disabled"
        :required="required"
        @change="change" /><span
        class="h-track"
        part="control"
        aria-hidden="true"
        ><span /></span></span
  ></label>
</template>
<style scoped>
@import "../styles/base.css";
.h-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  min-height: 44px;
  font-family: var(--h-font);
  color: var(--h-text);
  cursor: pointer;
}
.h-switch-copy {
  min-width: 0;
}
strong {
  font-size: 13px;
  font-weight: 500;
}
small {
  display: block;
  color: var(--h-muted);
  font-size: 11px;
  line-height: 1.7;
  margin-top: 5px;
}
.h-toggle {
  position: relative;
  display: grid;
  place-items: center;
  min-width: 44px;
  height: 44px;
  flex-shrink: 0;
}
input {
  position: absolute;
  inset: 0;
  margin: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}
.h-track {
  width: 38px;
  height: 22px;
  border: 1px solid var(--h-border-strong);
  border-radius: var(--h-radius-pill);
  background: var(--h-bg);
  padding: 3px;
  transition: background var(--h-motion);
}
.h-track > span {
  display: block;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--h-muted);
  transition: transform var(--h-motion);
}
input:checked + .h-track {
  background: var(--h-accent);
  border-color: var(--h-accent);
}
input:checked + .h-track > span {
  transform: translateX(16px);
  background: var(--h-on-accent);
}
input:focus-visible + .h-track {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 4px;
}
.disabled,
.h-switch:has(input:disabled) {
  opacity: 0.55;
  cursor: not-allowed;
}
.disabled input,
input:disabled {
  cursor: not-allowed;
}
</style>
