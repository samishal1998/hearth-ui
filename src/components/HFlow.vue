<script setup lang="ts">
import { computed, useId } from "vue";
import type { FlowStage } from "../themes";
import HFlowPath from "./HFlowPath.vue";
import { countLimit } from "../visual-data";
const props = withDefaults(
  defineProps<{
    items: FlowStage[];
    label: string;
    selected?: string;
    orientation?: "horizontal" | "vertical";
    maxNodes?: number;
    maxDepth?: number;
  }>(),
  { items: () => [], orientation: "horizontal", maxNodes: 200, maxDepth: 6 },
);
const emit = defineEmits<{ select: [id: string] }>();
const id = useId();
const tree = computed(() => {
  let remaining = countLimit(props.maxNodes, 200, 1000),
    truncated = false;
  const path = new Set<FlowStage>();
  function walk(items: FlowStage[], depth: number): FlowStage[] {
    const output: FlowStage[] = [];
    for (const item of items) {
      if (
        remaining <= 0 ||
        depth > countLimit(props.maxDepth, 6, 12) ||
        path.has(item)
      ) {
        truncated = true;
        break;
      }
      remaining--;
      path.add(item);
      output.push({
        ...item,
        parallel: item.parallel?.map((branch) => walk(branch, depth + 1)),
      });
      path.delete(item);
    }
    return output;
  }
  return {
    items: walk(props.items, 0),
    get truncated() {
      return truncated;
    },
  };
});
</script>
<template>
  <figure
    class="h-flow h-data-figure"
    part="base"
    :aria-labelledby="`${id}-title`"
  >
    <figcaption :id="`${id}-title`">{{ label }}</figcaption>
    <div
      v-if="tree.items.length"
      class="h-flow-viewport"
      role="region"
      :aria-label="`${label} diagram`"
      tabindex="0"
      part="viewport"
    >
      <HFlowPath
        :items="tree.items"
        :selected="selected"
        :orientation="orientation"
        @select="emit('select', $event)"
      />
    </div>
    <p v-else class="h-data-empty">No workflow stages.</p>
    <p v-if="tree.truncated" class="h-data-note">
      Some stages were omitted at the node/depth limit or because of a cycle.
    </p>
    <slot name="footer" />
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/data-display.css";
.h-flow {
  container-type: inline-size;
}
.h-flow-viewport {
  overflow: auto;
  max-width: 100%;
  padding: 20px 4px;
  overscroll-behavior: contain;
}
</style>
