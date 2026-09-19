<script setup lang="ts">
import { ref } from "vue";
import {
  HCard,
  HButton,
  HButtonBar,
  HPopover,
  HTooltip,
  HDropdownMenu,
  HToast,
  HToaster,
  HSheet,
  HDataTable,
  HDescriptionList,
  HList,
  HListItem,
  HChip,
  HChipGroup,
  HSegmentedControl,
  HFileUpload,
  HCodeBlock,
  HCommandPalette,
  HLogViewer,
  HCopyField,
  HConnectionState,
  HSparkline,
  HInput,
  HBadge,
  tableCellSlot,
  type ToastItem,
  type LogEntry,
  type MenuAction,
  type CommandItem,
} from "../src";
const emit = defineEmits<{ notice: [message: string] }>();
const sheet = ref(false);
const command = ref(false);
const selected = ref<string[]>([]);
const filters = ref(["media"]);
const view = ref("grid");
const files = ref<File[]>([]);
const progress = ref<number>();
const toastItems = ref<ToastItem[]>([]);
let nextId = 1;
const state = ref<"connecting" | "connected" | "failed">("failed");
const statusSlot = tableCellSlot("photos", "status");
const actions: MenuAction[] = [
  { id: "edit", label: "Edit application", icon: "settings" },
  { id: "refresh", label: "Refresh metadata", icon: "health" },
  { id: "copy", label: "Copy URL", icon: "copy" },
  {
    id: "remove",
    label: "Remove application",
    icon: "close",
    danger: true,
    separatorBefore: true,
  },
];
const rows = [
  { id: "photos", name: "Photo library", status: "Healthy", port: 2283 },
  { id: "media", name: "Media server", status: "Healthy", port: 8096 },
  { id: "notes", name: "Notes", status: "Unknown", port: 3000 },
  { id: "metrics", name: "Metrics", status: "Healthy", port: 9090 },
];
const columns = [
  { key: "name", label: "Application", sortable: true },
  { key: "status", label: "Status", sortable: true },
  { key: "port", label: "Port", sortable: true },
];
const commands: CommandItem[] = [
  {
    id: "apps",
    label: "Open applications",
    group: "Navigate",
    icon: "apps",
    keywords: ["services"],
  },
  {
    id: "settings",
    label: "Open settings",
    group: "Navigate",
    icon: "settings",
  },
  {
    id: "refresh",
    label: "Refresh providers",
    group: "Actions",
    icon: "providers",
  },
  {
    id: "locked",
    label: "Manage organization",
    disabled: true,
    group: "Actions",
  },
];
const logs = ref<LogEntry[]>([
  {
    id: "1",
    timestamp: "12:00:00",
    level: "info",
    message: "Provider connected.",
  },
  {
    id: "2",
    timestamp: "12:00:02",
    level: "warning",
    message: "One route is missing a public URL.",
  },
  {
    id: "3",
    timestamp: "12:00:04",
    level: "debug",
    message: "Reconciliation finished: 12 observations.",
  },
]);
function toast() {
  toastItems.value.push({
    id: String(nextId++),
    title: "Changes saved",
    description: "Your preferences are right where you left them.",
    tone: "success",
    actionLabel: "Undo",
  });
}
function dismiss(id: string) {
  toastItems.value = toastItems.value.filter((item) => item.id !== id);
}
async function retry() {
  state.value = "connecting";
  await new Promise((r) => setTimeout(r, 350));
  state.value = "connected";
}
</script>
<template>
  <section class="dashboard-examples" id="dashboard-components">
    <div class="dashboard-heading">
      <HBadge label="New in 0.4" tone="accent" />
      <h2>A working dashboard, down to the details.</h2>
      <p>
        Contextual actions, real data, and the small interactions that make an
        application feel complete.
      </p>
    </div>
    <div class="dashboard-example-grid">
      <HCard
        title="Actions, right where you need them."
        description="Anchored top-layer panels stay visible outside clipped containers."
        ><HButtonBar label="Overlay examples"
          ><HPopover label="Quick filters" title="Filter applications"
            ><HInput
              label="Name contains"
              placeholder="Photos, media…" /></HPopover
          ><HDropdownMenu
            label="Application actions"
            :items="actions"
            @select="emit('notice', `Action requested: ${$event}`)" /><HTooltip
            text="Fetch the latest application metadata"
            label="Metadata help"
        /></HButtonBar>
        <div class="spacer" />
        <HButtonBar
          ><HButton @click="sheet = true">Inspect provider</HButton
          ><HButton @click="command = true">Find a command</HButton></HButtonBar
        ></HCard
      ><HCard
        title="Good feedback, without the interruption."
        description="Notifications pause while hovered or focused. Application code owns dismissal."
        ><HToast
          title="A persistent notification"
          description="Use an action when there is something useful to do next."
          :duration="0"
          :dismissible="false"
          action-label="View details"
          @action="emit('notice', 'Notification action requested.')"
        />
        <div class="spacer" />
        <HButton variant="primary" @click="toast"
          >Show notification</HButton
        ></HCard
      ><HCard
        title="The view that works for you."
        description="Chips select filters; segmented controls choose one mode."
        ><div class="form-stack">
          <HChipGroup
            v-model="filters"
            label="App categories"
            :options="[
              { value: 'media', label: 'Media' },
              { value: 'home', label: 'Home' },
              { value: 'tools', label: 'Tools' },
            ]"
          /><HSegmentedControl
            v-model="view"
            label="Layout mode"
            :options="[
              { value: 'grid', label: 'Grid' },
              { value: 'list', label: 'List' },
            ]"
          /><HChip
            label="Removable tag"
            removable
            @remove="emit('notice', 'Remove action requested.')"
          />
          <p class="muted">
            {{ filters.join(", ") || "No filters" }} · {{ view }}
          </p>
        </div></HCard
      ><HCard
        title="Bring your own files."
        description="Selection stays local. Your application decides how and when to upload."
        ><form
          class="form-stack"
          @submit.prevent="progress = Math.min(100, (progress || 0) + 25)"
        >
          <HFileUpload
            v-model="files"
            label="Import files"
            name="files"
            accept=".json,.txt"
            multiple
            :max-size="1048576"
            :max-files="3"
            :progress="progress"
          /><HButton type="submit" :disabled="!files.length" variant="primary"
            >Simulate upload progress</HButton
          >
        </form></HCard
      >
    </div>
    <div class="dashboard-wide">
      <HDataTable
        :rows="rows"
        :columns="columns"
        label="Applications table"
        caption="A sortable, selectable application registry."
        selectable
        v-model:selected="selected"
        :page-size="3"
        :actions="actions"
        @row-action="emit('notice', `${$event.action}: ${$event.id}`)"
        ><template #[statusSlot]
          ><HBadge label="Healthy" tone="success" dot /></template
      ></HDataTable>
      <p class="muted">Selected rows: {{ selected.join(", ") || "none" }}</p>
    </div>
    <div class="dashboard-example-grid">
      <HCard title="Every detail has a place."
        ><HDescriptionList
          :columns="2"
          :items="[
            { key: 'version', label: 'Version', value: '1.0.0' },
            { key: 'source', label: 'Source', value: 'Docker' },
            { key: 'network', label: 'Network', value: 'homelab' },
            { key: 'updated', label: 'Updated', value: 'A moment ago' },
          ]" />
        <div class="spacer" />
        <HCopyField
          label="Service endpoint"
          value="https://photos.example.com" />
        <div class="spacer" />
        <HCopyField
          label="Example token"
          value="demo-token-not-a-secret"
          secret /></HCard
      ><HCard title="An overview you can read at a glance."
        ><HList label="Workspace services"
          ><HListItem
            title="Photo library"
            description="Memories, kept close."
            icon="apps"
            badge="Healthy"
            tone="success" /><HListItem
            title="Backup service"
            description="Waiting for its next scheduled run."
            icon="server"
            badge="Idle" /><HListItem
            title="Metrics"
            description="A short trend, not a full analytics engine."
            icon="health"
            ><template #trailing
              ><HSparkline
                :values="[2, 4, 3, 6, 4, 8, 7]"
                label="Requests across seven samples"
                :width="120"
                tone="info" /></template></HListItem
        ></HList>
        <div class="spacer" />
        <HConnectionState
          :state="state"
          label="Example provider"
          description="This connection is a UI demonstration."
          @retry="retry"
      /></HCard>
    </div>
    <div class="dashboard-wide">
      <HCodeBlock
        title="Start your stack"
        language="sh"
        :code="'docker compose up -d\ndocker compose logs --follow'"
        line-numbers
      /><HLogViewer :entries="logs" label="Demo provider logs" wrap /><HButton
        @click="
          logs.push({
            id: String(logs.length + 1),
            timestamp: '12:01:00',
            level: 'info',
            message: 'A new demo observation arrived.',
          })
        "
        >Append log entry</HButton
      >
    </div>
    <HSheet
      :open="sheet"
      title="Provider details"
      description="Inspect or edit without leaving the current view."
      @close="sheet = false"
      ><div class="form-stack">
        <HDescriptionList
          :items="[
            { key: 'type', label: 'Provider type', value: 'Docker' },
            { key: 'state', label: 'State', value: 'Connected' },
          ]"
        /><HInput label="Provider display name" value="My infrastructure" />
      </div>
      <template #footer
        ><HButtonBar align="end"
          ><HButton @click="sheet = false">Cancel</HButton
          ><HButton
            variant="primary"
            @click="
              sheet = false;
              toast();
            "
            >Save provider</HButton
          ></HButtonBar
        ></template
      ></HSheet
    ><HCommandPalette
      v-model:open="command"
      :items="commands"
      @select="emit('notice', `Command selected: ${$event}`)"
    /><HToaster
      :items="toastItems"
      @dismiss="dismiss"
      @action="
        dismiss($event);
        emit('notice', 'Undo requested in the demo.');
      "
    />
  </section>
</template>
<style scoped>
.dashboard-examples {
  margin-block: 65px;
}
.dashboard-heading {
  margin-bottom: 26px;
}
.dashboard-heading h2 {
  font-size: 28px;
  font-weight: 550;
  letter-spacing: -0.8px;
  margin: 14px 0 10px;
}
.dashboard-heading p {
  font-size: 13px;
  color: var(--h-muted);
  line-height: 1.8;
}
.dashboard-example-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}
.dashboard-wide {
  display: grid;
  gap: 20px;
  margin-block: 25px;
}
.dashboard-wide > .h-button {
  justify-self: start;
}
@media (max-width: 850px) {
  .dashboard-example-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 500px) {
  .dashboard-heading h2 {
    font-size: 24px;
  }
}
</style>
