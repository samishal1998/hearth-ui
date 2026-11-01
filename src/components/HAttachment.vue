<script setup lang="ts">
import { computed } from "vue";
import HButton from "./HButton.vue";
import HBadge from "./HBadge.vue";
import HProgress from "./HProgress.vue";
import { safeHref } from "../internal";
const props = withDefaults(
  defineProps<{
    name: string;
    href?: string;
    previewSrc?: string;
    size?: number;
    description?: string;
    state?: "idle" | "uploading" | "processing" | "error" | "done";
    progress?: number;
    removable?: boolean;
  }>(),
  { state: "done" },
);
const emit = defineEmits<{ remove: []; preview: [] }>();
const image = computed(() =>
  props.previewSrc?.startsWith("blob:")
    ? props.previewSrc
    : safeHref(props.previewSrc),
);
const downloadHref = computed(() =>
  props.href?.startsWith("blob:") ? props.href : safeHref(props.href),
);
const sizeText = computed(() => {
  if (!Number.isFinite(props.size) || props.size! < 0) return "";
  const bytes = props.size!;
  return bytes < 1024
    ? `${bytes} B`
    : bytes < 1048576
      ? `${(bytes / 1024).toFixed(1)} KB`
      : `${(bytes / 1048576).toFixed(1)} MB`;
});
</script>
<template>
  <article class="h-attachment" :aria-label="name" part="base">
    <img v-if="image" :src="image" alt="" part="preview" />
    <div class="h-attachment-copy">
      <strong>{{ name }}</strong>
      <p v-if="sizeText || description">
        {{ [sizeText, description].filter(Boolean).join(" · ") }}
      </p>
      <HBadge
        :label="state"
        :tone="
          state === 'error' ? 'danger' : state === 'done' ? 'success' : 'info'
        "
      /><HProgress
        v-if="state === 'uploading'"
        :label="`Uploading ${name}`"
        :value="progress"
        :indeterminate="progress === undefined"
      />
    </div>
    <div class="h-attachment-actions">
      <HButton
        size="compact"
        :label="`Preview ${name}`"
        @click="emit('preview')"
        >Preview</HButton
      ><a
        v-if="downloadHref"
        :href="downloadHref"
        :download="name"
        :aria-label="`Download ${name}`"
        >Download</a
      ><HButton
        v-if="removable"
        size="compact"
        icon-only
        icon="close"
        :label="`Remove ${name}`"
        @click="emit('remove')"
      />
    </div>
  </article>
</template>
<style scoped>
@import "../styles/base.css";
.h-attachment {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--h-gap);
  padding: var(--h-control-padding);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
  min-width: 0;
  max-width: 100%;
}
img {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: 5px;
  flex-shrink: 0;
}
.h-attachment-copy {
  flex: 1;
  min-width: min(140px, 100%);
}
strong {
  display: block;
  overflow-wrap: anywhere;
  font-weight: 550;
}
p {
  font-size: 12px;
  color: var(--h-muted);
  margin: 3px 0 6px;
}
.h-attachment-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
a {
  color: var(--h-accent-text);
  font-size: 12px;
  display: inline-flex;
  align-items: center;
  min-height: var(--h-control-height);
}
</style>
