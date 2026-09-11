<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HIcon from "./HIcon.vue";
import HBadge from "./HBadge.vue";
import HButton from "./HButton.vue";
import { safeHref } from "../internal";
import type { Tone } from "../themes";
const props = withDefaults(
  defineProps<{
    name: string;
    url?: string;
    description?: string;
    category?: string;
    image?: string;
    status?: "healthy" | "unknown" | "degraded" | "unreachable" | "missing";
    source?: string;
    favorite?: boolean;
    editable?: boolean;
    target?: string;
  }>(),
  { status: "unknown", source: "Self-hosted", target: "_blank" },
);
const emit = defineEmits<{
  "favorite-change": [favorite: boolean];
  inspect: [];
  edit: [];
}>();
const failed = ref(false);
watch(
  () => props.image,
  () => (failed.value = false),
);
const statusLabels = {
  healthy: "Healthy",
  unknown: "Not checked",
  degraded: "Needs attention",
  unreachable: "Unreachable",
  missing: "Missing",
};
const statusTones: Record<string, Tone> = {
  healthy: "success",
  unknown: "neutral",
  degraded: "warning",
  unreachable: "danger",
  missing: "warning",
};
const color = computed(
  () =>
    ["accent", "info", "success", "warning"][
      [...props.name].reduce((n, c) => n + c.charCodeAt(0), 0) % 4
    ],
);
</script>
<template>
  <article class="h-app" part="base">
    <div class="h-app-top">
      <span class="h-app-icon" part="app-icon" :class="color"
        ><img
          v-if="image && !failed"
          :src="image"
          alt=""
          @error="failed = true"
        /><span v-else>{{ name.slice(0, 1).toUpperCase() }}</span></span
      >
      <div v-if="editable" class="h-app-actions">
        <button
          type="button"
          :class="{ favorite }"
          :aria-label="`${favorite ? 'Unfavorite' : 'Favorite'} ${name}`"
          :aria-pressed="favorite"
          part="favorite"
          @click="emit('favorite-change', !favorite)"
        >
          <HIcon name="star" :size="18" /></button
        ><HButton
          icon="settings"
          icon-only
          variant="ghost"
          :label="`Edit ${name}`"
          @click="emit('edit')"
        />
      </div>
      <HIcon v-else-if="safeHref(url)" name="launch" :size="16" />
    </div>
    <h3 part="title">
      <a
        v-if="safeHref(url)"
        :href="safeHref(url)"
        :target="target"
        rel="noopener noreferrer"
        >{{ name }}<HIcon name="launch" :size="13" /></a
      ><template v-else>{{ name }}</template>
    </h3>
    <p v-if="description" class="h-app-description" part="description">
      {{ description }}
    </p>
    <div class="h-app-category">
      <HBadge v-if="category" :label="category" /><slot />
    </div>
    <footer part="footer">
      <HBadge
        :label="statusLabels[status]"
        :tone="statusTones[status]"
        dot
      /><button
        v-if="source && editable"
        class="h-source"
        type="button"
        @click="emit('inspect')"
      >
        <HIcon name="server" :size="13" />{{ source }}</button
      ><span v-else-if="source" class="h-source"
        ><HIcon name="server" :size="13" />{{ source }}</span
      >
    </footer>
  </article>
</template>
<style scoped>
@import "../styles/base.css";
.h-app {
  padding: var(--h-card-padding) var(--h-card-padding) 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  font-family: var(--h-font);
  color: var(--h-text);
  box-shadow: var(--h-shadow-soft);
  transition: border-color var(--h-motion);
  min-width: 0;
}
.h-app:hover {
  border-color: color-mix(in srgb, var(--h-accent) 35%, var(--h-border));
}
.h-app-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.h-app-top > .h-icon {
  color: var(--h-muted);
}
.h-app-icon {
  --icon-color: var(--h-accent-text);
  display: grid;
  place-items: center;
  width: 46px;
  height: 46px;
  border-radius: calc(var(--h-radius-control) + 2px);
  background: color-mix(in srgb, var(--icon-color) 17%, var(--h-surface));
  color: var(--icon-color);
  font-size: 24px;
  font-weight: 500;
  flex-shrink: 0;
}
.h-app-icon.info {
  --icon-color: var(--h-info);
}
.h-app-icon.success {
  --icon-color: var(--h-success);
}
.h-app-icon.warning {
  --icon-color: var(--h-warning);
}
img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  border-radius: 5px;
  outline: 1px solid color-mix(in srgb, var(--h-text) 10%, transparent);
}
.h-app-actions {
  display: flex;
  align-items: center;
  gap: 1px;
  margin-right: -10px;
}
.h-app-actions > button {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--h-radius-control);
  background: none;
  color: var(--h-muted);
}
.h-app-actions > button:hover {
  background: var(--h-accent-subtle);
}
.h-app-actions > button.favorite {
  color: var(--h-warning);
}
.favorite :deep(svg) {
  fill: currentColor;
}
h3 {
  font-size: 16px;
  font-weight: 550;
  letter-spacing: -0.3px;
  margin-top: 18px;
  overflow-wrap: anywhere;
}
h3 a {
  display: flex;
  align-items: center;
  gap: 8px;
  color: inherit;
  text-decoration: none;
}
h3 a:hover {
  color: var(--h-accent-text);
}
h3 .h-icon {
  color: var(--h-muted);
}
.h-app-description {
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-top: 7px;
  min-height: 43px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.h-app-category {
  margin: 14px 0 18px;
  min-height: 22px;
}
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-top: 1px solid var(--h-border);
  min-height: 50px;
}
.h-source {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: var(--h-muted);
  background: none;
  border: 0;
  padding: 0;
  min-height: 44px;
}
button.h-source:hover {
  color: var(--h-accent-text);
}
</style>
