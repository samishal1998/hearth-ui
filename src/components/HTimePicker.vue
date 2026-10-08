<script setup lang="ts">
import {
  ref,
  watch,
  computed,
  nextTick,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  useId,
} from "vue";
import HTextInput from "./HTextInput.vue";
import HPopover from "./HPopover.vue";
import HButton from "./HButton.vue";
import HIcon from "./HIcon.vue";
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
    mobileBreakpoint?: number;
  }>(),
  { value: "", step: 60 },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "control-sync": [];
}>();
const id = useId(),
  local = ref(props.modelValue ?? props.value),
  open = ref(false);
const input = ref<InstanceType<typeof HTextInput>>(),
  popover = ref<InstanceType<typeof HPopover>>(),
  panel = ref<HTMLElement>();
type Unit = "hour" | "minute" | "second";
const chosen = ref({ hour: 0, minute: 0, second: 0 });
const blocked = computed(
  () => props.disabled || props.formDisabled || props.readonly,
);
const interval = computed(() =>
  Number.isFinite(props.step) && props.step > 0 ? props.step : 60,
);
const secondsShown = computed(
  () =>
    interval.value % 60 !== 0 ||
    [local.value, props.min, props.max].some(
      (value) => value?.split(":").length === 3,
    ),
);
const units = computed<Unit[]>(() =>
  secondsShown.value ? ["hour", "minute", "second"] : ["hour", "minute"],
);
const pad = (value: number) => String(value).padStart(2, "0");
const allowed = computed(() => {
  const lower = timeSeconds(props.min ?? ""),
    upper = timeSeconds(props.max ?? ""),
    base = lower ?? 0;
  const result = new Map<number, Map<number, number[]>>();
  for (let hour = 0; hour < 24; hour++)
    for (let minute = 0; minute < 60; minute++)
      for (let second = 0; second < (secondsShown.value ? 60 : 1); second++) {
        const value = hour * 3600 + minute * 60 + second;
        const outside =
          lower !== undefined && upper !== undefined && lower > upper
            ? value < lower && value > upper
            : (lower !== undefined && value < lower) ||
              (upper !== undefined && value > upper);
        if (
          outside ||
          Math.abs(
            (value - base) / interval.value -
              Math.round((value - base) / interval.value),
          ) > 1e-8
        )
          continue;
        if (!result.has(hour)) result.set(hour, new Map());
        const minutes = result.get(hour)!;
        if (!minutes.has(minute)) minutes.set(minute, []);
        minutes.get(minute)!.push(second);
      }
  return result;
});
const options = computed(() => ({
  hour: Array.from({ length: 24 }, (_, value) => ({
    value,
    disabled: !allowed.value.has(value),
  })),
  minute: [...(allowed.value.get(chosen.value.hour)?.keys() ?? [])].map(
    (value) => ({ value, disabled: false }),
  ),
  second: (
    allowed.value.get(chosen.value.hour)?.get(chosen.value.minute) ?? []
  ).map((value) => ({ value, disabled: false })),
}));
const draft = computed(() =>
  units.value.map((unit) => pad(chosen.value[unit])).join(":"),
);
const draftError = computed(() =>
  allowed.value.size
    ? timeError(draft.value, props.min, props.max, props.step)
    : "No times are available within these limits.",
);
const intervalLabel = computed(() =>
  interval.value % 3600 === 0
    ? `${interval.value / 3600} hour intervals`
    : interval.value % 60 === 0
      ? `${interval.value / 60} min intervals`
      : `${interval.value} sec intervals`,
);
function resetDraft() {
  const now = new Date();
  const target =
    timeSeconds(local.value) ??
    timeSeconds(props.min ?? "") ??
    now.getHours() * 3600 + now.getMinutes() * 60;
  let distance = Infinity;
  let next = chosen.value;
  search: for (const [hour, minutes] of allowed.value)
    for (const [minute, seconds] of minutes)
      for (const second of seconds) {
        const delta = Math.abs(hour * 3600 + minute * 60 + second - target);
        if (delta < distance) {
          distance = delta;
          next = { hour, minute, second };
          if (delta === 0) break search;
        }
      }
  chosen.value = next;
}
const nearest = (values: number[], current: number) =>
  values.reduce(
    (a, b) => (Math.abs(b - current) < Math.abs(a - current) ? b : a),
    values[0] ?? 0,
  );
function choose(unit: Unit, value: number) {
  if (
    blocked.value ||
    options.value[unit].find((option) => option.value === value)?.disabled !==
      false
  )
    return;
  const next = { ...chosen.value, [unit]: value };
  const minutes = allowed.value.get(next.hour);
  next.minute = nearest([...(minutes?.keys() ?? [])], next.minute);
  next.second = nearest(minutes?.get(next.minute) ?? [], next.second);
  chosen.value = next;
}
function pick(event: MouseEvent, unit: Unit, value: number) {
  choose(unit, value);
  (event.currentTarget as HTMLElement).parentElement?.focus({
    preventScroll: true,
  });
  scrollSelected();
}
async function scrollSelected(center = false) {
  await nextTick();
  for (const unit of units.value) {
    const list = panel.value?.querySelector<HTMLElement>(
        `[data-column="${unit}"]`,
      ),
      option = list?.querySelector<HTMLElement>("[aria-selected=true]");
    if (!list || !option) continue;
    if (center)
      list.scrollTop =
        option.offsetTop - (list.clientHeight - option.offsetHeight) / 2;
    else if (option.offsetTop < list.scrollTop)
      list.scrollTop = option.offsetTop;
    else if (
      option.offsetTop + option.offsetHeight >
      list.scrollTop + list.clientHeight
    )
      list.scrollTop =
        option.offsetTop + option.offsetHeight - list.clientHeight;
  }
  if (center) {
    const body = panel.value?.closest<HTMLElement>(".h-overlay-body");
    if (body) body.scrollTop = 0;
  }
}
watch(
  () => [props.modelValue, props.value],
  () => {
    local.value = props.modelValue ?? props.value;
    if (open.value) resetDraft();
  },
);
watch(allowed, () => {
  if (open.value) {
    resetDraft();
    scrollSelected(true);
  }
});
watch(
  open,
  (shown) => {
    if (shown) {
      typed = "";
      lastTyped = 0;
      typedUnit = undefined;
      resetDraft();
      scrollSelected(true);
    }
  },
  { flush: "post" },
);
let typed = "",
  lastTyped = 0;
let typedUnit: Unit | undefined;
function key(event: KeyboardEvent, unit: Unit) {
  if (event.isComposing) return;
  const enabled = options.value[unit]
    .filter((option) => !option.disabled)
    .map((option) => option.value);
  const index = enabled.indexOf(chosen.value[unit]);
  let target: number | undefined;
  if (
    ["ArrowDown", "ArrowUp", "Home", "End", "PageDown", "PageUp"].includes(
      event.key,
    )
  ) {
    event.preventDefault();
    event.stopPropagation();
    const position =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? enabled.length - 1
          : index +
            (event.key === "ArrowDown"
              ? 1
              : event.key === "ArrowUp"
                ? -1
                : event.key === "PageDown"
                  ? 5
                  : -5);
    target = enabled[Math.max(0, Math.min(enabled.length - 1, position))];
  } else if (event.key === "Enter") {
    event.preventDefault();
    event.stopPropagation();
    apply();
    return;
  } else if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
    event.preventDefault();
    const rtl =
      getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
    const direction = (event.key === "ArrowRight" ? 1 : -1) * (rtl ? -1 : 1);
    const next = units.value[units.value.indexOf(unit) + direction];
    if (next)
      panel.value
        ?.querySelector<HTMLElement>(`[data-column="${next}"]`)
        ?.focus();
    return;
  } else if (/^\d$/.test(event.key)) {
    event.preventDefault();
    const now = Date.now();
    typed =
      typedUnit === unit && now - lastTyped < 600
        ? `${typed}${event.key}`.slice(-2)
        : event.key;
    typedUnit = unit;
    lastTyped = now;
    target = enabled.includes(Number(typed))
      ? Number(typed)
      : enabled.find((value) => pad(value).startsWith(typed));
  }
  if (target !== undefined) {
    choose(unit, target);
    scrollSelected();
  }
}
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
async function close() {
  open.value = false;
  await nextTick();
  popover.value?.$el.querySelector("button")?.focus({ preventScroll: true });
}
function apply() {
  if (blocked.value || draftError.value) return;
  update(draft.value);
  emit("change", draft.value);
  close();
}
onMounted(sync);
onUpdated(sync);
let resize: ResizeObserver | undefined;
onMounted(() => {
  resize = new ResizeObserver(() => {
    if (open.value) scrollSelected();
  });
  if (panel.value) resize.observe(panel.value);
});
onBeforeUnmount(() => resize?.disconnect());
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
      ><template #trailing
        ><HPopover
          ref="popover"
          v-model:open="open"
          :mobile-breakpoint="mobileBreakpoint"
          :label="`Choose time for ${label}`"
          :panel-label="`Time picker: ${label}`"
          :title="label"
          icon="clock"
          icon-only
          variant="ghost"
          :disabled="blocked"
          class="h-time-popover"
          ><div ref="panel" class="h-time-panel">
            <div class="h-time-summary" part="preview">
              <output aria-live="off">{{ allowed.size ? draft : "—" }}</output
              ><span>24-hour time</span>
            </div>
            <div
              class="h-time-columns"
              :style="{ '--h-time-columns': units.length }"
            >
              <div v-for="unit in units" :key="unit" class="h-time-column">
                <span :id="`${id}-${unit}-label`" class="h-time-column-label">{{
                  unit === "hour"
                    ? "Hour"
                    : unit === "minute"
                      ? "Minute"
                      : "Second"
                }}</span>
                <div
                  :data-column="unit"
                  role="listbox"
                  :aria-labelledby="`${id}-${unit}-label`"
                  :aria-activedescendant="
                    options[unit].some(
                      (option) =>
                        option.value === chosen[unit] && !option.disabled,
                    )
                      ? `${id}-${unit}-${chosen[unit]}`
                      : undefined
                  "
                  :tabindex="allowed.size ? 0 : -1"
                  class="h-time-options"
                  part="column"
                  @keydown="key($event, unit)"
                >
                  <button
                    v-for="option in options[unit]"
                    :id="`${id}-${unit}-${option.value}`"
                    :key="option.value"
                    type="button"
                    role="option"
                    :aria-selected="chosen[unit] === option.value"
                    :disabled="blocked || option.disabled"
                    tabindex="-1"
                    part="option"
                    @mousedown.prevent
                    @click="pick($event, unit, option.value)"
                  >
                    {{ pad(option.value)
                    }}<HIcon
                      v-if="chosen[unit] === option.value && !option.disabled"
                      name="check"
                      :size="13"
                    /></button
                  ><span
                    v-if="!options[unit].length"
                    class="h-time-no-options"
                    aria-hidden="true"
                    >—</span
                  >
                </div>
              </div>
            </div>
            <p class="h-time-help" role="status">
              {{
                draftError ||
                (min || max
                  ? `${min || "00:00"} – ${max || "23:59"} · ${intervalLabel}`
                  : intervalLabel)
              }}
            </p>
          </div>
          <template #footer
            ><div class="h-time-actions">
              <HButton variant="ghost" @click="close">Cancel</HButton
              ><HButton
                variant="primary"
                :disabled="blocked || !!draftError"
                @click="apply"
                >Apply time</HButton
              >
            </div></template
          ></HPopover
        ></template
      ></HTextInput
    >
  </div>
</template>
<style scoped>
.h-time-picker {
  min-width: 0;
}
.h-time-popover {
  --h-popover-width: 340px;
}
.h-time-panel {
  min-width: 0;
}
.h-time-summary {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 12px;
  padding-bottom: 18px;
}
.h-time-summary output {
  font: 550 28px/1.25 var(--h-font);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.7px;
  color: var(--h-text);
}
.h-time-summary > span {
  font: 11px/1.5 var(--h-font);
  color: var(--h-muted);
}
.h-time-columns {
  display: grid;
  grid-template-columns: repeat(var(--h-time-columns), minmax(0, 1fr));
  gap: 10px;
}
.h-time-column {
  min-width: 0;
}
.h-time-column-label {
  display: block;
  font: 500 11px/1.5 var(--h-font);
  color: var(--h-muted);
  padding: 0 4px 8px;
}
.h-time-options {
  position: relative;
  height: min(220px, calc(var(--h-overlay-height, 800px) * 0.4));
  min-height: 88px;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 4px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  scrollbar-width: thin;
  scrollbar-color: var(--h-border-strong) transparent;
}
.h-time-options:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 2px;
}
.h-time-options button {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: max(4px, calc(var(--h-radius-control) - 5px));
  background: transparent;
  color: var(--h-muted);
  font: 500 16px/1.5 var(--h-font);
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  transition:
    background 120ms,
    color 120ms;
}
.h-time-options button:hover:not(:disabled) {
  background: var(--h-surface);
  color: var(--h-text);
}
.h-time-options button[aria-selected="true"]:not(:disabled) {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  font-weight: 600;
}
.h-time-options button > .h-icon {
  position: absolute;
  inset-inline-end: 8px;
}
.h-time-options button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.h-time-help {
  font: 11px/1.7 var(--h-font);
  color: var(--h-muted);
  margin: 12px 0;
  overflow-wrap: anywhere;
}
.h-time-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.h-time-popover :deep(.h-popover-panel.h-mobile .h-time-summary) {
  display: none;
}
.h-time-popover :deep(.h-popover-panel.h-mobile .h-time-options) {
  height: clamp(
    88px,
    calc(var(--h-overlay-height, 800px) * 0.9 - 250px),
    220px
  );
}
.h-time-no-options {
  display: block;
  padding: 12px;
  text-align: center;
  color: var(--h-faint);
}
</style>
