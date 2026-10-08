<script setup lang="ts">
import { computed, ref, watch, nextTick, useId } from "vue";
import { parseDate, dateString, addDays, addMonths } from "../dates";
import HIcon from "./HIcon.vue";
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    value?: string;
    month?: string;
    label?: string;
    locale?: string;
    weekStartsOn?: 0 | 1;
    min?: string;
    max?: string;
    disabledDates?: string[];
    disabled?: boolean;
    today?: string;
  }>(),
  {
    value: "",
    label: "Choose a date",
    locale: "en-US",
    weekStartsOn: 0,
    disabledDates: () => [],
  },
);
const emit = defineEmits<{
  "update:modelValue": [value: string];
  change: [value: string];
  "update:month": [month: string];
}>();
const id = useId(),
  root = ref<HTMLElement>(),
  selected = ref(props.modelValue ?? props.value);
const today = computed(() => props.today ?? dateString(new Date()));
function initial() {
  if (parseDate(`${props.month}-01`)) return `${props.month}-01`;
  let date = parseDate(selected.value)
    ? selected.value
    : parseDate(today.value)
      ? today.value
      : "2000-01-01";
  if (props.min && parseDate(props.min) && date < props.min) date = props.min;
  if (props.max && parseDate(props.max) && date > props.max) date = props.max;
  return date.slice(0, 7) + "-01";
}
const visible = ref(initial()),
  active = ref(selected.value),
  browsing = ref(false),
  browseYear = ref<number | null>(Number(visible.value.slice(0, 4))),
  activeMonth = ref(Number(visible.value.slice(5, 7)) - 1);
watch(
  () => [props.modelValue, props.value],
  () => {
    selected.value = props.modelValue ?? props.value;
    if (parseDate(selected.value))
      visible.value = selected.value.slice(0, 7) + "-01";
    active.value = selected.value;
  },
);
watch(
  () => props.month,
  () => (visible.value = initial()),
);
const formatter = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      month: "long",
      year: "numeric",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const full = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      dateStyle: "full",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const short = computed(
  () =>
    new Intl.DateTimeFormat(props.locale, {
      dateStyle: "medium",
      timeZone: "UTC",
      calendar: "gregory",
    }),
);
const numbers = computed(
  () => new Intl.NumberFormat(props.locale, { useGrouping: false }),
);
const title = computed(() => formatter.value.format(parseDate(visible.value)));
const summary = computed(() =>
  parseDate(selected.value)
    ? short.value.format(parseDate(selected.value))
    : "No date selected",
);
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(props.locale, {
      weekday: "short",
      timeZone: "UTC",
    }).format(parseDate(addDays("2026-09-20", (i + props.weekStartsOn) % 7))),
  ),
);
const months = computed(() =>
  Array.from({ length: 12 }, (_, i) =>
    new Intl.DateTimeFormat(props.locale, {
      month: "short",
      timeZone: "UTC",
      calendar: "gregory",
    }).format(parseDate(`2000-${String(i + 1).padStart(2, "0")}-01`)),
  ),
);
const disabledDates = computed(() => new Set(props.disabledDates));
function unavailable(value: string) {
  return (
    props.disabled ||
    !parseDate(value) ||
    !!(props.min && value < props.min) ||
    !!(props.max && value > props.max) ||
    disabledDates.value.has(value)
  );
}
const days = computed(() => {
  const first = parseDate(visible.value)!,
    offset = (first.getUTCDay() - props.weekStartsOn + 7) % 7;
  return Array.from({ length: 42 }, (_, i) => {
    const value = dateString(
      new Date(first.getTime() + (i - offset) * 86400000),
    );
    return parseDate(value) ? value : "";
  });
});
const inMonth = (value: string) =>
  value.slice(0, 7) === visible.value.slice(0, 7);
const tabDate = computed(() =>
  days.value.includes(active.value) &&
  inMonth(active.value) &&
  !unavailable(active.value)
    ? active.value
    : days.value.find((day) => day && inMonth(day) && !unavailable(day)),
);
async function focusDay() {
  await nextTick();
  root.value
    ?.querySelector<HTMLButtonElement>(`[data-date="${tabDate.value}"]`)
    ?.focus({ preventScroll: true });
}
function setMonth(value: string) {
  if (value === visible.value) return;
  visible.value = value;
  emit("update:month", value.slice(0, 7));
}
function select(value: string) {
  if (unavailable(value)) return;
  selected.value = value;
  active.value = value;
  browsing.value = false;
  setMonth(value.slice(0, 7) + "-01");
  emit("update:modelValue", value);
  emit("change", value);
}
function clear() {
  if (props.disabled) return;
  selected.value = "";
  emit("update:modelValue", "");
  emit("change", "");
  focusDay();
}
function allowedMonth(value: string) {
  const first = parseDate(value);
  if (!first) return false;
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  return (
    !(props.min && dateString(last) < props.min) &&
    !(props.max && value > props.max)
  );
}
const monthAllowed = (delta: number) =>
  allowedMonth(addMonths(visible.value, delta));
function moveMonth(delta: number) {
  if (props.disabled || !monthAllowed(delta)) return;
  setMonth(addMonths(visible.value, delta));
}
const minYear = computed(
    () => parseDate(props.min ?? "")?.getUTCFullYear() ?? 1,
  ),
  maxYear = computed(
    () => parseDate(props.max ?? "")?.getUTCFullYear() ?? 9999,
  );
const invalidYear = computed(
  () =>
    browseYear.value === null ||
    !Number.isInteger(browseYear.value) ||
    browseYear.value < minYear.value ||
    browseYear.value > maxYear.value,
);
const monthValue = (index: number) =>
  `${String(browseYear.value).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}-01`;
const disabledMonth = (index: number) =>
  props.disabled || invalidYear.value || !allowedMonth(monthValue(index));
const tabMonth = computed(() =>
  !disabledMonth(activeMonth.value)
    ? activeMonth.value
    : months.value.findIndex((_, i) => !disabledMonth(i)),
);
async function toggleBrowse() {
  if (props.disabled) return;
  browsing.value = !browsing.value;
  if (browsing.value) {
    browseYear.value = Number(visible.value.slice(0, 4));
    activeMonth.value = Number(visible.value.slice(5, 7)) - 1;
    await nextTick();
    root.value
      ?.querySelector<HTMLButtonElement>(`[data-month="${tabMonth.value}"]`)
      ?.focus({ preventScroll: true });
  } else focusDay();
}
function changeYear(event: Event) {
  const value = (event.target as HTMLInputElement).valueAsNumber;
  browseYear.value = Number.isFinite(value) ? value : null;
}
function shiftYear(delta: number) {
  if (props.disabled) return;
  const year = (browseYear.value ?? Number(visible.value.slice(0, 4))) + delta;
  browseYear.value = Math.max(minYear.value, Math.min(maxYear.value, year));
}
function chooseMonth(index: number) {
  if (disabledMonth(index)) return;
  setMonth(monthValue(index));
  browsing.value = false;
  focusDay();
}
function escape(event: KeyboardEvent) {
  if (event.key === "Escape" && browsing.value) {
    event.preventDefault();
    event.stopPropagation();
    browsing.value = false;
    focusDay();
  }
}
async function monthKey(event: KeyboardEvent, index: number) {
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  let next = index;
  const direction =
    event.key === "ArrowRight"
      ? rtl
        ? -1
        : 1
      : event.key === "ArrowLeft"
        ? rtl
          ? 1
          : -1
        : event.key === "ArrowDown"
          ? 3
          : event.key === "ArrowUp"
            ? -3
            : 0;
  if (direction) {
    next += direction;
    while (next >= 0 && next < 12 && disabledMonth(next)) next += direction;
  } else if (event.key === "Home")
    next = months.value.findIndex((_, i) => !disabledMonth(i));
  else if (event.key === "End") {
    next = 11;
    while (next >= 0 && disabledMonth(next)) next--;
  } else return;
  event.preventDefault();
  if (next < 0 || next > 11 || disabledMonth(next)) return;
  activeMonth.value = next;
  await nextTick();
  root.value
    ?.querySelector<HTMLButtonElement>(`[data-month="${next}"]`)
    ?.focus();
}
async function key(event: KeyboardEvent, date: string) {
  let target = date,
    direction = 1;
  const rtl =
    getComputedStyle(event.currentTarget as HTMLElement).direction === "rtl";
  switch (event.key) {
    case "ArrowRight":
      direction = rtl ? -1 : 1;
      target = addDays(date, direction);
      break;
    case "ArrowLeft":
      direction = rtl ? 1 : -1;
      target = addDays(date, direction);
      break;
    case "ArrowDown":
      target = addDays(date, 7);
      break;
    case "ArrowUp":
      direction = -1;
      target = addDays(date, -7);
      break;
    case "Home":
      direction = 1;
      target = addDays(
        date,
        -((parseDate(date)!.getUTCDay() - props.weekStartsOn + 7) % 7),
      );
      break;
    case "End":
      direction = -1;
      target = addDays(
        date,
        6 - ((parseDate(date)!.getUTCDay() - props.weekStartsOn + 7) % 7),
      );
      break;
    case "PageDown":
      target = addMonths(date, event.shiftKey ? 12 : 1);
      break;
    case "PageUp":
      direction = -1;
      target = addMonths(date, event.shiftKey ? -12 : -1);
      break;
    default:
      return;
  }
  event.preventDefault();
  if (
    parseDate(target) &&
    props.min &&
    parseDate(props.min) &&
    target < props.min
  ) {
    target = props.min;
    direction = 1;
  }
  if (
    parseDate(target) &&
    props.max &&
    parseDate(props.max) &&
    target > props.max
  ) {
    target = props.max;
    direction = -1;
  }
  for (let attempts = 0; attempts < 3660; attempts++) {
    if (
      !parseDate(target) ||
      (props.min && target < props.min) ||
      (props.max && target > props.max)
    )
      return;
    if (!unavailable(target)) break;
    target = addDays(target, direction);
  }
  if (unavailable(target)) return;
  active.value = target;
  setMonth(target.slice(0, 7) + "-01");
  await nextTick();
  root.value
    ?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)
    ?.focus();
}
</script>
<template>
  <div ref="root" class="h-calendar" part="base" @keydown="escape">
    <div class="h-calendar-header">
      <button
        v-if="!browsing"
        type="button"
        class="h-calendar-nav"
        aria-label="Previous month"
        :disabled="disabled || !monthAllowed(-1)"
        part="previous"
        @click="moveMonth(-1)"
      >
        <HIcon name="left" :size="17" /></button
      ><button
        v-else
        type="button"
        class="h-calendar-nav"
        aria-label="Back to calendar"
        @click="toggleBrowse"
      >
        <HIcon name="left" :size="17" /></button
      ><button
        v-if="!browsing"
        type="button"
        class="h-calendar-title"
        aria-label="Choose month and year"
        aria-expanded="false"
        :disabled="disabled"
        part="month"
        @click="toggleBrowse"
      >
        <span :id="id" aria-live="polite">{{ title }}</span
        ><HIcon name="down" :size="13" /></button
      ><span v-else :id="id" class="h-calendar-title" aria-live="polite"
        >Choose month</span
      ><button
        v-if="!browsing"
        type="button"
        class="h-calendar-nav"
        aria-label="Next month"
        :disabled="disabled || !monthAllowed(1)"
        part="next"
        @click="moveMonth(1)"
      >
        <HIcon name="right" :size="17" /></button
      ><span v-else class="h-calendar-nav-space" aria-hidden="true" />
    </div>
    <div class="h-calendar-stage">
      <template v-if="browsing"
        ><div class="h-calendar-year" part="year">
          <button
            type="button"
            aria-label="Previous year"
            :disabled="disabled || (!invalidYear && browseYear! <= minYear)"
            @click="shiftYear(-1)"
          >
            <HIcon name="minus" :size="16" /></button
          ><input
            type="number"
            aria-label="Year"
            :form="`${id}-calendar-draft`"
            :value="browseYear ?? ''"
            :min="minYear"
            :max="maxYear"
            :disabled="disabled"
            inputmode="numeric"
            @input="changeYear"
            @keydown.enter.stop.prevent="!invalidYear && chooseMonth(tabMonth)"
          /><button
            type="button"
            aria-label="Next year"
            :disabled="disabled || (!invalidYear && browseYear! >= maxYear)"
            @click="shiftYear(1)"
          >
            <HIcon name="plus" :size="16" />
          </button>
        </div>
        <p class="h-calendar-year-hint" role="status">
          {{
            invalidYear
              ? `Enter a year from ${minYear} to ${maxYear}.`
              : "Choose a month to jump directly."
          }}
        </p>
        <div
          class="h-calendar-months"
          role="group"
          aria-label="Choose month"
          part="months"
        >
          <button
            v-for="(month, index) in months"
            :key="index"
            type="button"
            :data-month="index"
            :aria-label="`${month} ${browseYear ?? ''}`"
            :aria-pressed="
              !invalidYear &&
              visible.slice(0, 7) === monthValue(index).slice(0, 7)
            "
            :tabindex="index === tabMonth ? 0 : -1"
            :disabled="disabledMonth(index)"
            @keydown="monthKey($event, index)"
            @click="chooseMonth(index)"
          >
            {{ month }}
          </button>
        </div></template
      >
      <table
        v-else
        role="grid"
        :aria-label="label"
        :aria-describedby="id"
        part="grid"
      >
        <thead>
          <tr>
            <th v-for="(day, i) in weekdays" :key="i" scope="col">{{ day }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in 6" :key="row">
            <td
              v-for="(day, i) in days.slice((row - 1) * 7, row * 7)"
              :key="i"
              :aria-selected="day ? day === selected : undefined"
            >
              <button
                v-if="day"
                type="button"
                :data-date="day"
                :data-outside="!inMonth(day)"
                :aria-label="full.format(parseDate(day))"
                :aria-current="day === today ? 'date' : undefined"
                :tabindex="day === tabDate ? 0 : -1"
                :disabled="unavailable(day)"
                :class="{ selected: day === selected, outside: !inMonth(day) }"
                part="day"
                @focus="active = day"
                @click="select(day)"
                @keydown="key($event, day)"
              >
                {{ numbers.format(Number(day.slice(-2))) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="h-calendar-footer" part="footer">
      <span class="h-calendar-selected">{{ summary }}</span
      ><button
        type="button"
        :disabled="unavailable(today)"
        @click="select(today)"
      >
        Today</button
      ><button
        type="button"
        aria-label="Clear date"
        :disabled="disabled || !selected"
        @click="clear"
      >
        Clear
      </button>
    </div>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-calendar {
  font: 13px/1.5 var(--h-font);
  color: var(--h-text);
  width: 100%;
  max-width: 360px;
  min-width: 0;
}
.h-calendar-header {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
button {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
  transition:
    background 120ms,
    color 120ms,
    box-shadow 120ms;
}
.h-calendar-nav,
.h-calendar-nav-space {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
}
.h-calendar-nav {
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  color: var(--h-muted);
}
.h-calendar-nav:dir(rtl) .h-icon {
  transform: scaleX(-1);
}
.h-calendar-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 7px;
  min-width: 0;
  min-height: 44px;
  padding: 4px;
  border-radius: var(--h-radius-control);
  font-weight: 550;
}
.h-calendar-title > span {
  min-width: 0;
  text-wrap: balance;
}
.h-calendar-title > .h-icon {
  color: var(--h-muted);
}
.h-calendar-stage {
  min-height: calc(6 * var(--h-calendar-day-height, 44px) + 36px);
}
table {
  width: 100%;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 2px;
}
th {
  color: var(--h-muted);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.03em;
  padding-block: 4px 8px;
  overflow-wrap: anywhere;
}
td {
  padding: 0;
  text-align: center;
}
td button {
  position: relative;
  width: 100%;
  min-height: var(--h-calendar-day-height, 44px);
  border-radius: 9px;
  font-variant-numeric: tabular-nums;
}
td button:focus-visible {
  outline-offset: -2px;
}
button:hover:not(:disabled) {
  background: var(--h-raised);
  color: var(--h-text);
}
td button:hover:not(:disabled) {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
}
td button.outside {
  color: var(--h-muted);
}
td button.selected {
  background: var(--h-accent);
  color: var(--h-on-accent);
  font-weight: 600;
  box-shadow: 0 2px 7px var(--h-accent-subtle);
}
td button.selected:hover:not(:disabled) {
  background: var(--h-accent-hover);
  color: var(--h-on-accent);
}
td button[aria-current="date"]::after {
  content: "";
  position: absolute;
  bottom: 5px;
  left: calc(50% - 2px);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
}
button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
.h-calendar-footer {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--h-border);
}
.h-calendar-selected {
  min-width: 0;
  margin-inline-end: auto;
  color: var(--h-muted);
  font-size: 11px;
  overflow-wrap: anywhere;
}
.h-calendar-footer button {
  padding: 8px 10px;
  min-height: 44px;
  border-radius: var(--h-radius-control);
  font-size: 12px;
  color: var(--h-accent-text);
}
.h-calendar-year {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  gap: 4px;
  align-items: center;
  padding: 3px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
}
.h-calendar-year button {
  height: 44px;
  display: grid;
  place-items: center;
  border-radius: max(4px, calc(var(--h-radius-control) - 4px));
  color: var(--h-muted);
}
.h-calendar-year input {
  appearance: textfield;
  min-width: 0;
  width: 100%;
  padding: 8px 2px;
  border: 0;
  background: transparent;
  color: var(--h-text);
  font: 550 18px/1.5 var(--h-font);
  font-variant-numeric: tabular-nums;
  text-align: center;
}
.h-calendar-year input::-webkit-inner-spin-button,
.h-calendar-year input::-webkit-outer-spin-button {
  appearance: none;
  margin: 0;
}
.h-calendar-year-hint {
  margin: 8px 0 12px;
  color: var(--h-muted);
  font-size: 11px;
  text-align: center;
}
.h-calendar-months {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}
.h-calendar-months button {
  min-height: 44px;
  border-radius: var(--h-radius-control);
  border: 1px solid var(--h-border);
}
.h-calendar-months button[aria-pressed="true"] {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  border-color: var(--h-accent-text);
}
</style>
