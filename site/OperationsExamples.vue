<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from "vue";
import {
  HPageHeader,
  HButton,
  HHeatmap,
  HUptimeHistory,
  HMeter,
  HRange,
  HTagInput,
  HInlineCopyText,
  HAttachment,
  HFlow,
  HSpanTimeline,
  HTraceView,
  HMessageScroller,
  HMessage,
  HJsonViewer,
  HCodeDiff,
  HWaffleChart,
  HDonutChart,
  HWaterfallChart,
  HTimeSeriesChart,
  HBarChart,
  HStackedBarChart,
  HDialog,
  HCodeBlock,
  type FlowStage,
  type TraceItem,
  type TimeSeries,
  type ChartSlice,
  type DiffHunk,
} from "../src";
import HCard from "./TechnicalCard.vue";
const props = withDefaults(
  defineProps<{ embedded?: boolean; idPrefix?: string }>(),
  { idPrefix: "operations" },
);
const sectionId = (name: string) => `${props.idPrefix}-${name}`;
const tick = ref(0),
  storage = ref(76),
  tags = ref(["api.internal"]),
  formResult = ref(""),
  attachmentVisible = ref(true),
  preview = ref(false),
  artifact = ref(""),
  artifactSize = ref(0),
  selectedCell = ref(""),
  selectedFlow = ref(""),
  selectedSpan = ref(""),
  selectedSlice = ref("");
const cells = computed(() =>
  ["API", "Worker", "Cache"].flatMap((row, r) =>
    Array.from({ length: 6 }, (_, c) => ({
      id: `${r}-${c}`,
      row,
      column: `${9 + c}:00`,
      value:
        r === 2 && c === 2 ? null : (r * 17 + c * 13 + tick.value * 7) % 60,
    })),
  ),
);
const intervals = [
  { id: "a", label: "09:00–09:20", start: 0, end: 20, status: "up" as const },
  {
    id: "b",
    label: "09:20–09:30",
    start: 20,
    end: 30,
    status: "degraded" as const,
  },
  { id: "c", label: "09:35–10:00", start: 35, end: 60, status: "up" as const },
];
const flow: FlowStage[] = [
  {
    id: "fetch",
    label: "Fetch source",
    status: "success",
    description: "Repository snapshot",
  },
  {
    id: "checks",
    label: "Parallel checks",
    status: "running",
    parallel: [
      [
        { id: "test", label: "Unit tests", status: "success" },
        { id: "browser", label: "Browser checks", status: "running" },
      ],
      [
        { id: "types", label: "Type checks", status: "success" },
        { id: "audit", label: "Dependency audit", status: "success" },
      ],
    ],
  },
  { id: "deploy", label: "Deploy", status: "pending" },
];
const spans = [
  {
    id: "request",
    label: "GET /workspace",
    start: 0,
    end: 120,
    status: "success" as const,
  },
  {
    id: "cache",
    parentId: "request",
    label: "Cache lookup",
    start: 5,
    end: 20,
    status: "success" as const,
  },
  {
    id: "db",
    parentId: "request",
    label: "Database query",
    start: 20,
    end: 96,
    status: "success" as const,
  },
  {
    id: "render",
    parentId: "request",
    label: "Serialize response",
    start: 96,
    end: 120,
    status: "success" as const,
  },
];
const trace: TraceItem[] = [
  {
    id: "run",
    label: "Investigate workspace",
    status: "running",
    children: [
      {
        id: "search",
        label: "Search repository",
        status: "success",
        duration: 240,
        description: "Found matching configuration files.",
        details: "src/config.ts\nsrc/server.ts",
      },
      {
        id: "read",
        label: "Read configuration",
        status: "success",
        duration: 75,
      },
      {
        id: "check",
        label: "Validate changes",
        status: "running",
        children: [
          {
            id: "schema",
            label: "Schema validation",
            status: "success",
            duration: 22,
          },
          { id: "build", label: "Build verification", status: "pending" },
        ],
      },
    ],
  },
];
const messages = ref(
  Array.from({ length: 8 }, (_, i) => ({
    id: i,
    text: `Message ${i + 1}: ${i % 2 ? "The worker is healthy. The latest build completed successfully." : "Checking the workspace and its recent changes."}`,
  })),
);
let messageId = 8,
  olderId = -1;
function append() {
  messages.value.push({
    id: messageId++,
    text: "New message: the next diagnostic step is ready.",
  });
}
function prepend() {
  messages.value.unshift({
    id: olderId--,
    text: "Earlier history: the workspace was created and connected to its provider.",
  });
}
const payload = computed(() => ({
  requestId: "req_7c9a31f084b2",
  status: "ok",
  sample: tick.value,
  limits: { storage: storage.value, max: 100 },
  hosts: tags.value,
  metadata: { region: "local", cached: true },
}));
const hunks: DiffHunk[] = [
  {
    id: "config",
    header: "@@ -1,3 +1,3 @@",
    lines: [
      { kind: "context", oldLine: 1, newLine: 1, text: "server:" },
      { kind: "removed", oldLine: 2, text: "  retries: 2" },
      { kind: "added", newLine: 2, text: "  retries: 4" },
      { kind: "context", oldLine: 3, newLine: 3, text: "  timeout: 5000" },
    ],
  },
];
const slices: ChartSlice[] = [
  { id: "cached", label: "Cached", value: 72, tone: "success" },
  { id: "origin", label: "Origin", value: 23, tone: "info" },
  { id: "retry", label: "Retry", value: 5, tone: "warning" },
];
const series = computed<TimeSeries[]>(() => [
  {
    id: "api",
    label: "API",
    points: [
      { x: 0, y: 24 + tick.value, label: "09:00" },
      { x: 10, y: 32, label: "09:10" },
      { x: 20, y: null, label: "09:20" },
      { x: 30, y: 38 + tick.value, label: "09:30" },
      { x: 40, y: 29, label: "09:40" },
    ],
  },
  {
    id: "worker",
    label: "Worker",
    points: [
      { x: 0, y: 18 },
      { x: 10, y: 22 + tick.value },
      { x: 20, y: 30 },
      { x: 30, y: 20 },
      { x: 40, y: 25 },
    ],
  },
]);
const chartColumns = [
  { id: "a", label: "API", values: { read: 24, write: 12 } },
  { id: "b", label: "Worker", values: { read: 18, write: 28 } },
  { id: "c", label: "Cache", values: { read: 32, write: 8 } },
];
onMounted(() => {
  const file = new Blob(
    [JSON.stringify({ status: "passed", checks: 75 }, null, 2)],
    { type: "application/json" },
  );
  artifactSize.value = file.size;
  artifact.value = URL.createObjectURL(file);
});
onBeforeUnmount(() => {
  if (artifact.value) URL.revokeObjectURL(artifact.value);
});
function submit(event: SubmitEvent) {
  const data = new FormData(event.currentTarget as HTMLFormElement);
  formResult.value = `Saved ${data.getAll("hosts").join(", ")}`;
}
</script>
<template>
  <section
    class="operations-examples"
    :class="{ embedded }"
    aria-label="Operations and developer workspace"
  >
    <HPageHeader
      v-if="!embedded"
      title="See the system. Inspect the details."
      description="Native observability diagrams, workflow views, and technical controls built for real application data."
      eyebrow="Operations workspace"
      ><HButton href="#components">Component gallery</HButton
      ><HButton @click="tick++">Next sample</HButton></HPageHeader
    >
    <div v-if="embedded" class="operations-controls">
      <p>
        Explore the expanded toolkit with connected, application-owned sample
        data.
      </p>
      <HButton @click="tick++">Next sample</HButton>
    </div>
    <section
      class="operations-section"
      :aria-labelledby="sectionId('observability')"
    >
      <header class="operations-section-heading">
        <h2
          :id="sectionId('observability')"
          tabindex="-1"
          :data-technical-section="embedded ? '' : undefined"
        >
          Observability
        </h2>
        <p>Inspect activity, availability, quotas, and metrics over time.</p>
      </header>
      <div class="operations-grid">
        <HCard title="Activity across services" :components="['HHeatmap']"
          ><HHeatmap
            :cells="cells"
            label="Request activity"
            :selected="selectedCell"
            @select="selectedCell = $event"
        /></HCard>
        <HCard
          title="Service history"
          :components="['HUptimeHistory', 'HMeter']"
          ><HUptimeHistory
            label="API availability"
            :intervals="intervals"
            unit="minutes" />
          <p class="ops-note">The unrecorded five-minute gap stays unknown.</p>
          <HMeter
            label="Storage used"
            :value="storage"
            :max="100"
            :low="70"
            :high="90"
            :optimum="0"
            unit="GB" /><HRange v-model="storage" label="Adjust storage usage"
        /></HCard>
        <HCard
          class="ops-wide"
          title="Time, thresholds, and missing samples"
          :components="['HTimeSeriesChart']"
          ><HTimeSeriesChart
            :format-x="(value) => `09:${String(value).padStart(2, '0')}`"
            :series="series"
            label="Response latency"
            unit="ms"
            mode="area"
            :thresholds="[{ value: 50, label: 'SLO', tone: 'warning' }]"
            :markers="[{ x: 15, label: 'Deployment' }]"
        /></HCard>
      </div>
    </section>
    <section
      class="operations-section"
      :aria-labelledby="sectionId('workflows')"
    >
      <header class="operations-section-heading">
        <h2
          :id="sectionId('workflows')"
          tabindex="-1"
          :data-technical-section="embedded ? '' : undefined"
        >
          Workflows &amp; traces
        </h2>
        <p>
          Follow parallel work, inspect execution steps, and compare timing.
        </p>
      </header>
      <div class="operations-grid">
        <HCard
          class="ops-wide"
          title="Sequential work, parallel checks"
          :components="['HFlow']"
          ><HFlow
            label="Build workflow"
            :items="flow"
            :selected="selectedFlow"
            @select="selectedFlow = $event"
          />
          <p class="ops-note">
            {{
              selectedFlow
                ? `Selected stage: ${selectedFlow}`
                : "Select a stage to inspect its identity."
            }}
          </p></HCard
        >
        <HCard
          title="Where the request spent its time"
          :components="['HSpanTimeline']"
          ><HSpanTimeline
            label="Request timing"
            :spans="spans"
            :selected="selectedSpan"
            @select="selectedSpan = $event"
        /></HCard>
        <HCard title="Execution trace" :components="['HTraceView']"
          ><HTraceView
            label="Agent execution"
            :items="trace"
            :default-expanded="['run', 'check']"
        /></HCard>
      </div>
    </section>
    <section class="operations-section" :aria-labelledby="sectionId('data')">
      <header class="operations-section-heading">
        <h2
          :id="sectionId('data')"
          tabindex="-1"
          :data-technical-section="embedded ? '' : undefined"
        >
          Data &amp; artifacts
        </h2>
        <p>
          Read structured payloads, compare changes, manage files, and retain
          conversation context.
        </p>
      </header>
      <div class="operations-grid">
        <HCard title="Structured values" :components="['HJsonViewer']"
          ><HJsonViewer :value="payload" label="Response payload"
        /></HCard>
        <HCard title="Changes with context" :components="['HCodeDiff']"
          ><HCodeDiff :hunks="hunks" label="Configuration changes"
        /></HCard>
        <HCard
          title="Tags and artifacts"
          :components="['HTagInput', 'HInlineCopyText', 'HAttachment']"
          ><form aria-label="Allowed hosts" @submit.prevent="submit">
            <HTagInput
              v-model="tags"
              label="Allowed hosts"
              name="hosts"
              required
              :max-tags="5"
              :validate-value="
                (value) =>
                  /^[a-z0-9.-]+$/i.test(value) ||
                  'Use letters, digits, dots and hyphens.'
              "
            />
            <div class="ops-actions">
              <HButton type="submit" variant="primary">Save hosts</HButton
              ><HButton type="reset">Reset hosts</HButton>
            </div>
            <output role="status">{{ formResult }}</output>
          </form>
          <p class="ops-note">
            Request ID:
            <HInlineCopyText
              value="req_7c9a31f084b2"
              display="req_7c9a…84b2"
              label="request ID"
            />
          </p>
          <HAttachment
            v-if="attachmentVisible"
            name="build-report.json"
            :href="artifact"
            :size="artifactSize"
            state="done"
            removable
            @remove="attachmentVisible = false"
            @preview="preview = true"
          /><HButton v-else @click="attachmentVisible = true"
            >Restore artifact</HButton
          ></HCard
        >
        <HCard
          title="Read without losing your place"
          :components="['HMessageScroller', 'HMessage']"
          ><HMessageScroller label="Diagnostic conversation" max-height="300px"
            ><HMessage
              v-for="message in messages"
              :key="message.id"
              :data-message-id="message.id"
              :author="message.id % 2 ? 'Assistant' : 'User'"
              >{{ message.text }}</HMessage
            ></HMessageScroller
          >
          <div class="ops-actions">
            <HButton @click="append">Append message</HButton
            ><HButton @click="prepend">Load earlier messages</HButton
            ><HButton
              @click="
                messages.at(-1)!.text +=
                  ' More streamed output arrived with additional detail.'
              "
              >Grow last message</HButton
            >
          </div></HCard
        >
      </div>
    </section>
    <section class="operations-section" :aria-labelledby="sectionId('charts')">
      <header class="operations-section-heading">
        <h2
          :id="sectionId('charts')"
          tabindex="-1"
          :data-technical-section="embedded ? '' : undefined"
        >
          Chart variants
        </h2>
        <p>
          Compare composition, cumulative changes, groups, and distributions.
        </p>
      </header>
      <div class="operations-grid">
        <HCard title="Composition in units" :components="['HWaffleChart']"
          ><HWaffleChart
            :items="slices"
            label="Request allocation"
            :selected="selectedSlice"
            @select="selectedSlice = $event"
        /></HCard>
        <HCard title="Composition in a ring" :components="['HDonutChart']"
          ><HDonutChart
            :items="slices"
            label="Request mix"
            :selected="selectedSlice"
            @select="selectedSlice = $event"
        /></HCard>
        <HCard title="Changes add up" :components="['HWaterfallChart']"
          ><HWaterfallChart
            label="Monthly cost"
            unit="USD"
            :items="[
              { id: 'base', label: 'Base', value: 100, kind: 'total' },
              { id: 'compute', label: 'Compute', value: 45 },
              { id: 'credit', label: 'Credit', value: -20 },
              { id: 'total', label: 'Total', value: 125, kind: 'total' },
            ]"
        /></HCard>
        <HCard title="Compare groups" :components="['HBarChart']"
          ><HBarChart
            label="Operations by service"
            :columns="chartColumns"
            :series="[
              { id: 'read', label: 'Read' },
              { id: 'write', label: 'Write' },
            ]"
            orientation="horizontal"
            :height="240"
        /></HCard>
        <HCard title="Stacked amounts" :components="['HStackedBarChart']"
          ><HStackedBarChart
            label="Total operations"
            :columns="chartColumns"
            :series="[
              { id: 'read', label: 'Read' },
              { id: 'write', label: 'Write' },
            ]"
            mode="absolute"
        /></HCard>
        <HCard title="Latency buckets" :components="['HBarChart']"
          ><HBarChart
            label="Latency distribution"
            histogram
            :items="[
              { id: 'a', label: '0–25 ms', value: 8 },
              { id: 'b', label: '25–50 ms', value: 24 },
              { id: 'c', label: '50–75 ms', value: 12 },
              { id: 'd', label: '75–100 ms', value: 4 },
            ]"
        /></HCard>
      </div>
    </section>
    <HDialog
      :open="preview"
      title="Build report preview"
      @close="preview = false"
      ><HCodeBlock
        title="build-report.json"
        language="json"
        :code="JSON.stringify({ status: 'passed', checks: 75 }, null, 2)"
    /></HDialog>
  </section>
</template>
<style scoped>
.operations-examples {
  min-width: 0;
  padding-block: 32px 64px;
}
.operations-examples.embedded {
  padding: 0;
}
.embedded .operations-section-heading h2 {
  scroll-margin-top: 24px;
}
.operations-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 40px;
  padding: 16px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-surface);
}
.operations-controls p {
  margin: 0;
  color: var(--h-muted);
  font-size: 13px;
  line-height: 1.7;
  max-width: 65ch;
}
.operations-section {
  margin-top: 40px;
}
.operations-section-heading h2 {
  margin: 0;
  font-size: 22px;
  line-height: 1.5;
  font-weight: 550;
  scroll-margin-top: 100px;
  overflow-wrap: anywhere;
}
.operations-section-heading p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--h-muted);
  max-width: 72ch;
}
.operations-section-heading h2:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 5px;
}
.operations-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: start;
  gap: 24px;
  margin-top: 20px;
}
.ops-wide {
  grid-column: 1/-1;
}
.ops-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.ops-note,
output {
  display: block;
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
  margin-block: 14px;
  overflow-wrap: anywhere;
}
.operations-examples .h-meter {
  margin-top: 20px;
}
@media (max-width: 900px) {
  .operations-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
