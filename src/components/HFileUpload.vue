<script setup lang="ts">
import {
  ref,
  watch,
  onMounted,
  onUpdated,
  onBeforeUnmount,
  useId,
  nextTick,
} from "vue";
import HButton from "./HButton.vue";
import HProgress from "./HProgress.vue";
import HIcon from "./HIcon.vue";
import type { FileRejection } from "../themes";
const props = withDefaults(
  defineProps<{
    label: string;
    name?: string;
    accept?: string;
    multiple?: boolean;
    required?: boolean;
    disabled?: boolean;
    formDisabled?: boolean;
    maxSize?: number;
    maxFiles?: number;
    modelValue?: File[];
    resetKey?: number;
    description?: string;
    error?: string;
    progress?: number;
  }>(),
  { accept: "", modelValue: () => [] },
);
const emit = defineEmits<{
  "update:modelValue": [files: File[]];
  change: [files: File[]];
  reject: [rejections: FileRejection[]];
  "control-sync": [];
}>();
const id = useId();
const input = ref<HTMLInputElement>();
const files = ref<File[]>([...props.modelValue]);
const errors = ref<string[]>([]);
const dragging = ref(false);
let form: HTMLFormElement | null = null;
function sync() {
  input.value?.setCustomValidity(errors.value[0] || "");
  emit("control-sync");
}
function assign(list: File[]) {
  if (!input.value) return;
  const transfer = new DataTransfer();
  for (const file of list) transfer.items.add(file);
  input.value.files = transfer.files;
  files.value = [...list];
}
function reset() {
  errors.value = [];
  files.value = [];
  if (input.value) input.value.value = "";
  emit("update:modelValue", []);
  sync();
}
function nativeReset() {
  queueMicrotask(reset);
}
onMounted(() => {
  assign(files.value);
  form = input.value?.form || null;
  form?.addEventListener("reset", nativeReset);
  sync();
});
onUpdated(sync);
onBeforeUnmount(() => form?.removeEventListener("reset", nativeReset));
watch(
  () => props.modelValue,
  (v) => {
    assign(v);
    errors.value = [];
  },
);
watch(() => props.resetKey, reset);
function accepted(file: File) {
  if (!props.accept.trim()) return true;
  return props.accept
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .some((rule) =>
      rule.startsWith(".")
        ? file.name.toLowerCase().endsWith(rule)
        : rule.endsWith("/*")
          ? file.type.toLowerCase().startsWith(rule.slice(0, -1))
          : file.type.toLowerCase() === rule,
    );
}
async function choose(list: File[]) {
  if (props.disabled || props.formDisabled || input.value?.matches(":disabled"))
    return;
  const rejects: FileRejection[] = [];
  const max = props.multiple
    ? Number.isFinite(props.maxFiles) && props.maxFiles! > 0
      ? Math.floor(props.maxFiles!)
      : Infinity
    : 1;
  for (const [index, file] of list.entries()) {
    if (index >= max)
      rejects.push({
        name: file.name,
        reason: `Choose at most ${max} file(s).`,
      });
    else if (!accepted(file))
      rejects.push({
        name: file.name,
        reason: "This file type is not accepted.",
      });
    else if (props.maxSize !== undefined && file.size > props.maxSize)
      rejects.push({
        name: file.name,
        reason: `File exceeds ${props.maxSize} bytes.`,
      });
  }
  errors.value = rejects.map((r) => `${r.name}: ${r.reason}`);
  assign(rejects.length ? [] : list);
  await nextTick();
  sync();
  emit("update:modelValue", [...files.value]);
  emit("change", [...files.value]);
  if (rejects.length) emit("reject", rejects);
}
async function remove(index: number) {
  assign(files.value.filter((_, i) => i !== index));
  errors.value = [];
  await nextTick();
  sync();
  emit("update:modelValue", [...files.value]);
  emit("change", [...files.value]);
}
</script>
<template>
  <fieldset
    class="h-file-upload"
    :disabled="disabled || formDisabled"
    part="base"
  >
    <label :for="id" part="label">{{ label }}</label>
    <div
      class="h-dropzone"
      :class="{ dragging }"
      part="dropzone"
      @dragover.prevent="dragging = true"
      @dragleave="dragging = false"
      @drop.prevent="
        dragging = false;
        choose(Array.from($event.dataTransfer?.files || []));
      "
    >
      <HIcon name="plus" :size="24" />
      <p>Drop files here, or choose files.</p>
      <input
        :id="id"
        ref="input"
        type="file"
        :name="name"
        :accept="accept"
        :multiple="multiple"
        :required="required"
        :aria-invalid="!!(error || errors.length)"
        :aria-describedby="`${id}-help`"
        part="control"
        @change="
          choose(Array.from(($event.target as HTMLInputElement).files || []))
        "
      />
    </div>
    <p
      :id="`${id}-help`"
      class="h-file-help"
      :class="{ error: error || errors.length }"
      :role="error || errors.length ? 'alert' : undefined"
    >
      {{
        error ||
        errors.join(" ") ||
        description ||
        "Files stay in your browser until your application uploads them."
      }}
    </p>
    <ul v-if="files.length" class="h-file-list" part="files">
      <li v-for="(file, index) in files" :key="`${index}-${file.name}`">
        <span
          >{{ file.name
          }}<small>{{ file.size.toLocaleString() }} bytes</small></span
        ><HButton
          variant="ghost"
          icon="close"
          icon-only
          :label="`Remove ${file.name}`"
          @click="remove(index)"
        />
      </li>
    </ul>
    <HProgress
      v-if="progress !== undefined"
      label="Upload progress"
      :value="progress"
    />
  </fieldset>
</template>
<style scoped>
@import "../styles/base.css";
.h-file-upload {
  border: 0;
  margin: 0;
  padding: 0;
  min-width: 0;
  color: var(--h-text);
  font-family: var(--h-font);
}
label {
  display: block;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}
.h-dropzone {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding: 25px 16px;
  border: 1px dashed var(--h-border-strong);
  border-radius: var(--h-radius-card);
  background: var(--h-bg);
}
.dragging,
.h-dropzone:focus-within {
  border-color: var(--h-accent);
  background: var(--h-accent-subtle);
}
.h-dropzone > .h-icon {
  color: var(--h-accent-text);
}
.h-dropzone p {
  font-size: 12px;
  color: var(--h-muted);
}
input {
  max-width: 100%;
  font-size: 12px;
  color: var(--h-muted);
}
input::file-selector-button {
  min-height: 40px;
  margin-right: 12px;
  padding: 8px 12px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
  color: var(--h-text);
  cursor: pointer;
}
.h-file-help {
  font-size: 11px;
  color: var(--h-muted);
  line-height: 1.8;
  margin-top: 8px;
  overflow-wrap: anywhere;
}
.error {
  color: var(--h-danger);
}
.h-file-list {
  list-style: none;
  padding: 0;
  margin: 15px 0;
}
.h-file-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--h-border);
  padding: 7px 0;
  font-size: 12px;
  overflow-wrap: anywhere;
}
small {
  display: block;
  font-size: 10px;
  color: var(--h-muted);
  margin-top: 3px;
}
fieldset:disabled {
  opacity: 0.55;
}
</style>
