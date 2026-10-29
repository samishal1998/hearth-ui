<script setup lang="ts">
import { computed } from "vue";
import HCodeBlock from "./HCodeBlock.vue";
import type { TerminalLine } from "../themes";
const props = withDefaults(
  defineProps<{
    lines: TerminalLine[];
    title?: string;
    maxLines?: number;
    maxHeight?: string;
    wrap?: boolean;
  }>(),
  {
    lines: () => [],
    title: "Terminal output",
    maxLines: 200,
    maxHeight: "360px",
  },
);
const emit = defineEmits<{ copied: []; "copy-error": [message: string] }>();
const visible = computed(() =>
  props.lines.slice(
    -Math.max(1, Math.min(2000, Math.floor(props.maxLines) || 200)),
  ),
);
const text = computed(() =>
  visible.value
    .map(
      (line) =>
        `${line.kind === "command" ? "$ " : line.kind === "error" ? "error: " : line.kind === "success" ? "success: " : ""}${line.text}`,
    )
    .join("\n"),
);
</script>
<template>
  <section class="h-terminal" :aria-label="title" part="base">
    <HCodeBlock
      :title="title"
      language="terminal"
      :code="text || 'No output yet.'"
      :copyable="visible.length > 0"
      :max-height="maxHeight"
      :wrap="wrap"
      @copied="emit('copied')"
      @copy-error="emit('copy-error', $event)"
    />
    <p v-if="lines.length > visible.length" part="summary">
      Showing the latest {{ visible.length }} of {{ lines.length }} lines.
    </p>
    <slot name="footer" />
  </section>
</template>
<style scoped>
.h-terminal {
  min-width: 0;
  max-width: 100%;
}
p {
  color: var(--h-muted);
  font: 12px/1.6 var(--h-font);
  margin: 8px 0 0;
}
</style>
