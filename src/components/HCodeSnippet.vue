<script setup lang="ts">
import { computed, ref, watch } from "vue";
import HTabs from "./HTabs.vue";
import HCodeBlock from "./HCodeBlock.vue";
import type { CodeSnippetOption } from "../themes";
const props = withDefaults(
  defineProps<{
    options: CodeSnippetOption[];
    modelValue?: string;
    label?: string;
    wrap?: boolean;
    lineNumbers?: boolean;
    maxHeight?: string;
  }>(),
  { options: () => [], label: "Code examples", maxHeight: "360px" },
);
const emit = defineEmits<{
  "update:modelValue": [id: string];
  change: [id: string];
  copied: [id: string];
  "copy-error": [message: string];
}>();
const local = ref(props.modelValue);
watch(
  () => props.modelValue,
  (value) => (local.value = value),
);
const tabs = computed(() =>
  props.options.map((option) => ({
    value: option.id,
    label: option.label,
    disabled: option.disabled,
  })),
);
function select(value: string) {
  local.value = value;
  emit("update:modelValue", value);
  emit("change", value);
}
</script>
<template>
  <div class="h-code-snippet" part="base">
    <HTabs
      v-if="options.length"
      :items="tabs"
      :model-value="local"
      :label="label"
      variant="underline"
      @update:model-value="select"
    >
      <template v-for="option in options" :key="option.id" #[option.id]>
        <HCodeBlock
          :code="option.code"
          :language="option.language"
          :title="option.filename || option.label"
          :wrap="wrap"
          :line-numbers="lineNumbers"
          :max-height="maxHeight"
          @copied="emit('copied', option.id)"
          @copy-error="emit('copy-error', $event)"
        />
      </template>
    </HTabs>
    <p v-else part="empty">No code examples available.</p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-code-snippet {
  min-width: 0;
  max-width: 100%;
  color: var(--h-text);
  font: var(--h-font-size)/1.6 var(--h-font);
}
.h-code-snippet :deep([role="tabpanel"]) {
  margin-top: 12px;
}
.h-code-snippet :deep(.h-code-block) {
  max-width: 100%;
}
p {
  color: var(--h-muted);
  padding: var(--h-card-padding);
  border: 1px dashed var(--h-border);
  border-radius: var(--h-radius-card);
}
</style>
