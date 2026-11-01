<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HTreeView from "./HTreeView.vue";
import HButton from "./HButton.vue";
import { jsonTree } from "../json-view";
import { countLimit } from "../visual-data";
import { copyText } from "../clipboard";
const props = withDefaults(
  defineProps<{
    value: unknown;
    label?: string;
    maxDepth?: number;
    maxEntries?: number;
    maxHeight?: string;
  }>(),
  { label: "JSON data", maxDepth: 6, maxEntries: 300, maxHeight: "400px" },
);
const emit = defineEmits<{
  select: [path: string];
  copied: [kind: "path" | "value"];
  "copy-error": [message: string];
}>();
const selected = ref("json:"),
  message = ref("");
const tree = computed(() =>
  jsonTree(
    props.value,
    countLimit(props.maxDepth, 6, 20),
    countLimit(props.maxEntries, 300, 2000),
  ),
);
const node = computed(
  () => tree.value.nodes.get(selected.value) || tree.value.nodes.get("json:")!,
);
watch(tree, () => {
  if (!tree.value.nodes.has(selected.value)) selected.value = "json:";
});
async function copy(kind: "path" | "value") {
  try {
    const text =
      kind === "path"
        ? node.value.path
        : JSON.stringify(node.value.value, null, 2);
    if (text === undefined)
      throw new Error("This value cannot be represented as JSON.");
    if (text.length > 1000000)
      throw new Error(
        "This value is too large to copy here. Export it from the application instead.",
      );
    await copyText(text);
    message.value = `${kind === "path" ? "Path" : "Value"} copied.`;
    emit("copied", kind);
  } catch (error) {
    message.value = (error as Error).message;
    emit("copy-error", message.value);
  }
}
</script>
<template>
  <section class="h-json-viewer" :aria-label="label" part="base">
    <header>
      <strong>{{ label }}</strong>
      <div>
        <HButton size="compact" @click="copy('path')">Copy path</HButton
        ><HButton
          size="compact"
          :disabled="!node.copyable"
          @click="copy('value')"
          >Copy value</HButton
        >
      </div>
    </header>
    <div class="h-json-tree" :style="{ maxHeight }" part="viewport">
      <HTreeView
        :items="tree.items"
        v-model="selected"
        :default-expanded="['json:']"
        :label="label"
        @change="emit('select', tree.nodes.get($event)?.path || '')"
      />
    </div>
    <footer>
      <code>{{ node.path || "(root)" }}</code>
      <p v-if="tree.truncated">Display limited by depth or entry count.</p>
      <span role="status" aria-atomic="true">{{ message }}</span>
    </footer>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-json-viewer {
  min-width: 0;
  max-width: 100%;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  color: var(--h-text);
  background: var(--h-bg);
  font: var(--h-font-size)/1.6 var(--h-font);
  overflow: hidden;
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--h-gap);
  padding: var(--h-control-padding);
  border-bottom: 1px solid var(--h-border);
}
header > div {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.h-json-tree {
  overflow: auto;
  padding: 8px;
  overscroll-behavior: contain;
}
.h-json-tree :deep(button) {
  font-family: var(--h-font-mono);
  overflow-wrap: anywhere;
}
footer {
  padding: var(--h-control-padding);
  border-top: 1px solid var(--h-border);
  font-size: 12px;
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
footer code {
  font-family: var(--h-font-mono);
}
footer span {
  display: block;
}
</style>
