<script setup lang="ts">
import { ref, onBeforeUnmount, useId } from "vue";
import HButton from "./HButton.vue";
import { copyText } from "../clipboard";
defineProps<{
  label: string;
  value: string;
  secret?: boolean;
  disabled?: boolean;
}>();
const emit = defineEmits<{ copied: []; "copy-error": [message: string] }>();
const id = useId();
const input = ref<HTMLInputElement>();
const revealed = ref(false);
const copied = ref(false);
const error = ref("");
let timer: ReturnType<typeof setTimeout>;
async function copy(value: string) {
  error.value = "";
  try {
    await copyText(value);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied.value = false), 2000);
    emit("copied");
  } catch (e) {
    error.value = (e as Error).message;
    input.value?.focus();
    input.value?.select();
    emit("copy-error", error.value);
  }
}
onBeforeUnmount(() => clearTimeout(timer));
</script>
<template>
  <div class="h-copy-field" part="base">
    <label :for="id" part="label">{{ label }}</label>
    <div class="h-copy-row">
      <input
        :id="id"
        ref="input"
        :type="secret && !revealed ? 'password' : 'text'"
        :value="value"
        readonly
        :disabled="disabled"
        :aria-describedby="error ? `${id}-message` : undefined"
        part="value"
      /><HButton
        v-if="secret"
        variant="ghost"
        :label="revealed ? 'Hide value' : 'Reveal value'"
        :disabled="disabled"
        @click="revealed = !revealed"
        >{{ revealed ? "Hide" : "Reveal" }}</HButton
      ><HButton
        :icon="copied ? 'check' : 'copy'"
        :label="copied ? 'Copied' : `Copy ${label}`"
        :disabled="disabled"
        @click="copy(value)"
        >{{ copied ? "Copied" : "Copy" }}</HButton
      >
    </div>
    <p :id="`${id}-message`" role="status" :class="{ error }">
      {{ error || (copied ? "Copied to clipboard." : "") }}
    </p>
  </div>
</template>
<style scoped>
@import "../styles/base.css";
.h-copy-field {
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}
.h-copy-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 0;
}
input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: var(--h-control-height);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  color: var(--h-text);
  padding: 10px 12px;
  font: 12px var(--h-font-mono);
}
p {
  font-size: 11px;
  color: var(--h-muted);
  line-height: 1.7;
  margin-top: 6px;
}
.error {
  color: var(--h-danger);
}
</style>
