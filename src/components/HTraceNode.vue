<script setup lang="ts">
import type { TraceItem } from "../themes";
import HBadge from "./HBadge.vue";
import HCodeBlock from "./HCodeBlock.vue";
import { statusTone, formatAmount } from "../visual-data";
const props = defineProps<{ item: TraceItem; expanded: string[] }>();
const emit = defineEmits<{ toggle: [id: string, open: boolean] }>();
function toggle(event: Event) {
  const open = (event.currentTarget as HTMLDetailsElement).open;
  if (open !== props.expanded.includes(props.item.id))
    emit("toggle", props.item.id, open);
}
</script>
<template>
  <li class="h-trace-node">
    <details
      v-if="item.children?.length || item.details || item.description"
      :open="expanded.includes(item.id)"
      @toggle="toggle"
    >
      <summary>
        <span>{{ item.label }}</span
        ><HBadge
          :label="item.status || 'pending'"
          :tone="statusTone(item.status)"
        /><time v-if="item.duration !== undefined">{{
          formatAmount(item.duration, "ms")
        }}</time>
      </summary>
      <div class="h-trace-body">
        <p v-if="item.description">{{ item.description }}</p>
        <HCodeBlock
          v-if="item.details"
          :code="item.details"
          :title="`${item.label} details`"
          max-height="240px"
          wrap
        />
        <ol v-if="item.children?.length">
          <HTraceNode
            v-for="child in item.children"
            :key="child.id"
            :item="child"
            :expanded="expanded"
            @toggle="(id, open) => emit('toggle', id, open)"
          />
        </ol>
      </div>
    </details>
    <div v-else class="h-trace-leaf">
      <span>{{ item.label }}</span
      ><HBadge
        :label="item.status || 'pending'"
        :tone="statusTone(item.status)"
      /><time v-if="item.duration !== undefined">{{
        formatAmount(item.duration, "ms")
      }}</time>
    </div>
  </li>
</template>
<style scoped>
@import "../styles/base.css";
@import "../styles/disclosure.css";
.h-trace-node {
  min-width: 0;
  list-style: none;
}
summary,
.h-trace-leaf {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  min-height: var(--h-row-height);
  padding: var(--h-row-padding) 0;
  border-bottom: 1px solid var(--h-border);
  font-size: 13px;
}
summary {
  cursor: pointer;
}
summary::before {
  content: "›";
  width: 12px;
  color: var(--h-muted);
}
details[open] > summary::before {
  content: "⌄";
}
summary > span,
.h-trace-leaf > span {
  min-width: 0;
  overflow-wrap: anywhere;
}
time {
  margin-inline-start: auto;
  color: var(--h-muted);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.h-trace-body {
  padding: var(--h-gap) 0 var(--h-gap) 16px;
  border-inline-start: 1px solid var(--h-border);
}
ol {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
p {
  font-size: 12px;
  color: var(--h-muted);
  margin-bottom: 10px;
}
</style>
