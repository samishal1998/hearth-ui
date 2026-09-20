<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUpdated } from "vue";
import HTextInput from "./HTextInput.vue";
import HNumberInput from "./HNumberInput.vue";
import HPopover from "./HPopover.vue";
import HButton from "./HButton.vue";
import { timeSeconds, timeError } from "../dates";
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    label: string;
    name?: string;
    min?: string;
    max?: string;
    step?: number;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    readonly?: boolean;
    hint?: string;
    error?: string;
  }>(),
  { value: "", step: 60 },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const local = ref(props.modelValue ?? props.value);
const open = ref(false);
const input = ref<InstanceType<typeof HTextInput>>();
const hour = ref<number | null>(0),
  minute = ref<number | null>(0),
  second = ref<number | null>(0);
const secondsShown = computed(
  () => Number(props.step) % 60 !== 0 || local.value.split(":").length === 3,
);
watch(
  () => [props.modelValue, props.value],
  () => (local.value = props.modelValue ?? props.value),
);
watch(open, (shown) => {
  if (shown) {
    const value = timeSeconds(local.value) ?? timeSeconds(props.min ?? "") ?? 0;
    hour.value = Math.floor(value / 3600);
    minute.value = Math.floor(value / 60) % 60;
    second.value = value % 60;
  }
});
const draft = computed(() =>
  [hour.value, minute.value, ...(secondsShown.value ? [second.value] : [])]
    .map((v) => (v === null ? "" : String(v).padStart(2, "0")))
    .join(":"),
);
const draftError = computed(() =>
  timeError(draft.value, props.min, props.max, props.step),
);
function update(value: string) {
  local.value = value;
  emit("update:modelValue", value);
}
function sync() {
  const field = input.value?.$el.querySelector("input") as
    HTMLInputElement | undefined;
  if (field)
    field.setCustomValidity(
      props.readonly
        ? ""
        : timeError(field.value, props.min, props.max, props.step),
    );
  emit("control-sync");
}
async function apply() {
  if (draftError.value) return;
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
  <div class="h-time-picker" part="base">
    <HTextInput
      ref="input"
      type="text"
      :model-value="local"
      :label="label"
      :name="name"
      :placeholder="secondsShown ? 'HH:mm:ss' : 'HH:mm'"
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
      :label="`Choose time for ${label}`"
      :title="`Time picker: ${label}`"
      :disabled="disabled || formDisabled || readonly"
      ><div class="h-time-fields" @keydown.enter="commitOnEnter">
        <HNumberInput
          v-model="hour"
          label="Hour"
          :min="0"
          :max="23"
        /><HNumberInput
          v-model="minute"
          label="Minute"
          :min="0"
          :max="59"
        /><HNumberInput
          v-if="secondsShown"
          v-model="second"
          label="Second"
          :min="0"
          :max="59"
        />
      </div>
      <p class="h-time-help" role="status">
        {{ draftError || "24-hour time" }}
      </p>
      <HButton variant="primary" :disabled="!!draftError" @click="apply"
        >Apply time</HButton
      ></HPopover
    >
  </div>
</template>
<style scoped>
.h-time-picker {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.h-time-picker :deep(.h-popover) {
  min-width: 0;
  max-width: 100%;
}
.h-time-picker :deep(.h-button) {
  max-width: 100%;
  white-space: normal;
}
.h-time-fields {
  display: grid;
  gap: 14px;
}
.h-time-help {
  font: 12px/1.7 var(--h-font);
  color: var(--h-muted);
  margin: 12px 0;
}
</style>
