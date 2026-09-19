<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  nextTick,
  useId,
} from "vue";
import HDialog from "./HDialog.vue";
import HInput from "./HInput.vue";
import HIcon from "./HIcon.vue";
import type { CommandItem } from "../themes";
const props = withDefaults(
  defineProps<{
    open?: boolean;
    items: CommandItem[];
    label?: string;
    placeholder?: string;
    shortcut?: boolean;
  }>(),
  {
    items: () => [],
    label: "Command palette",
    placeholder: "Search commands…",
  },
);
const emit = defineEmits<{
  "update:open": [open: boolean];
  close: [];
  select: [id: string];
  search: [query: string];
}>();
const visible = ref(!!props.open);
watch(
  () => props.open,
  (v) => (visible.value = !!v),
);
const query = ref("");
const field = ref<InstanceType<typeof HInput>>();
const active = ref(-1);
const id = useId();
const filtered = computed(() =>
  props.items.filter((item) =>
    `${item.label} ${item.description || ""} ${item.group || ""} ${(item.keywords || []).join(" ")}`
      .toLowerCase()
      .includes(query.value.toLowerCase()),
  ),
);
watch(
  filtered,
  () => (active.value = filtered.value.findIndex((i) => !i.disabled)),
);
watch(query, (v) => emit("search", v));
async function opened() {
  if (!visible.value) return;
  query.value = "";
  active.value = filtered.value.findIndex((i) => !i.disabled);
  await nextTick();
  field.value?.$el.querySelector("input")?.focus();
}
watch(visible, opened, { flush: "post" });
onMounted(opened);
function setOpen(value: boolean) {
  if (visible.value === value) return;
  visible.value = value;
  emit("update:open", value);
  if (!value) emit("close");
}
function pick(item: CommandItem) {
  if (item.disabled) return;
  setOpen(false);
  emit("select", item.id);
}
function key(e: KeyboardEvent) {
  if (e.isComposing) return;
  const candidates = filtered.value.flatMap((v, i) => (v.disabled ? [] : [i]));
  if (["ArrowDown", "ArrowUp", "Home", "End"].includes(e.key)) {
    e.preventDefault();
    const at = candidates.indexOf(active.value);
    active.value =
      e.key === "Home"
        ? (candidates[0] ?? -1)
        : e.key === "End"
          ? (candidates.at(-1) ?? -1)
          : (candidates[
              (at + (e.key === "ArrowDown" ? 1 : -1) + candidates.length) %
                candidates.length
            ] ?? -1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    e.stopPropagation();
    const item = filtered.value[active.value];
    if (item) pick(item);
  }
}
function shortcut(e: KeyboardEvent) {
  if (
    props.shortcut &&
    (e.metaKey || e.ctrlKey) &&
    e.key.toLowerCase() === "k"
  ) {
    e.preventDefault();
    setOpen(!visible.value);
  }
}
onMounted(() => document.addEventListener("keydown", shortcut));
onBeforeUnmount(() => document.removeEventListener("keydown", shortcut));
</script>
<template>
  <HDialog
    :open="visible"
    :title="label"
    class="h-command"
    @close="setOpen(false)"
    ><HInput
      ref="field"
      v-model="query"
      label="Search commands"
      :placeholder="placeholder"
      role="combobox"
      aria-autocomplete="list"
      :aria-expanded="visible"
      :aria-controls="`${id}-list`"
      :aria-activedescendant="
        active >= 0 ? `${id}-option-${active}` : undefined
      "
      @keydown="key"
    />
    <div
      :id="`${id}-list`"
      class="h-command-list"
      role="listbox"
      :aria-label="label"
      part="list"
    >
      <template v-for="(item, i) in filtered" :key="item.id"
        ><p
          v-if="item.group && (i === 0 || filtered[i - 1].group !== item.group)"
          class="h-command-group"
          role="presentation"
        >
          {{ item.group }}
        </p>
        <button
          :id="`${id}-option-${i}`"
          type="button"
          role="option"
          :aria-selected="active === i"
          :disabled="item.disabled"
          tabindex="-1"
          part="option"
          @pointermove="active = i"
          @mousedown.prevent
          @click="pick(item)"
        >
          <HIcon v-if="item.icon" :name="item.icon" :size="18" /><span
            ><strong>{{ item.label }}</strong
            ><small v-if="item.description">{{ item.description }}</small></span
          ><kbd v-if="item.shortcut">{{ item.shortcut }}</kbd>
        </button></template
      >
      <p v-if="!filtered.length" class="h-command-empty" role="status">
        No matching commands.
      </p>
    </div></HDialog
  >
</template>
<style scoped>
@import "../styles/base.css";
.h-command-list {
  max-height: 350px;
  overflow: auto;
  margin-top: 16px;
}
.h-command-group {
  font-size: 10px;
  letter-spacing: 1px;
  color: var(--h-muted);
  text-transform: uppercase;
  margin: 14px 10px 6px;
}
[role="option"] {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 46px;
  width: 100%;
  padding: 11px 12px;
  border: 0;
  border-radius: var(--h-radius-control);
  background: none;
  color: var(--h-text);
  text-align: left;
}
[role="option"][aria-selected="true"],
[role="option"]:hover {
  background: var(--h-accent-subtle);
}
[role="option"]:disabled {
  opacity: 0.45;
}
strong {
  display: block;
  font-size: 13px;
  font-weight: 500;
}
small {
  display: block;
  font-size: 11px;
  line-height: 1.7;
  color: var(--h-muted);
  margin-top: 3px;
}
kbd {
  margin-left: auto;
  font: 10px var(--h-font-mono);
  color: var(--h-muted);
}
.h-command-empty {
  padding: 25px 12px;
  font-size: 13px;
  color: var(--h-muted);
}
</style>
