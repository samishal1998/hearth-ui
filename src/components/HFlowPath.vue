<script setup lang="ts">
import type { FlowStage } from "../themes";
import HBadge from "./HBadge.vue";
import { statusTone } from "../visual-data";
defineProps<{
  items: FlowStage[];
  selected?: string;
  orientation: "horizontal" | "vertical";
}>();
const emit = defineEmits<{ select: [id: string] }>();
</script>
<template>
  <ol class="h-flow-path" :class="orientation">
    <li v-for="(item, index) in items" :key="item.id">
      <span v-if="index" class="h-flow-connector" aria-hidden="true" />
      <div class="h-flow-stage">
        <button
          type="button"
          class="h-flow-node"
          :aria-pressed="selected === item.id"
          part="node"
          @click="emit('select', item.id)"
        >
          <strong>{{ item.label }}</strong
          ><HBadge
            :label="item.status || 'pending'"
            :tone="statusTone(item.status)"
          /><span v-if="item.description">{{ item.description }}</span>
        </button>
        <div
          v-if="item.parallel?.length"
          class="h-flow-parallel"
          role="group"
          :aria-label="`${item.label} parallel branches`"
        >
          <HFlowPath
            v-for="(branch, i) in item.parallel"
            :key="i"
            :items="branch"
            :selected="selected"
            orientation="vertical"
            @select="emit('select', $event)"
          />
        </div>
      </div>
    </li>
  </ol>
</template>
<style scoped>
@import "../styles/base.css";
.h-flow-path {
  display: flex;
  align-items: center;
  gap: 0;
  list-style: none;
  margin: 0;
  padding: 0;
  min-width: 0;
}
.h-flow-path > li {
  display: flex;
  align-items: center;
  min-width: 0;
}
.h-flow-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.h-flow-node {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  width: 190px;
  max-width: 100%;
  padding: var(--h-card-padding);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
  text-align: start;
  overflow-wrap: anywhere;
}
.h-flow-node > span:last-child {
  font-size: 12px;
  color: var(--h-muted);
}
.h-flow-node[aria-pressed="true"] {
  border-color: var(--h-accent-text);
  box-shadow: 0 0 0 1px var(--h-accent-text);
}
.h-flow-connector {
  display: grid;
  place-items: center;
  width: 36px;
  flex-shrink: 0;
  color: var(--h-muted);
}
.h-flow-connector::after {
  content: "→";
}
.horizontal:dir(rtl) > li > .h-flow-connector::after {
  content: "←";
}
.h-flow-parallel {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  border-block: 1px solid var(--h-border-strong);
  border-radius: var(--h-radius-control);
}
.vertical {
  flex-direction: column;
  align-items: stretch;
}
.vertical > li {
  flex-direction: column;
}
.vertical > li > .h-flow-connector {
  height: 28px;
  width: 100%;
}
.vertical > li > .h-flow-connector::after {
  content: "↓";
}
@container (max-width:600px) {
  .h-flow-path {
    flex-direction: column;
    align-items: stretch;
  }
  .h-flow-path > li {
    flex-direction: column;
  }
  .h-flow-connector {
    height: 28px;
    width: 100%;
  }
  .h-flow-connector::after,
  .horizontal:dir(rtl) > li > .h-flow-connector::after {
    content: "↓";
  }
  .h-flow-parallel {
    flex-wrap: wrap;
    justify-content: center;
    max-width: 100%;
  }
}
</style>
