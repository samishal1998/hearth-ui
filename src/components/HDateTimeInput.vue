<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUpdated } from "vue";
import HTextInput from "./HTextInput.vue";
import HCalendar from "./HCalendar.vue";
import HTimePicker from "./HTimePicker.vue";
import HPopover from "./HPopover.vue";
import HButton from "./HButton.vue";
import { parseDate, timeSeconds, dateString } from "../dates";
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    min?: string;
    max?: string;
    step?: number | string;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    readonly?: boolean;
    hint?: string;
    error?: string;
  }>(),
  { value: "" },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const local = ref(props.modelValue ?? props.value),
  open = ref(false),
  date = ref(""),
  time = ref("00:00");
const input = ref<InstanceType<typeof HTextInput>>();
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
watch(open, (shown) => {
  if (shown) {
    date.value =
      local.value.split("T")[0] ||
      props.min?.slice(0, 10) ||
      dateString(new Date());
    time.value = local.value.split("T")[1] || "00:00";
  }
});
function timestamp(value: string) {
  const [d, t, ...rest] = value.split("T");
  const day = parseDate(d ?? ""),
    seconds = timeSeconds(t ?? "");
  return rest.length || !day || seconds === undefined
    ? undefined
    : day.getTime() / 1000 + seconds;
}
function invalid(value: string) {
  if (!value) return "";
  const current = timestamp(value),
    minimum = timestamp(props.min ?? ""),
    maximum = timestamp(props.max ?? "");
  if (current === undefined)
    return "Enter a local date and time (YYYY-MM-DDTHH:mm).";
  if (
    (minimum !== undefined && current < minimum) ||
    (maximum !== undefined && current > maximum)
  )
    return "Choose a date and time within the allowed range.";
  if (props.step === "any") return "";
  const step = Number(props.step) > 0 ? Number(props.step) : 60;
  const position = (current - (minimum ?? 0)) / step;
  return Math.abs(position - Math.round(position)) > 1e-8
    ? "Choose a date and time matching the configured step."
    : "";
}
const draft = computed(() => `${date.value}T${time.value}`);
function update(value: string) {
  local.value = value;
  emit("update:modelValue", value);
}
function sync() {
  const field = input.value?.$el.querySelector("input") as
    HTMLInputElement | undefined;
  if (field)
    field.setCustomValidity(props.readonly ? "" : invalid(field.value));
  emit("control-sync");
}
async function apply() {
  if (invalid(draft.value)) return;
  update(draft.value);
  emit("change", draft.value);
  open.value = false;
  await nextTick();
  input.value?.$el.querySelector("input")?.focus();
  sync();
}
function commitOnEnter(event: KeyboardEvent) {
  if (!(event.target instanceof HTMLInputElement)) return;
  event.preventDefault();
  event.stopPropagation();
  apply();
}
onMounted(sync);
onUpdated(sync);
</script>
<template>
  <div class="h-date-time">
    <HTextInput
      ref="input"
      :model-value="local"
      type="text"
      :label="label"
      :name="name"
      placeholder="YYYY-MM-DDTHH:mm"
      autocomplete="off"
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
      :label="`Choose date and time for ${label}`"
      :disabled="disabled || formDisabled || readonly"
      ><HCalendar
        v-model="date"
        :min="min?.slice(0, 10)"
        :max="max?.slice(0, 10)"
      /><HTimePicker
        v-model="time"
        label="Time"
        :step="Number(step) || 60"
        @keydown.enter="commitOnEnter"
      />
      <p role="status">{{ invalid(draft) }}</p>
      <HButton variant="primary" :disabled="!!invalid(draft)" @click="apply"
        >Apply date and time</HButton
      ></HPopover
    >
  </div>
</template>
<style scoped>
.h-date-time {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.h-date-time :deep(.h-popover) {
  min-width: 0;
  max-width: 100%;
}
.h-date-time :deep(.h-button) {
  max-width: 100%;
  white-space: normal;
}
.h-date-time p {
  font: 12px/1.7 var(--h-font);
  color: var(--h-muted);
}
</style>
