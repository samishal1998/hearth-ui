<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted } from "vue";
import HButton from "./HButton.vue";
import HInput from "./HInput.vue";
import HSelect from "./HSelect.vue";
import { copyText } from "../clipboard";
import type { LogEntry } from "../themes";
const props = withDefaults(
  defineProps<{
    entries: LogEntry[];
    label?: string;
    follow?: boolean;
    maxLines?: number;
    wrap?: boolean;
  }>(),
  { entries: () => [], label: "Logs", follow: true, maxLines: 500 },
);
const emit = defineEmits<{
  "update:follow": [follow: boolean];
  "search-change": [query: string];
  copied: [];
  "copy-error": [message: string];
}>();
const following = ref(props.follow);
watch(
  () => props.follow,
  (v) => (following.value = v),
);
const query = ref("");
const level = ref("all");
const viewport = ref<HTMLElement>();
const status = ref("");
const limit = computed(() =>
  Number.isFinite(props.maxLines) && props.maxLines > 0
    ? Math.floor(props.maxLines)
    : 500,
);
// ponytail: render a bounded tail; use virtualized, server-paged history for very large log archives.
const visible = computed(() =>
  props.entries
    .slice(-limit.value)
    .filter(
      (entry) =>
        (level.value === "all" || (entry.level || "info") === level.value) &&
        entry.message.toLowerCase().includes(query.value.toLowerCase()),
    ),
);
function follow(value: boolean) {
  following.value = value;
  emit("update:follow", value);
}
async function bottom() {
  await nextTick();
  if (following.value && viewport.value)
    viewport.value.scrollTop = viewport.value.scrollHeight;
}
onMounted(bottom);
watch(
  () => [
    props.entries.length,
    props.entries.at(-1)?.message,
    query.value,
    level.value,
    following.value,
    props.wrap,
  ],
  bottom,
  { flush: "post" },
);
watch(query, (value) => emit("search-change", value));
function scroll() {
  const el = viewport.value;
  if (
    el &&
    following.value &&
    el.scrollHeight - el.clientHeight - el.scrollTop > 16
  )
    follow(false);
}
async function copy() {
  try {
    await copyText(
      visible.value
        .map(
          (e) =>
            `${e.timestamp ? e.timestamp + " " : ""}[${(e.level || "info").toUpperCase()}] ${e.message}`,
        )
        .join("\n"),
    );
    status.value = "Visible logs copied.";
    emit("copied");
  } catch (e) {
    status.value = (e as Error).message;
    emit("copy-error", status.value);
  }
}
</script>
<template>
  <section class="h-logs" part="base">
    <header part="header">
      <strong>{{ label }}</strong>
      <div class="h-log-actions">
        <HButton
          size="compact"
          :aria-pressed="following"
          @click="follow(!following)"
          >{{ following ? "Pause follow" : "Resume follow" }}</HButton
        ><HButton size="compact" icon="copy" @click="copy"
          >Copy visible logs</HButton
        >
      </div>
    </header>
    <div class="h-log-filters">
      <HInput v-model="query" label="Search logs" type="search" /><HSelect
        v-model="level"
        label="Log level"
        :options="[
          { value: 'all', label: 'All levels' },
          { value: 'debug', label: 'Debug' },
          { value: 'info', label: 'Info' },
          { value: 'warning', label: 'Warning' },
          { value: 'error', label: 'Error' },
        ]"
      />
    </div>
    <div
      ref="viewport"
      class="h-log-viewport"
      :class="{ wrap }"
      role="log"
      aria-live="off"
      :aria-label="label"
      tabindex="0"
      part="viewport"
      @scroll="scroll"
    >
      <div
        v-for="entry in visible"
        :key="entry.id"
        class="h-log-line"
        :class="entry.level || 'info'"
        part="line"
      >
        <time v-if="entry.timestamp">{{ entry.timestamp }}</time
        ><span class="h-log-level">{{
          (entry.level || "info").toUpperCase()
        }}</span
        ><span class="h-log-message">{{ entry.message }}</span>
      </div>
      <p v-if="!visible.length" class="h-log-empty">No matching log entries.</p>
    </div>
    <footer>
      <span
        >{{ visible.length }} visible ·
        {{ Math.max(0, entries.length - limit) }} earlier entries omitted</span
      ><span role="status">{{
        status || (following ? "Following new entries." : "Follow paused.")
      }}</span>
    </footer>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-logs {
  min-width: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  font-family: var(--h-font);
  color: var(--h-text);
  overflow: hidden;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  padding: 16px;
}
strong {
  font-size: 14px;
  font-weight: 550;
}
.h-log-actions {
  display: flex;
  gap: 8px;
}
.h-log-filters {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 160px;
  gap: 15px;
  padding: 0 16px 16px;
}
.h-log-viewport {
  height: var(--h-log-height, 300px);
  overflow: auto;
  background: var(--h-bg);
  padding: 14px;
  font: 11px/1.9 var(--h-font-mono);
}
.h-log-line {
  display: flex;
  gap: 12px;
  min-width: max-content;
}
.h-log-line time {
  color: var(--h-faint);
  flex-shrink: 0;
}
.h-log-level {
  min-width: 55px;
  color: var(--h-info);
  flex-shrink: 0;
}
.warning .h-log-level {
  color: var(--h-warning);
}
.error .h-log-level {
  color: var(--h-danger);
}
.debug .h-log-level {
  color: var(--h-muted);
}
.h-log-message {
  white-space: pre;
}
.wrap .h-log-line {
  min-width: 0;
}
.wrap .h-log-message {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  min-width: 0;
}
footer {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 16px;
  font-size: 10px;
  color: var(--h-muted);
  border-top: 1px solid var(--h-border);
}
.h-log-empty {
  color: var(--h-muted);
}
@media (max-width: 450px) {
  .h-log-filters {
    grid-template-columns: 1fr;
  }
}
</style>
