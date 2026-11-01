<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HTraceNode from "./HTraceNode.vue";
import type { TraceItem } from "../themes";
import { countLimit } from "../visual-data";
const props = withDefaults(
  defineProps<{
    items: TraceItem[];
    label: string;
    expanded?: string[];
    defaultExpanded?: string[];
    maxNodes?: number;
    maxDepth?: number;
  }>(),
  { items: () => [], defaultExpanded: () => [], maxNodes: 300, maxDepth: 8 },
);
const emit = defineEmits<{ "update:expanded": [ids: string[]] }>();
const open = ref([...(props.expanded ?? props.defaultExpanded)]);
watch(
  () => props.expanded,
  (value) => {
    if (value) open.value = [...value];
  },
);
const tree = computed(() => {
  let remaining = countLimit(props.maxNodes, 300, 2000),
    truncated = false;
  const path = new Set<TraceItem>();
  function walk(items: TraceItem[], depth: number): TraceItem[] {
    const out: TraceItem[] = [];
    for (const item of items) {
      if (
        remaining <= 0 ||
        depth > countLimit(props.maxDepth, 8, 20) ||
        path.has(item)
      ) {
        truncated = true;
        break;
      }
      remaining--;
      path.add(item);
      out.push({
        ...item,
        children: item.children ? walk(item.children, depth + 1) : undefined,
      });
      path.delete(item);
    }
    return out;
  }
  return {
    items: walk(props.items, 0),
    get truncated() {
      return truncated;
    },
  };
});
function toggle(id: string, value: boolean) {
  open.value = value
    ? [...new Set([...open.value, id])]
    : open.value.filter((item) => item !== id);
  emit("update:expanded", [...open.value]);
}
</script>
<template>
  <section class="h-trace-view" :aria-label="label" part="base">
    <strong>{{ label }}</strong>
    <ol v-if="tree.items.length">
      <HTraceNode
        v-for="item in tree.items"
        :key="item.id"
        :item="item"
        :expanded="open"
        @toggle="toggle"
      />
    </ol>
    <p v-else>No execution steps.</p>
    <p v-if="tree.truncated">
      Some steps were omitted at the node/depth limit or because of a cycle.
    </p>
  </section>
</template>
<style scoped>
.h-trace-view {
  min-width: 0;
  max-width: 100%;
  font: var(--h-font-size)/1.7 var(--h-font);
  color: var(--h-text);
}
ol {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}
p {
  color: var(--h-muted);
  font-size: 12px;
}
</style>
