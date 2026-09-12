<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HIcon from "./HIcon.vue";
const props = withDefaults(
  defineProps<{
    modelValue?: number;
    total: number;
    pageSize?: number;
    label?: string;
  }>(),
  { modelValue: 1, total: 0, pageSize: 20, label: "Pagination" },
);
const emit = defineEmits<{
  "update:modelValue": [page: number];
  change: [page: number];
}>();
const local = ref(props.modelValue);
watch(
  () => props.modelValue,
  (v) => (local.value = v),
);
const count = computed(() =>
  Math.max(
    1,
    Math.ceil(
      (Number.isFinite(props.total) ? Math.max(0, props.total) : 0) /
        (Number.isFinite(props.pageSize) && props.pageSize > 0
          ? props.pageSize
          : 20),
    ),
  ),
);
const current = computed(() =>
  Math.min(count.value, Math.max(1, Math.floor(local.value) || 1)),
);
const pages = computed(() => {
  const values = [
    ...new Set(
      [
        1,
        count.value,
        current.value - 1,
        current.value,
        current.value + 1,
      ].filter((v) => v >= 1 && v <= count.value),
    ),
  ].sort((a, b) => a - b);
  const out: (number | string)[] = [];
  values.forEach((v, i) => {
    if (i && v - values[i - 1] > 1) out.push(`gap-${v}`);
    out.push(v);
  });
  return out;
});
function go(page: number) {
  if (page < 1 || page > count.value || page === current.value) return;
  local.value = page;
  emit("update:modelValue", page);
  emit("change", page);
}
</script>
<template>
  <nav class="h-pagination" :aria-label="label" part="base">
    <button
      type="button"
      aria-label="Previous page"
      :disabled="current <= 1"
      part="previous"
      @click="go(current - 1)"
    >
      <HIcon class="h-prev" name="arrow" :size="16" /></button
    ><template v-for="page in pages" :key="page"
      ><span v-if="typeof page === 'string'" aria-hidden="true">…</span
      ><button
        v-else
        type="button"
        :aria-label="`Page ${page}`"
        :aria-current="page === current ? 'page' : undefined"
        part="page"
        @click="go(page)"
      >
        {{ page }}
      </button></template
    ><button
      type="button"
      aria-label="Next page"
      :disabled="current >= count"
      part="next"
      @click="go(current + 1)"
    >
      <HIcon name="arrow" :size="16" />
    </button>
  </nav>
</template>
<style scoped>
@import "../styles/base.css";
.h-pagination {
  display: flex;
  align-items: center;
  gap: 5px;
  flex-wrap: wrap;
  font-family: var(--h-font);
  color: var(--h-text);
}
button {
  display: grid;
  place-items: center;
  min-width: 40px;
  min-height: 40px;
  padding: 8px 10px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
button:hover {
  border-color: var(--h-border-strong);
}
button[aria-current="page"] {
  background: var(--h-accent);
  border-color: var(--h-accent);
  color: var(--h-on-accent);
}
button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
.h-prev {
  transform: rotate(180deg);
}
.h-pagination > span {
  padding: 8px 4px;
  color: var(--h-muted);
}
</style>
