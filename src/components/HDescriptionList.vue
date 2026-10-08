<script setup lang="ts">
import { safeHref } from "../internal";
import type { DescriptionItem } from "../themes";
withDefaults(
  defineProps<{
    items: DescriptionItem[];
    columns?: 1 | 2 | 3 | "auto";
    dense?: boolean;
    variant?: "stacked" | "inline";
    minColumnWidth?: string;
  }>(),
  {
    items: () => [],
    columns: 1,
    variant: "stacked",
    minColumnWidth: "200px",
  },
);
</script>
<template>
  <dl
    class="h-description-list"
    :class="[variant, { dense }]"
    :style="{
      '--h-description-columns': columns,
      gridTemplateColumns:
        columns === 'auto'
          ? `repeat(auto-fit,minmax(min(100%,${minColumnWidth}),1fr))`
          : undefined,
    }"
    part="base"
  >
    <div v-for="item in items" :key="item.key" part="item">
      <dt part="label">{{ item.label }}</dt>
      <dd part="value">
        <slot :name="`value:${item.key}`"
          ><a v-if="safeHref(item.href)" :href="safeHref(item.href)">{{
            item.value ?? "—"
          }}</a
          ><template v-else>{{ item.value ?? "—" }}</template></slot
        >
      </dd>
    </div>
  </dl>
</template>
<style scoped>
@import "../styles/base.css";
.h-description-list {
  display: grid;
  grid-template-columns: repeat(var(--h-description-columns), minmax(0, 1fr));
  gap: 0 24px;
  margin: 0;
  font-family: var(--h-font);
  color: var(--h-text);
}
.h-description-list > div {
  padding: 14px 0;
  border-bottom: 1px solid var(--h-border);
  min-width: 0;
}
dt {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
  margin-bottom: 5px;
}
dd {
  margin: 0;
  font-size: 13px;
  line-height: 1.8;
  overflow-wrap: anywhere;
}
a {
  color: var(--h-accent-text);
}
.dense > div {
  padding-block: 8px;
}
.inline > div {
  display: grid;
  grid-template-columns: minmax(80px, 0.6fr) minmax(0, 1fr);
  gap: 12px;
  align-items: baseline;
}
.inline dt {
  margin: 0;
}
@media (max-width: 550px) {
  .h-description-list {
    grid-template-columns: 1fr;
  }
}
</style>
