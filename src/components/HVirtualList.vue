<script setup lang="ts">
import { computed, ref, watch, nextTick } from "vue";
import type { VirtualItem } from "../themes";
const props = withDefaults(
  defineProps<{
    items: VirtualItem[];
    label: string;
    height?: number;
    rowHeight?: number;
    overscan?: number;
    activeId?: string;
  }>(),
  { items: () => [], height: 360, rowHeight: 56, overscan: 4 },
);
const emit = defineEmits<{
  "range-change": [range: { start: number; end: number }];
}>();
const root = ref<HTMLElement>(),
  scroll = ref(0),
  focused = ref("");
const rowSize = computed(() =>
    Math.max(24, Number.isFinite(props.rowHeight) ? props.rowHeight : 56),
  ),
  viewport = computed(() =>
    Math.max(100, Number.isFinite(props.height) ? props.height : 360),
  ),
  extra = computed(() => Math.max(0, Math.min(30, props.overscan)));
const start = computed(() =>
    Math.max(0, Math.floor(scroll.value / rowSize.value) - extra.value),
  ),
  end = computed(() =>
    Math.min(
      props.items.length,
      Math.ceil((scroll.value + viewport.value) / rowSize.value) + extra.value,
    ),
  );
const visible = computed(() => {
  const indexes = Array.from(
    { length: Math.max(0, end.value - start.value) },
    (_, i) => start.value + i,
  );
  const pinned = props.items.findIndex((item) => item.id === focused.value);
  if (pinned >= 0 && !indexes.includes(pinned)) indexes.push(pinned);
  return indexes
    .sort((a, b) => a - b)
    .map((index) => ({ item: props.items[index], index }));
});
watch([start, end], () =>
  emit("range-change", { start: start.value, end: end.value }),
);
watch(
  () => props.activeId,
  async (id) => {
    const index = props.items.findIndex((item) => item.id === id);
    if (index < 0) return;
    await nextTick();
    if (root.value) root.value.scrollTop = index * rowSize.value;
  },
  { immediate: true },
);
watch(
  () => props.items.length,
  async () => {
    await nextTick();
    if (root.value) {
      root.value.scrollTop = Math.min(
        root.value.scrollTop,
        Math.max(0, props.items.length * rowSize.value - viewport.value),
      );
      scroll.value = root.value.scrollTop;
    }
  },
);
</script>
<template>
  <div
    ref="root"
    class="h-virtual-list"
    role="list"
    :aria-label="label"
    tabindex="0"
    :style="{ height: `${viewport}px` }"
    part="base"
    @scroll="scroll = ($event.target as HTMLElement).scrollTop"
    @focusout="!root?.contains($event.relatedTarget as Node) && (focused = '')"
  >
    <div
      class="h-virtual-space"
      :style="{ height: `${items.length * rowSize}px` }"
    >
      <div
        v-for="{ item, index } in visible"
        :key="item.id"
        role="listitem"
        :aria-posinset="index + 1"
        :aria-setsize="items.length"
        class="h-virtual-row"
        part="item"
        :style="{ top: `${index * rowSize}px`, height: `${rowSize}px` }"
        @focusin="focused = item.id"
      >
        <slot :name="`item:${item.id}`"
          ><slot name="item" :item="item" :index="index"
            ><strong>{{ item.label }}</strong
            ><small v-if="item.description">{{ item.description }}</small></slot
          ></slot
        >
      </div>
    </div>
    <p v-if="!items.length">No items.</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-virtual-list {
  overflow: auto;
  overscroll-behavior: contain;
  min-width: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  color: var(--h-text);
  font: 13px/1.7 var(--h-font);
}
.h-virtual-space {
  position: relative;
}
.h-virtual-row {
  position: absolute;
  inset-inline: 0;
  padding: 6px 12px;
  overflow: hidden;
  box-sizing: border-box;
  border-bottom: 1px solid var(--h-border);
}
strong {
  display: block;
  font-weight: 550;
}
small {
  display: block;
  font-size: max(var(--h-font-min-size, 12px), 12px);
  color: var(--h-muted);
}
p {
  margin: 20px;
  color: var(--h-muted);
}
</style>
