<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";
import HButton from "./HButton.vue";
import { copyText } from "../clipboard";
withDefaults(
  defineProps<{
    code: string;
    language?: string;
    title?: string;
    wrap?: boolean;
    lineNumbers?: boolean;
    copyable?: boolean;
  }>(),
  { language: "text", copyable: true },
);
const emit = defineEmits<{ copied: []; "copy-error": [message: string] }>();
const copied = ref(false);
const error = ref("");
let timer: ReturnType<typeof setTimeout>;
async function copy(code: string) {
  try {
    await copyText(code);
    error.value = "";
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 2000);
    emit("copied");
  } catch (e) {
    error.value = (e as Error).message;
    emit("copy-error", error.value);
  }
}
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <figure class="h-code-block" part="base">
    <figcaption part="header">
      <span>{{ title || language }}</span
      ><HButton
        v-if="copyable"
        size="compact"
        variant="ghost"
        :icon="copied ? 'check' : 'copy'"
        @click="copy(code)"
        >{{ copied ? "Copied" : "Copy code" }}</HButton
      >
    </figcaption>
    <pre
      tabindex="0"
      :aria-label="title || `${language} code`"
      :class="{ wrap, numbers: lineNumbers }"
      part="code"
    ><code><span v-for="(line,i) in code.split('\n')" :key="i" class="h-code-line" :data-line="i+1">{{line||'\u200b'}}</span></code></pre>
    <p v-if="error" role="status" class="h-code-error">{{ error }}</p>
    <span v-else class="h-sr-only" role="status">{{
      copied ? "Copied to clipboard." : ""
    }}</span>
  </figure>
</template>
<style scoped>
@import "../styles/base.css";
/* ponytail: plain escaped code keeps both builds small; add an opt-in highlighter when language highlighting is needed. */
.h-code-block {
  margin: 0;
  min-width: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  overflow: hidden;
  background: var(--h-bg);
  color: var(--h-text);
  font-family: var(--h-font);
}
figcaption {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 44px;
  padding: 5px 14px;
  background: var(--h-surface);
  border-bottom: 1px solid var(--h-border);
  font-size: 11px;
  color: var(--h-muted);
}
pre {
  margin: 0;
  max-height: var(--h-code-max-height, 360px);
  overflow: auto;
  padding: 18px;
  font: 12px/1.9 var(--h-font-mono);
  tab-size: 2;
  white-space: pre;
}
.h-code-line {
  display: block;
  min-height: 1.9em;
}
.numbers .h-code-line::before {
  content: attr(data-line);
  display: inline-block;
  width: 3em;
  margin-right: 1em;
  color: var(--h-faint);
  user-select: none;
  text-align: end;
}
.wrap {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.h-code-error {
  padding: 12px;
  font-size: 12px;
  color: var(--h-danger);
}
</style>
