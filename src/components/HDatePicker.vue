<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUpdated } from "vue";
import HInput from "./HTextInput.vue";
import { parseDate } from "../dates";
import HPopover from "./HPopover.vue";
import HCalendar from "./HCalendar.vue";
import type { ControlSize, IconValue } from "../themes";
import { useSlotPresence } from "../slots";
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
    mobileBreakpoint?: number;
    hideLabel?: boolean;
    size?: ControlSize;
    leadingIcon?: IconValue;
    clearable?: boolean;
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
const root = ref<HTMLElement>();
const hasSlot = useSlotPresence(() => root.value);
const calendar = ref<InstanceType<typeof HCalendar>>();
const popover = ref<InstanceType<typeof HPopover>>();
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
  popover.value?.$el.querySelector("button")?.focus({ preventScroll: true });
  emit("control-sync");
}
onMounted(sync);
onUpdated(sync);
</script>
<template>
  <div ref="root" class="h-date-picker" part="base">
    <HInput
      ref="input"
      :model-value="local"
      type="text"
      data-h-date-field
      placeholder="YYYY-MM-DD"
      autocomplete="off"
      :label="label"
      :hide-label="hideLabel"
      :size="size"
      :leading-icon="leadingIcon"
      :clearable="clearable"
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
      ><template v-if="hasSlot('leading')" #leading
        ><slot name="leading" /></template
      ><template #trailing
        ><slot v-if="hasSlot('trailing')" name="trailing" /><HPopover
          ref="popover"
          v-model:open="open"
          :mobile-breakpoint="mobileBreakpoint"
          :label="`Open calendar for ${label}`"
          :panel-label="`Open calendar for ${label}`"
          :title="label"
          icon="calendar"
          icon-only
          variant="ghost"
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
            @change="select" /></HPopover></template
    ></HInput>
  </div>
</template>
<style scoped>
.h-date-picker {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.h-date-popover {
  --h-popover-width: 400px;
  min-width: 0;
  max-width: 100%;
}
.h-date-popover :deep(.h-button) {
  max-width: 100%;
  white-space: normal;
}
</style>
