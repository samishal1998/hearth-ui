<script setup lang="ts">
import { ref, computed } from "vue";
import {
  HStack,
  HGrid,
  HHeading,
  HText,
  HSurface,
  HFilterBar,
  HInput,
  HChipGroup,
  HDataTable,
  HBadge,
  HButton,
  HPane,
  HMessage,
  HCodeBlock,
  HTextarea,
  HDashboardShell,
  HList,
  HListItem,
  HListSpacer,
  HCheckbox,
  HDescriptionList,
  HAccordion,
  HConnectionState,
  HStatCard,
  HCollapsible,
  HToggleGroup,
  HListbox,
  HContextMenu,
  HVirtualList,
  HTreeView,
  HResizablePane,
  HAlertDialog,
  HTooltip,
  type TableRow,
  type TableColumn,
  type MenuAction,
} from "../src";
const query = ref(""),
  filters = ref<string[]>([]),
  selection = ref<string[]>([]),
  inspector = ref(false),
  current = ref(""),
  draft = ref(""),
  sent = ref(""),
  confirm = ref(false),
  width = ref(320),
  resource = ref("photos"),
  toggles = ref<string[]>(["recent"]);
const rows = ref<TableRow[]>([
  {
    id: "photos",
    name: "Photo library",
    provider: "Docker",
    status: "Healthy",
    updated: "A moment ago",
  },
  {
    id: "media",
    name: "Media server",
    provider: "Docker",
    status: "Offline",
    updated: "An hour ago",
  },
  {
    id: "notes",
    name: "Notes",
    provider: "Manual",
    status: "Healthy",
    updated: "Yesterday",
  },
]);
const shown = computed(() =>
  rows.value.filter(
    (row) =>
      String(row.name).toLowerCase().includes(query.value.toLowerCase()) &&
      (!filters.value.length || filters.value.includes(String(row.status))),
  ),
);
const columns: TableColumn[] = [
  { key: "name", label: "Resource", sortable: true, minWidth: "180px" },
  { key: "status", label: "State", sortable: true },
  { key: "provider", label: "Provider", hideBelow: 600 },
  {
    key: "updated",
    label: "Updated",
    minWidth: "140px",
    truncate: true,
    hideBelow: 520,
  },
];
const actions: Record<string, MenuAction[]> = {
  photos: [
    { id: "inspect", label: "Inspect resource" },
    { id: "remove", label: "Remove resource", danger: true },
  ],
  media: [
    { id: "inspect", label: "Inspect resource" },
    { id: "remove", label: "Remove resource", danger: true, disabled: true },
  ],
  notes: [{ id: "inspect", label: "Inspect resource" }],
};
function inspect(row: TableRow) {
  current.value = String(row.name);
  inspector.value = true;
}
function act(value: { id: string; action: string }) {
  if (value.action === "remove") confirm.value = true;
  else {
    const row = rows.value.find((row) => row.id === value.id);
    if (row) inspect(row);
  }
}
const virtual = Array.from({ length: 2000 }, (_, index) => ({
  id: `event-${index}`,
  label: `Observation ${index + 1}`,
  description: "Rendered through a bounded list window.",
}));
</script>
<template>
  <section
    class="workspace-examples"
    aria-label="Composable workspace examples"
  >
    <HStack :gap="5"
      ><HHeading>From primitives to a workspace.</HHeading
      ><HText as="p" tone="muted"
        >A filter toolbar, selectable registry, and persistent transcript
        inspector built through public APIs.</HText
      ><HFilterBar
        :active-count="Number(!!query) + filters.length"
        label="Resource filters"
        @clear="
          query = '';
          filters = [];
        "
        ><HInput
          v-model="query"
          label="Search composed resources"
          type="search"
          hide-label
          leading-icon="search"
          size="compact" /><HChipGroup
          v-model="filters"
          label="Resource states"
          :options="[
            { value: 'Healthy', label: 'Healthy', count: 2, icon: 'check' },
            { value: 'Offline', label: 'Offline', count: 1, icon: 'server' },
          ]"
      /></HFilterBar>
      <div class="workspace-demo">
        <HDashboardShell
          brand="homestead"
          :items="[{ id: 'resources', label: 'Resources', icon: 'apps' }]"
          active="resources"
          page-title="Resource workspace"
          navigation-label=""
          :show-workspace="false"
          inner-scroll
          content-tag="div"
          ><template #page-title
            ><HHeading :level="3" size="sm"
              >Resource workspace</HHeading
            ></template
          ><template #header-actions
            ><HButton
              size="compact"
              @click="
                current = 'New session';
                inspector = true;
              "
              >Open session inspector</HButton
            ></template
          ><HDataTable
            :rows="shown"
            :columns="columns"
            label="Composed resource registry"
            selectable
            v-model:selected="selection"
            :row-actions="actions"
            row-activatable
            sticky-header
            @row-activate="inspect"
            @row-action="act"
            ><template #cell="{ row, column, value }"
              ><HButton
                v-if="column.key === 'name'"
                variant="ghost"
                @click="inspect(row)"
                >{{ value }}</HButton
              ><HBadge
                v-else-if="column.key === 'status'"
                :label="String(value)"
                :tone="value === 'Healthy' ? 'success' : 'neutral'"
                :variant="value === 'Offline' ? 'dashed' : 'soft'"
              /><template v-else>{{ value }}</template></template
            ></HDataTable
          ><HText as="p" tone="muted">{{ selection.length }} selected</HText
          ><template #sidebar-footer
            ><HInput
              label="Persistent sidebar note"
              placeholder="State stays while resizing…"
              hide-label
              size="compact" /></template
          ><template #side-pane
            ><HPane
              v-model:open="inspector"
              title="Session inspector"
              :description="current"
              ><HStack :gap="4"
                ><HMessage role-label="User" timestamp="12:00 UTC"
                  ><p>How is my workspace doing?</p></HMessage
                ><HMessage role-label="Assistant" timestamp="12:01 UTC"
                  ><p>Two resources are healthy; one needs attention.</p>
                  <HCodeBlock
                    code="docker compose ps"
                    bare
                    :copyable="false"
                    max-height="120px" /></HMessage
                ><HMessage v-if="sent" role-label="User"
                  ><p>{{ sent }}</p></HMessage
                ><HTextarea
                  v-model="draft"
                  label="Compose session message"
                  placeholder="Enter to send; Shift+Enter for a newline"
                  :rows="3"
                  submit-on-enter
                  @submit="
                    sent = $event;
                    draft = '';
                  " /></HStack
              ><template #footer
                ><HButton
                  :disabled="!draft.trim()"
                  variant="primary"
                  @click="
                    sent = draft;
                    draft = '';
                  "
                  >Send session message</HButton
                ></template
              ></HPane
            ></template
          ></HDashboardShell
        >
      </div>
      <HGrid min-column-width="280px"
        ><HSurface
          ><HHeading size="sm">Rich list composition</HHeading
          ><HList label="Composed sessions"
            ><HListItem
              title="Inspect a session"
              interactive
              aria-label="Open inspection session"
              @activate="
                current = 'Inspection';
                inspector = true;
              "
              ><template #before
                ><HCheckbox
                  label="Select inspection session"
                  hide-label
                  size="compact" /></template
              ><template #description
                ><HText tone="muted" size="sm"
                  >Local session ·
                  <HBadge
                    label="Running"
                    tone="success"
                    icon="check" /></HText></template
              ><template #badge
                ><HBadge
                  label="Last known"
                  variant="dashed" /></template></HListItem
            ><HListSpacer /><HListItem
              title="Archived session"
              description="Presentation and actions are independently composable." /></HList></HSurface
        ><HSurface
          ><HHeading size="sm">Dense metadata</HHeading
          ><HDescriptionList
            dense
            variant="inline"
            columns="auto"
            :items="[
              { key: 'provider', label: 'Provider', value: 'Docker' },
              { key: 'state', label: 'State', value: 'Healthy' },
            ]"
            ><template #value:state
              ><HBadge
                label="Healthy"
                tone="success" /></template></HDescriptionList
          ><HConnectionState
            state="connected"
            label="Docker provider"
            :show-state="false"
            :retryable="false"
            ><template #detail
              ><HText as="p" size="sm" tone="muted"
                >Connected to the local workspace.</HText
              ></template
            ></HConnectionState
          ><HStatCard label="Resources" :value="3"
            ><template #detail
              ><HBadge
                label="2 healthy"
                tone="success" /></template></HStatCard></HSurface
        ><HSurface
          ><HHeading size="sm">Disclosure and selection</HHeading
          ><HAccordion
            compact
            variant="flat"
            :items="[
              { id: 'history', title: 'Observations', defaultOpen: true },
              { id: 'settings', title: 'Settings' },
            ]"
            ><template #header:history
              ><HStack direction="row" :gap="2" align="center"
                ><span>Observations</span
                ><HBadge label="3" /></HStack></template
            ><template #history
              ><p>Recent observations remain application-owned.</p></template
            ></HAccordion
          ><HCollapsible label="Raw configuration"
            ><HCodeBlock
              code="provider: local"
              bare
              :copyable="false" /></HCollapsible
          ><HToggleGroup
            v-model="toggles"
            label="Observation view"
            :options="[
              { value: 'recent', label: 'Recent' },
              { value: 'all', label: 'All' },
            ]" /></HSurface></HGrid
      ><HGrid min-column-width="280px"
        ><HSurface
          ><HListbox
            v-model="resource"
            label="Composed resource choices"
            :options="[
              { value: 'photos', label: 'Photo library' },
              { value: 'media', label: 'Media server' },
              { value: 'private', label: 'Restricted', disabled: true },
            ]" /></HSurface
        ><HSurface
          ><HTreeView
            label="Workspace tree"
            :items="[
              {
                id: 'workspace',
                label: 'Workspace',
                children: [
                  { id: 'photos', label: 'Photo library' },
                  { id: 'media', label: 'Media server' },
                ],
              },
            ]"
            :default-expanded="['workspace']" /></HSurface
        ><HSurface
          ><HVirtualList
            :items="virtual"
            label="Windowed observations"
            :height="240"
            :row-height="56" /></HSurface></HGrid
      ><HResizablePane v-model="width"
        ><HContextMenu
          label="Composed contextual actions"
          :items="[
            { id: 'inspect', label: 'Inspect' },
            { id: 'remove', label: 'Remove', danger: true },
          ]"
          @select="
            current = $event;
            inspector = true;
          "
          ><HSurface
            >Right-click or use the action button to inspect this
            block.</HSurface
          ></HContextMenu
        ><HTooltip
          text="Removal is unavailable until the resource stops."
          label="Why removal is disabled"
          focusable
          ><HButton disabled>Unavailable action</HButton></HTooltip
        ><template #pane
          ><HSurface
            ><HHeading size="sm">Resizable inspector</HHeading
            ><HDescriptionList
              dense
              variant="inline"
              :items="[
                { key: 'width', label: 'Width', value: `${width}px` },
                {
                  key: 'mode',
                  label: 'Interaction',
                  value: 'Drag, arrows, or buttons',
                },
              ]" /></HSurface></template></HResizablePane
      ><HAlertDialog
        v-model:open="confirm"
        title="Remove this resource?"
        description="This is a UI preview; no backend changes occur."
        danger
        @confirm="confirm = false"
    /></HStack>
  </section>
</template>
<style scoped>
.workspace-examples {
  margin-block: 40px;
}
.workspace-demo {
  height: 620px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  overflow: hidden;
}
.workspace-demo :deep(.h-dashboard) {
  height: 620px;
  min-height: 0;
}
.workspace-demo :deep(.h-sidebar) {
  height: 620px;
}
.workspace-demo :deep(.h-shell-footer) {
  display: none;
}
.workspace-demo :deep(.h-workspace) {
  margin-top: 12px;
}
</style>
