<script setup lang="ts">
import { computed, ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useMobileLayout } from "../mobile";
import HPagination from "./HPagination.vue";
import HSkeleton from "./HSkeleton.vue";
import HDropdownMenu from "./HDropdownMenu.vue";
import HIcon from "./HIcon.vue";
import {
  tableCellSlot,
  type TableRow,
  type TableColumn,
  type TableSort,
  type MenuAction,
} from "../themes";
const props = withDefaults(
  defineProps<{
    rows: TableRow[];
    mobileBreakpoint?: number;
    columns: TableColumn[];
    label?: string;
    caption?: string;
    loading?: boolean;
    emptyText?: string;
    selectable?: boolean;
    selected?: string[];
    disabledRows?: string[];
    sort?: TableSort;
    page?: number;
    pageSize?: number;
    manual?: boolean;
    total?: number;
    actions?: MenuAction[];
    stickyHeader?: boolean;
    stickyActions?: boolean;
    mobileLayout?: "cards" | "scroll";
    rowActions?: Record<string, MenuAction[]>;
    getRowActions?: (row: TableRow) => MenuAction[];
    rowActivatable?: boolean;
    actionDisplay?: "icon" | "label";
  }>(),
  {
    rows: () => [],
    columns: () => [],
    label: "Data table",
    emptyText: "No items to display.",
    selected: () => [],
    disabledRows: () => [],
    page: 1,
    pageSize: 10,
    actions: () => [],
    stickyActions: true,
    mobileLayout: "cards",
    actionDisplay: "icon",
  },
);
const emit = defineEmits<{
  "update:selected": [ids: string[]];
  "selection-change": [ids: string[]];
  "sort-change": [sort: TableSort];
  "update:page": [page: number];
  "page-change": [page: number];
  "row-action": [action: { id: string; action: string }];
  "row-activate": [row: TableRow];
}>();
defineSlots<{
  cell(props: {
    row: TableRow;
    column: TableColumn;
    value: TableRow[string];
  }): any;
  [name: string]: (props: any) => any;
}>();
const root = ref<HTMLElement>(),
  mobile = useMobileLayout(root, () => props.mobileBreakpoint),
  containerWidth = ref(Infinity);
let observer: ResizeObserver | undefined;
onMounted(() => {
  if (!root.value) return;
  containerWidth.value = root.value.clientWidth;
  observer = new ResizeObserver(
    (entries) => (containerWidth.value = entries[0].contentRect.width),
  );
  observer.observe(root.value);
});
onBeforeUnmount(() => observer?.disconnect());
const shownColumns = computed(() =>
  props.columns.filter(
    (column, index) =>
      index === 0 ||
      !column.hideBelow ||
      containerWidth.value >= column.hideBelow,
  ),
);
const cards = computed(() => mobile.value && props.mobileLayout === "cards");
const cellText = (value: unknown) =>
  value === null || value === undefined
    ? "—"
    : typeof value === "object" || typeof value === "function"
      ? "[Object]"
      : String(value);
const actionsFor = (row: TableRow) =>
  props.getRowActions?.(row) ?? props.rowActions?.[row.id] ?? props.actions;
const hasActions = computed(
  () => !!props.actions.length || !!props.getRowActions || !!props.rowActions,
);
function activate(row: TableRow, event?: MouseEvent) {
  if (!props.rowActivatable || props.disabledRows.includes(row.id)) return;
  if (
    event
      ?.composedPath()
      .some(
        (node) =>
          node instanceof HTMLElement &&
          node.matches(
            "button,a,input,select,textarea,label,summary,[contenteditable=true],[role=button],[role=checkbox],[role=switch]",
          ),
      )
  )
    return;
  emit("row-activate", row);
}
const localSelected = ref([...props.selected]);
const localSort = ref(props.sort);
const localPage = ref(props.page);
watch(
  () => props.selected,
  (v) => (localSelected.value = [...v]),
);
watch(
  () => props.sort,
  (v) => (localSort.value = v),
);
watch(
  () => props.page,
  (v) => (localPage.value = v),
);
const size = computed(() =>
  Number.isFinite(props.pageSize) && props.pageSize > 0
    ? Math.floor(props.pageSize)
    : 0,
);
const totalRows = computed(() =>
  props.manual ? (props.total ?? props.rows.length) : props.rows.length,
);
const current = computed(() =>
  Math.min(
    Math.max(1, Math.floor(localPage.value) || 1),
    size.value ? Math.max(1, Math.ceil(totalRows.value / size.value)) : 1,
  ),
);
// ponytail: client sorting works on the supplied rows; use manual mode and application-owned server queries for large datasets.
const sorted = computed(() => {
  if (props.manual || !localSort.value) return props.rows;
  const { key, direction } = localSort.value;
  return [...props.rows].sort((a, b) => {
    const x = a[key],
      y = b[key];
    const order =
      typeof x === "number" && typeof y === "number"
        ? x - y
        : cellText(x).localeCompare(cellText(y), undefined, {
            numeric: true,
            sensitivity: "base",
          });
    return direction === "ascending" ? order : -order;
  });
});
const visible = computed(() =>
  props.manual || !size.value
    ? sorted.value
    : sorted.value.slice(
        (current.value - 1) * size.value,
        current.value * size.value,
      ),
);
const selectableIds = computed(() =>
  visible.value
    .filter((r) => !props.disabledRows.includes(r.id))
    .map((r) => r.id),
);
const all = computed(
  () =>
    !!selectableIds.value.length &&
    selectableIds.value.every((id) => localSelected.value.includes(id)),
);
const some = computed(
  () =>
    !all.value &&
    selectableIds.value.some((id) => localSelected.value.includes(id)),
);
const colspan = computed(
  () =>
    shownColumns.value.length +
    Number(props.selectable) +
    Number(hasActions.value),
);
function select(ids: string[]) {
  localSelected.value = [...new Set(ids)];
  emit("update:selected", localSelected.value);
  emit("selection-change", localSelected.value);
}
function toggleRow(id: string, checked: boolean) {
  select(
    checked
      ? [...localSelected.value, id]
      : localSelected.value.filter((v) => v !== id),
  );
}
function toggleAll(checked: boolean) {
  select(
    checked
      ? [...localSelected.value, ...selectableIds.value]
      : localSelected.value.filter((id) => !selectableIds.value.includes(id)),
  );
}
function page(value: number) {
  localPage.value = value;
  emit("update:page", value);
  emit("page-change", value);
}
function sort(column: TableColumn) {
  if (!column.sortable || props.loading) return;
  localSort.value = {
    key: column.key,
    direction:
      localSort.value?.key === column.key &&
      localSort.value.direction === "ascending"
        ? "descending"
        : "ascending",
  };
  emit("sort-change", localSort.value);
  page(1);
}
watch(
  () => [props.rows.length, props.pageSize, props.total],
  () => {
    if (localPage.value !== current.value) page(current.value);
  },
);
</script>
<template>
  <section
    ref="root"
    class="h-data-table"
    :class="{ cards, 'sticky-actions': stickyActions }"
    :aria-busy="loading || undefined"
    part="base"
  >
    <div
      class="h-table-scroll"
      tabindex="0"
      role="region"
      :aria-label="label"
      part="viewport"
    >
      <table :aria-label="label" role="table">
        <caption v-if="caption">
          {{
            caption
          }}
        </caption>
        <thead :class="{ sticky: stickyHeader }">
          <tr role="row">
            <th
              v-if="selectable"
              class="h-table-select"
              scope="col"
              role="columnheader"
            >
              <label
                ><span class="h-sr-only">Select rows on this page</span
                ><input
                  type="checkbox"
                  :checked="all"
                  :indeterminate="some"
                  :disabled="loading || !selectableIds.length"
                  @change="
                    toggleAll(($event.target as HTMLInputElement).checked)
                  "
              /></label>
            </th>
            <th
              v-for="column in shownColumns"
              :key="column.key"
              scope="col"
              role="columnheader"
              :style="{
                width: column.width,
                minWidth: cards ? undefined : column.minWidth,
                textAlign: column.align || 'start',
              }"
              :aria-sort="
                localSort?.key === column.key ? localSort.direction : undefined
              "
              part="header-cell"
            >
              <button
                v-if="column.sortable"
                type="button"
                :disabled="loading"
                :aria-label="`Sort by ${column.label}`"
                @click="sort(column)"
              >
                {{ column.label
                }}<HIcon
                  :name="
                    localSort?.key === column.key &&
                    localSort.direction === 'ascending'
                      ? 'up'
                      : 'down'
                  "
                  :size="13"
                /></button
              ><template v-else>{{ column.label }}</template>
            </th>
            <th
              v-if="hasActions"
              class="h-table-actions"
              scope="col"
              role="columnheader"
            >
              <span class="h-sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td :colspan="Math.max(1, colspan)">
              <HSkeleton :lines="3" label="Loading table rows" />
            </td>
          </tr>
          <tr v-else-if="!visible.length">
            <td :colspan="Math.max(1, colspan)" class="h-table-empty">
              {{ emptyText }}
            </td>
          </tr>
          <tr
            v-for="row in loading ? [] : visible"
            :key="row.id"
            :class="{ selected: localSelected.includes(row.id) }"
            part="row"
            role="row"
            @click="activate(row, $event)"
          >
            <td v-if="selectable" class="h-table-select">
              <label
                ><span class="h-sr-only">Select {{ row.id }}</span
                ><input
                  type="checkbox"
                  :checked="localSelected.includes(row.id)"
                  :disabled="disabledRows.includes(row.id)"
                  @change="
                    toggleRow(
                      row.id,
                      ($event.target as HTMLInputElement).checked,
                    )
                  "
              /></label>
            </td>
            <td
              v-for="(column, columnIndex) in shownColumns"
              :class="{ 'h-table-title': columnIndex === 0 }"
              :key="column.key"
              :style="{
                textAlign: cards ? 'start' : column.align || 'start',
                minWidth: cards ? undefined : column.minWidth,
              }"
              role="cell"
              part="cell"
            >
              <span class="h-table-card-label" aria-hidden="true">{{
                column.label
              }}</span>
              <div
                class="h-table-cell-value"
                :title="column.truncate ? cellText(row[column.key]) : undefined"
                :class="{ truncate: column.truncate }"
                :style="{
                  '--h-cell-width': column.width || column.minWidth || '240px',
                }"
              >
                <slot :name="tableCellSlot(row.id, column.key)"
                  ><slot
                    name="cell"
                    :row="row"
                    :column="column"
                    :value="row[column.key]"
                    ><button
                      v-if="rowActivatable && columnIndex === 0"
                      type="button"
                      class="h-table-activate"
                      :disabled="disabledRows.includes(row.id)"
                      @click="emit('row-activate', row)"
                    >
                      {{
                        row[column.key] === undefined
                          ? row.id
                          : cellText(row[column.key])
                      }}</button
                    ><template v-else>{{
                      cellText(row[column.key])
                    }}</template></slot
                  ></slot
                >
              </div>
            </td>
            <td v-if="hasActions" class="h-table-actions" role="cell">
              <HDropdownMenu
                :icon-only="actionDisplay === 'icon'"
                v-if="actionsFor(row).length"
                :mobile-breakpoint="mobileBreakpoint"
                :items="actionsFor(row)"
                :label="`Actions for ${row.id}`"
                @select="emit('row-action', { id: row.id, action: $event })"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <footer v-if="size && totalRows > size" part="footer">
      <span>{{ totalRows }} items</span
      ><HPagination
        :model-value="current"
        :total="totalRows"
        :page-size="size"
        @update:model-value="page"
      />
    </footer>
  </section>
</template>
<style scoped>
@import "../styles/base.css";
.h-data-table {
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
  color: var(--h-text);
  font-family: var(--h-font);
  min-width: 0;
}
.h-table-scroll {
  position: relative;
  overflow: auto;
  max-height: var(--h-table-max-height, none);
  border-radius: inherit;
}
table {
  border-collapse: collapse;
  width: 100%;
  font-size: 12px;
}
caption {
  text-align: start;
  padding: 18px;
  font-size: 13px;
  color: var(--h-muted);
}
th,
td {
  padding: 13px 16px;
  text-align: start;
  line-height: 1.7;
  border-bottom: 1px solid var(--h-border);
  overflow-wrap: anywhere;
}
th {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  font-weight: 550;
  color: var(--h-muted);
  background: var(--h-raised);
  white-space: nowrap;
}
th button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 32px;
  border: 0;
  background: none;
  color: inherit;
  font-size: inherit;
  padding: 0;
  font-weight: inherit;
}
.sticky {
  position: sticky;
  top: 0;
  z-index: 1;
}
.h-table-select {
  width: 48px;
  padding: 0 8px;
}
.h-table-select label {
  display: grid;
  place-items: center;
  min-height: 44px;
  min-width: 40px;
  cursor: pointer;
}
.h-table-select input {
  width: 17px;
  height: 17px;
  accent-color: var(--h-accent);
  margin: 0;
}
.selected {
  background: var(--h-accent-subtle);
}
tbody tr:last-child td {
  border-bottom: 0;
}
.h-table-empty {
  height: 120px;
  text-align: center;
  color: var(--h-muted);
}
footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  flex-wrap: wrap;
  padding: 16px;
  border-top: 1px solid var(--h-border);
}
footer > span {
  font-size: max(var(--h-font-min-size, 12px), 11px);
  color: var(--h-muted);
}
.h-table-card-label {
  display: none;
}
.sticky-actions .h-table-actions {
  position: sticky;
  inset-inline-end: 0;
  z-index: 1;
  background: var(--h-raised);
  box-shadow: -1px 0 0 var(--h-border);
}
.h-table-cell-value.truncate {
  max-width: var(--h-cell-width);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.h-table-activate {
  background: none;
  border: 0;
  padding: 0;
  color: var(--h-accent-text);
  font: inherit;
  text-align: start;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.h-table-activate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.cards .h-table-scroll {
  overflow: visible;
}
.cards table,
.cards tbody {
  display: block;
  width: 100%;
}
.cards thead {
  display: block;
  padding: 12px;
}
.cards thead tr {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.cards thead th {
  display: block;
  padding: 4px 8px;
  width: auto !important;
  border: 0;
  background: none;
  white-space: normal;
}
.cards tbody tr {
  display: grid;
  margin: 12px;
  padding: 16px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  gap: 12px;
}
.cards td {
  display: block;
  padding: 0;
  border: 0;
  width: auto;
  min-width: 0;
}
.cards .h-table-select label {
  justify-content: start;
  place-items: start;
  min-height: 24px;
}
.cards .h-table-card-label {
  display: block;
  font-size: max(var(--h-font-min-size, 12px), 12px);
  color: var(--h-muted);
}
.cards .h-table-actions {
  position: static;
  box-shadow: none;
  background: none;
}
.cards .h-table-cell-value.truncate {
  max-width: 100%;
}
.cards td.h-table-title > .h-table-card-label {
  display: none;
}
.cards td.h-table-title .h-table-cell-value {
  font-size: 16px;
  font-weight: 550;
}
.cards .h-table-empty {
  height: auto;
  padding: 24px;
  text-align: center;
}
.cards th.h-table-actions {
  display: none;
}
</style>
