<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import HDatePicker from "./HDatePicker.vue";
import type { DateRange } from "../themes";
const props = withDefaults(
  defineProps<{
    modelValue?: DateRange;
    value?: DateRange;
    label: string;
    name?: string;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    locale?: string;
    weekStartsOn?: 0 | 1;
    startLabel?: string;
    endLabel?: string;
  }>(),
  { value: () => ["", ""], startLabel: "Start date", endLabel: "End date" },
);
const emit = defineEmits<{
  "update:modelValue": [value: DateRange];
  change: [value: DateRange];
  "control-sync": [];
}>();
const local = ref<DateRange>([...(props.modelValue ?? props.value)]);
const root = ref<HTMLElement>();
watch(
  () => [props.modelValue, props.value],
  () => (local.value = [...(props.modelValue ?? props.value)]),
);
function update(index: number, value: string) {
  local.value = index === 0 ? [value, local.value[1]] : [local.value[0], value];
  emit("update:modelValue", [...local.value]);
}
function sync() {
  if (!root.value) return;
  root.value.querySelectorAll(".h-date-picker input").forEach((input) => {
    input.setAttribute("data-h-form-value", "");
    input.setAttribute("data-h-multiple", "");
  });
  emit("control-sync");
}
onMounted(sync);
</script>
<template>
  <fieldset
    ref="root"
    :disabled="disabled || formDisabled"
    class="h-date-range"
    part="base"
  >
    <legend part="label">{{ label }}</legend>
    <div class="h-date-range-fields">
      <HDatePicker
        :model-value="local[0]"
        :label="startLabel"
        :name="name"
        :min="min"
        :max="local[1] && (!max || local[1] < max) ? local[1] : max"
        :required="required"
        :disabled="disabled || formDisabled"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        @update:model-value="update(0, $event)"
        @change="emit('change', [...local])"
        @control-sync="sync"
      /><HDatePicker
        :model-value="local[1]"
        :label="endLabel"
        :name="name"
        :min="local[0] && (!min || local[0] > min) ? local[0] : min"
        :max="max"
        :required="required"
        :disabled="disabled || formDisabled"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        @update:model-value="update(1, $event)"
        @change="emit('change', [...local])"
        @control-sync="sync"
      />
    </div>
  </fieldset>
</template>
<style scoped>
.h-date-range {
  border: 0;
  padding: 0;
  margin: 0;
  min-width: 0;
  font: 13px/1.7 var(--h-font);
  color: var(--h-text);
}
legend {
  font-weight: 550;
  margin-bottom: 12px;
}
.h-date-range-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}
@media (max-width: 550px) {
  .h-date-range-fields {
    grid-template-columns: 1fr;
  }
}
</style>
