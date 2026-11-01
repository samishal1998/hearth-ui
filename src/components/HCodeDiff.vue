<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HButton from "./HButton.vue";
import type { DiffHunk, DiffLine } from "../themes";
import { countLimit } from "../visual-data";
import { copyText } from "../clipboard";
const props = withDefaults(
  defineProps<{
    hunks: DiffHunk[];
    label?: string;
    view?: "unified" | "split";
    maxLines?: number;
    maxHeight?: string;
    wrap?: boolean;
  }>(),
  {
    hunks: () => [],
    label: "Code changes",
    view: "unified",
    maxLines: 500,
    maxHeight: "420px",
  },
);
const emit = defineEmits<{
  "update:view": [view: "unified" | "split"];
  copied: [];
  "copy-error": [message: string];
}>();
const mode = ref(props.view),
  message = ref("");
watch(
  () => props.view,
  (value) => (mode.value = value),
);
const visible = computed(() => {
  let left = countLimit(props.maxLines, 500, 5000);
  return props.hunks.flatMap((hunk) => {
    if (!left) return [];
    const lines = hunk.lines.slice(0, left);
    left -= lines.length;
    return [{ ...hunk, lines }];
  });
});
const shown = computed(() =>
    visible.value.reduce((sum, hunk) => sum + hunk.lines.length, 0),
  ),
  total = computed(() =>
    props.hunks.reduce((sum, hunk) => sum + hunk.lines.length, 0),
  );
function pairs(lines: DiffLine[]) {
  const out: { left?: DiffLine; right?: DiffLine }[] = [];
  for (let i = 0; i < lines.length;) {
    if (lines[i].kind === "context") {
      out.push({ left: lines[i], right: lines[i] });
      i++;
      continue;
    }
    const removed: DiffLine[] = [],
      added: DiffLine[] = [];
    while (i < lines.length && lines[i].kind !== "context") {
      (lines[i].kind === "removed" ? removed : added).push(lines[i++]);
    }
    for (let j = 0; j < Math.max(removed.length, added.length); j++)
      out.push({ left: removed[j], right: added[j] });
  }
  return out;
}
const prefix = (line: DiffLine) =>
  line.kind === "added" ? "+" : line.kind === "removed" ? "-" : " ";
function change(value: "unified" | "split") {
  mode.value = value;
  emit("update:view", value);
}
async function copy() {
  try {
    await copyText(
      visible.value
        .map((hunk) =>
          [hunk.header, ...hunk.lines.map((line) => prefix(line) + line.text)]
            .filter((line) => line !== undefined)
            .join("\n"),
        )
        .join("\n"),
    );
    message.value = "Visible diff copied.";
    emit("copied");
  } catch (error) {
    message.value = (error as Error).message;
    emit("copy-error", message.value);
  }
}
</script>
<template>
  <section class="h-code-diff" :aria-label="label" part="base">
    <header>
      <strong>{{ label }}</strong>
      <div>
        <HButton
          size="compact"
          :aria-pressed="mode === 'unified'"
          @click="change('unified')"
          >Unified</HButton
        ><HButton
          size="compact"
          :aria-pressed="mode === 'split'"
          @click="change('split')"
          >Split</HButton
        ><HButton size="compact" :disabled="!shown" @click="copy"
          >Copy diff</HButton
        >
      </div>
    </header>
    <div
      v-if="shown"
      class="h-diff-viewport"
      :class="{ wrap }"
      :style="{ maxHeight }"
      role="region"
      :aria-label="`${label} lines`"
      tabindex="0"
      part="viewport"
    >
      <template v-for="hunk in visible" :key="hunk.id"
        ><p v-if="hunk.header" class="h-diff-header">{{ hunk.header }}</p>
        <table
          v-if="mode === 'unified'"
          class="h-diff-table"
          :aria-label="hunk.header || label"
        >
          <thead class="h-sr-only">
            <tr>
              <th scope="col">Change</th>
              <th scope="col">Old line</th>
              <th scope="col">New line</th>
              <th scope="col">Code</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(line, index) in hunk.lines"
              :key="index"
              :class="line.kind"
            >
              <td class="h-diff-sign">
                <span class="h-sr-only">{{ line.kind }}</span
                ><span aria-hidden="true">{{ prefix(line) }}</span>
              </td>
              <td class="h-diff-number">{{ line.oldLine ?? "" }}</td>
              <td class="h-diff-number">{{ line.newLine ?? "" }}</td>
              <td class="h-diff-code">
                <code>{{ line.text || " " }}</code>
              </td>
            </tr>
          </tbody>
        </table>
        <table
          v-else
          class="h-diff-table split"
          :aria-label="hunk.header || label"
        >
          <colgroup>
            <col style="width: 4ch" />
            <col />
            <col style="width: 4ch" />
            <col />
          </colgroup>
          <thead>
            <tr>
              <th scope="col" colspan="2">Before</th>
              <th scope="col" colspan="2">After</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(pair, index) in pairs(hunk.lines)" :key="index">
              <td class="h-diff-number" :class="pair.left?.kind">
                {{ pair.left?.oldLine ?? "" }}
              </td>
              <td class="h-diff-code" :class="pair.left?.kind">
                <code>{{
                  pair.left ? prefix(pair.left) + pair.left.text : ""
                }}</code>
              </td>
              <td class="h-diff-number" :class="pair.right?.kind">
                {{ pair.right?.newLine ?? "" }}
              </td>
              <td class="h-diff-code" :class="pair.right?.kind">
                <code>{{
                  pair.right ? prefix(pair.right) + pair.right.text : ""
                }}</code>
              </td>
            </tr>
          </tbody>
        </table></template
      >
    </div>
    <p v-else class="h-diff-empty">No changes to display.</p>
    <footer>
      <span v-if="shown < total">{{ shown }} of {{ total }} lines shown. </span
      ><span role="status" aria-atomic="true">{{ message }}</span>
    </footer>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-code-diff {
  min-width: 0;
  max-width: 100%;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-bg);
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
  overflow: hidden;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: var(--h-control-padding);
  border-bottom: 1px solid var(--h-border);
}
header > div {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.h-diff-viewport {
  overflow: auto;
  overscroll-behavior: contain;
}
.h-diff-header {
  padding: 8px 12px;
  background: var(--h-raised);
  color: var(--h-muted);
  font: 12px/1.6 var(--h-font-mono);
  overflow-wrap: anywhere;
}
.h-diff-table {
  border-collapse: collapse;
  width: 100%;
  font: 12px/1.8 var(--h-font-mono);
}
td {
  vertical-align: top;
  padding: 1px 6px;
}
thead th {
  text-align: start;
  padding: 6px 12px;
  color: var(--h-muted);
}
.h-diff-number {
  width: 4ch;
  color: var(--h-faint);
  text-align: end;
  user-select: none;
}
.h-diff-sign {
  width: 2ch;
  user-select: none;
}
.h-diff-code {
  white-space: pre;
}
.added {
  background: color-mix(in srgb, var(--h-success) 12%, transparent);
}
.removed {
  background: color-mix(in srgb, var(--h-danger) 12%, transparent);
}
.split {
  min-width: 640px;
  table-layout: fixed;
}
.split .h-diff-code {
  width: calc(50% - 4ch);
  overflow: auto;
}
.wrap .h-diff-code {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
footer,
.h-diff-empty {
  padding: var(--h-control-padding);
  font-size: 12px;
  color: var(--h-muted);
}
</style>
