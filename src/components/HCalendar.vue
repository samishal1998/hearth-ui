<script setup lang="ts">
import { computed, ref, watch, nextTick, useId } from "vue";
import { parseDate, dateString, addDays, addMonths } from "../dates";
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
const id = useId();
const root = ref<HTMLElement>();
const selected = ref(props.modelValue ?? props.value);
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
const visible = ref(initial());
const active = ref(selected.value);
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
  () => {
    visible.value = initial();
  },
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
const title = computed(() => formatter.value.format(parseDate(visible.value)));
const weekdays = computed(() =>
  Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(props.locale, {
      weekday: "short",
      timeZone: "UTC",
    }).format(parseDate(addDays("2026-09-20", (i + props.weekStartsOn) % 7))),
  ),
);
function unavailable(value: string) {
  return (
    props.disabled ||
    !parseDate(value) ||
    !!(props.min && value < props.min) ||
    !!(props.max && value > props.max) ||
    props.disabledDates.includes(value)
  );
}
const days = computed(() => {
  const first = parseDate(visible.value)!;
  const offset = (first.getUTCDay() - props.weekStartsOn + 7) % 7;
  const last = new Date(first);
  last.setUTCMonth(last.getUTCMonth() + 1);
  last.setUTCDate(0);
  const count = last.getUTCDate();
  return Array.from({ length: Math.ceil((offset + count) / 7) * 7 }, (_, i) =>
    i < offset || i >= offset + count
      ? ""
      : `${visible.value.slice(0, 7)}-${String(i - offset + 1).padStart(2, "0")}`,
  );
});
const tabDate = computed(() =>
  days.value.includes(active.value) && !unavailable(active.value)
    ? active.value
    : days.value.find((d) => d && !unavailable(d)),
);
function select(value: string) {
  if (unavailable(value)) return;
  selected.value = value;
  active.value = value;
  emit("update:modelValue", value);
  emit("change", value);
}
function monthAllowed(delta: number) {
  const target = addMonths(visible.value, delta);
  return (
    !!parseDate(target) &&
    !(props.min && addDays(addMonths(target, 1), -1) < props.min) &&
    !(props.max && target > props.max)
  );
}
function moveMonth(delta: number) {
  if (props.disabled || !monthAllowed(delta)) return;
  visible.value = addMonths(visible.value, delta);
  emit("update:month", visible.value.slice(0, 7));
}
async function key(event: KeyboardEvent, date: string) {
  let target = date;
  let direction = 1;
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
      direction = -1;
      target = addDays(
        date,
        -((parseDate(date)!.getUTCDay() - props.weekStartsOn + 7) % 7),
      );
      break;
    case "End":
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
  if (target.slice(0, 7) !== visible.value.slice(0, 7)) {
    visible.value = target.slice(0, 7) + "-01";
    emit("update:month", target.slice(0, 7));
  }
  await nextTick();
  root.value
    ?.querySelector<HTMLButtonElement>(`[data-date="${target}"]`)
    ?.focus();
}
</script>
<template>
  <div ref="root" class="h-calendar" part="base">
    <div class="h-calendar-header">
      <button
        type="button"
        aria-label="Previous month"
        :disabled="disabled || !monthAllowed(-1)"
        part="previous"
        @click="moveMonth(-1)"
      >
        ‹</button
      ><span :id="id" aria-live="polite" part="month">{{ title }}</span
      ><button
        type="button"
        aria-label="Next month"
        :disabled="disabled || !monthAllowed(1)"
        part="next"
        @click="moveMonth(1)"
      >
        ›
      </button>
    </div>
    <table role="grid" :aria-label="label" :aria-describedby="id" part="grid">
      <thead>
        <tr>
          <th v-for="(day, i) in weekdays" :key="i" scope="col">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in days.length / 7" :key="row">
          <td
            v-for="(day, i) in days.slice((row - 1) * 7, row * 7)"
            :key="i"
            :aria-selected="day ? day === selected : undefined"
          >
            <button
              v-if="day"
              type="button"
              :data-date="day"
              :aria-label="full.format(parseDate(day))"
              :aria-current="day === today ? 'date' : undefined"
              :tabindex="day === tabDate ? 0 : -1"
              :disabled="unavailable(day)"
              :class="{ selected: day === selected }"
              part="day"
              @focus="active = day"
              @click="select(day)"
              @keydown="key($event, day)"
            >
              {{ Number(day.slice(-2)) }}
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}
.h-calendar-header span {
  font-weight: 550;
  text-align: center;
  text-wrap: balance;
}
button {
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  border-radius: var(--h-radius-control);
  min-height: 40px;
  cursor: pointer;
}
.h-calendar-header button {
  width: 44px;
  min-height: 44px;
  font-size: 22px;
  flex-shrink: 0;
}
table {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}
th {
  color: var(--h-muted);
  font-size: 10px;
  font-weight: 500;
  overflow-wrap: anywhere;
}
td {
  padding: 1px;
  text-align: center;
}
td button {
  width: 100%;
  font-variant-numeric: tabular-nums;
}
button:hover:not(:disabled) {
  background: var(--h-raised);
}
button.selected {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  font-weight: 600;
}
button[aria-current="date"] {
  box-shadow: inset 0 0 0 1px var(--h-border-strong);
}
button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
