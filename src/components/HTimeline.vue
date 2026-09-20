<script setup lang="ts">
import { safeHref } from "../internal";
import type { TimelineItem } from "../themes";

withDefaults(
  defineProps<{
    items?: TimelineItem[];
    label?: string;
    loading?: boolean;
    loadingText?: string;
    emptyText?: string;
  }>(),
  {
    items: () => [],
    label: "Activity timeline",
    loadingText: "Loading activity…",
    emptyText: "No activity yet.",
  },
);
</script>

<template>
  <div class="h-timeline" part="base" :aria-busy="loading || undefined">
    <ol v-if="items.length" :aria-label="label" role="list" part="list">
      <li
        v-for="item in items"
        :key="item.id"
        :class="item.tone || 'neutral'"
        part="item"
      >
        <span class="h-timeline-marker" part="marker" aria-hidden="true" />
        <div class="h-timeline-heading">
          <a
            v-if="safeHref(item.href)"
            :href="safeHref(item.href)"
            class="h-timeline-title"
            part="title"
            >{{ item.title }}</a
          >
          <span v-else class="h-timeline-title" part="title">{{
            item.title
          }}</span>
          <time v-if="item.timestamp" :datetime="item.dateTime" part="time">{{
            item.timestamp
          }}</time>
        </div>
        <div class="h-timeline-detail" part="detail">
          <slot :name="`detail:${item.id}`"
            ><p v-if="item.description">{{ item.description }}</p></slot
          >
        </div>
      </li>
    </ol>
    <p v-if="loading" role="status" class="h-timeline-message" part="loading">
      {{ loadingText }}
    </p>
    <div v-else-if="!items.length" class="h-timeline-message" part="empty">
      <slot name="empty">{{ emptyText }}</slot>
    </div>
  </div>
</template>

<style scoped>
@import "../styles/base.css";
.h-timeline {
  min-width: 0;
  color: var(--h-text);
  font: 13px/1.8 var(--h-font);
}
ol {
  list-style: none;
  padding: 0;
  margin: 0;
}
li {
  --timeline-color: var(--h-muted);
  position: relative;
  min-width: 0;
  padding-inline-start: 28px;
  padding-block-end: 24px;
}
li:last-child {
  padding-block-end: 0;
}
li:not(:last-child)::before {
  content: "";
  position: absolute;
  inset-inline-start: 5px;
  inset-block: 17px -5px;
  width: 1px;
  background: var(--h-border);
}
.h-timeline-marker {
  position: absolute;
  inset-inline-start: 1px;
  inset-block-start: 7px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--timeline-color);
}
.success {
  --timeline-color: var(--h-success);
}
.warning {
  --timeline-color: var(--h-warning);
}
.danger {
  --timeline-color: var(--h-danger);
}
.info {
  --timeline-color: var(--h-info);
}
.accent {
  --timeline-color: var(--h-accent-text);
}
.h-timeline-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 2px 16px;
}
.h-timeline-title {
  font-weight: 550;
  overflow-wrap: anywhere;
  min-width: 0;
}
a {
  color: var(--h-accent-text);
  text-underline-offset: 3px;
}
time {
  color: var(--h-muted);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  overflow-wrap: anywhere;
}
.h-timeline-detail {
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.h-timeline-detail p {
  margin: 4px 0 0;
  text-wrap: pretty;
}
.h-timeline-message {
  margin: 0;
  color: var(--h-muted);
}
ol + .h-timeline-message {
  margin-block-start: 20px;
}
</style>
