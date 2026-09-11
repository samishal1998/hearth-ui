<script setup lang="ts">
import { ref, watch, useId } from "vue";
import type { SelectOption } from "../themes";
import { controlSync } from "../internal";
defineOptions({ inheritAttrs: false });
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    options: SelectOption[];
    placeholder?: string;
    hint?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
  }>(),
  { value: "", options: () => [] },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const id = useId();
const local = ref(props.modelValue ?? props.value);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
controlSync(emit);
function change(e: Event) {
  local.value = (e.target as HTMLSelectElement).value;
  emit("update:modelValue", local.value);
  emit("change", local.value);
}
</script>
<template>
  <div class="h-field" part="base">
    <label :for="id" part="label"
      >{{ label }}<span v-if="required" aria-hidden="true"> *</span></label
    ><select
      v-bind="$attrs"
      :id="id"
      :value="local"
      :name="name"
      :disabled="disabled"
      :required="required"
      :aria-invalid="!!error"
      :aria-describedby="hint || error ? `${id}-help` : undefined"
      part="control"
      @change="change"
    >
      <option v-if="placeholder" value="" disabled>{{ placeholder }}</option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
        :disabled="option.disabled"
      >
        {{ option.label }}
      </option>
    </select>
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
.h-field {
  font-family: var(--h-font);
  color: var(--h-text);
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 7px;
}
label span {
  color: var(--h-accent-text);
}
select {
  width: 100%;
  min-height: var(--h-control-height);
  padding: 10px 12px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  color: var(--h-text);
  font-size: 13px;
}
select:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
select[aria-invalid="true"] {
  border-color: var(--h-danger);
}
p {
  font-size: 11px;
  color: var(--h-muted);
  margin-top: 7px;
  line-height: 1.7;
}
.error {
  color: var(--h-danger);
}
</style>
