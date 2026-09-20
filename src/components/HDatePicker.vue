<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUpdated } from "vue";
import HInput from "./HTextInput.vue";
import { parseDate } from "../dates";
import HPopover from "./HPopover.vue";
import HCalendar from "./HCalendar.vue";
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    min?: string;
    max?: string;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    readonly?: boolean;
    hint?: string;
    error?: string;
    locale?: string;
    weekStartsOn?: 0 | 1;
  }>(),
  { value: "" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const local = ref(props.modelValue ?? props.value);
const open = ref(false);
const input = ref<InstanceType<typeof HInput>>();
const calendar = ref<InstanceType<typeof HCalendar>>();
watch(
  open,
  async (shown) => {
    if (!shown) return;
    await nextTick();
    if (open.value)
      calendar.value?.$el.querySelector('button[tabindex="0"]')?.focus();
  },
  { flush: "post" },
);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
function update(value: string) {
  local.value = value;
  emit("update:modelValue", value);
}
function sync() {
  const field = input.value?.$el.querySelector("input") as
    HTMLInputElement | undefined;
  if (field) {
    const value = field.value;
    field.setCustomValidity(
      !props.readonly &&
        value &&
        (!parseDate(value) ||
          (props.min && value < props.min) ||
          (props.max && value > props.max))
        ? "Enter a valid date within the allowed range (YYYY-MM-DD)."
        : "",
    );
  }
  emit("control-sync");
}
async function select(value: string) {
  update(value);
  emit("change", value);
  open.value = false;
  await nextTick();
  input.value?.$el.querySelector("input")?.focus();
  emit("control-sync");
}
onMounted(sync);
onUpdated(sync);
</script>
<template>
  <div class="h-date-picker" part="base">
    <HInput
      ref="input"
      :model-value="local"
      type="text"
      placeholder="YYYY-MM-DD"
      autocomplete="off"
      :label="label"
      :name="name"
      :min="min"
      :max="max"
      :required="required"
      :disabled="disabled || formDisabled"
      :readonly="readonly"
      :hint="hint"
      :error="error"
      @update:model-value="update"
      @change="emit('change', $event)"
      @control-sync="sync"
    /><HPopover
      v-model:open="open"
      :label="`Open calendar for ${label}`"
      :disabled="disabled || formDisabled || readonly"
      class="h-date-popover"
      ><HCalendar
        ref="calendar"
        :model-value="local"
        :label="`${label} calendar`"
        :min="min"
        :max="max"
        :locale="locale"
        :week-starts-on="weekStartsOn"
        :disabled="disabled || formDisabled || readonly"
        @change="select"
    /></HPopover>
  </div>
</template>
<style scoped>
.h-date-picker {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.h-date-popover {
  --h-popover-width: 360px;
  min-width: 0;
  max-width: 100%;
}
.h-date-popover :deep(.h-button) {
  max-width: 100%;
  white-space: normal;
}
</style>
