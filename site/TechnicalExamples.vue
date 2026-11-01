<script setup lang="ts">
import { computed, ref, reactive, onMounted, onBeforeUnmount } from "vue";
import {
  HPageHeader,
  HButton,
  HBadge,
  HCodeSnippet,
  HPackageInstall,
  HTerminal,
  HKeyboardKey,
  HWaveform,
  HStackedWaveform,
  HBarChart,
  HDivergingBarChart,
  HStackedBarChart,
  HDataTable,
  HCollapsible,
  HDropdownMenu,
  HRange,
  HSwitch,
  type ChartColumn,
} from "../src";
import HCard from "./TechnicalCard.vue";
import OperationsExamples from "./OperationsExamples.vue";
const root = ref<HTMLElement>();
const sections = [
  { id: "technical-code", label: "Code & installation" },
  { id: "technical-signals", label: "Signals & amounts" },
  { id: "technical-observability", label: "Observability" },
  { id: "technical-workflows", label: "Workflows & traces" },
  { id: "technical-data", label: "Data & artifacts" },
  { id: "technical-charts", label: "Chart variants" },
  { id: "technical-interactions", label: "Interaction lab" },
];
const activeSection = ref(sections[0].id);
function jump(id: string) {
  const heading = root.value?.querySelector<HTMLElement>(`#${id}`);
  if (!heading) return;
  activeSection.value = id;
  heading.scrollIntoView({ block: "start", behavior: "instant" });
  heading.focus({ preventScroll: true });
}
let observer: IntersectionObserver | undefined;
onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activeSection.value = visible[0].target.id;
    },
    { rootMargin: "-80px 0px -65% 0px" },
  );
  root.value
    ?.querySelectorAll("h2[data-technical-section]")
    .forEach((heading) => observer!.observe(heading));
});
onBeforeUnmount(() => observer?.disconnect());
const selected = reactive({
  amounts: "",
  changes: "",
  duration: "",
  outcomes: "",
});
const signal = ref(false),
  volume = ref(45),
  busy = ref(false),
  stress = ref(false),
  lastAction = ref("");
const sample = ref(0);
const columns = ref<ChartColumn[]>(
  Array.from({ length: 8 }, (_, i) => ({
    id: String(i),
    label: `${String(i + 9).padStart(2, "0")}:00`,
    values: { success: 70 + i * 3, retry: 20 - i, error: 10 - i },
  })),
);
const durations = computed(() =>
  columns.value.map((column, i) => ({
    id: column.id,
    label: column.label,
    value: 18 + ((i * 13 + sample.value * 7) % 44),
  })),
);
const changes = computed(() =>
  Array.from({ length: 16 }, (_, i) => ({
    id: `change-${i}`,
    label: `Interval ${i + 1}`,
    value: ((i * 37 + sample.value * 13) % 181) - 90,
  })),
);
const stackedAmounts = computed(() =>
  Array.from({ length: 36 }, (_, i) => ({
    id: `amount-${i}`,
    label: `Sample ${i + 1}`,
    segments: [
      {
        id: "green",
        label: "Green",
        value: i < 3 ? [1, 2, 5][i] : 1 + ((i + sample.value) % 6),
        tone: "success" as const,
      },
      {
        id: "red",
        label: "Red",
        value: i < 3 ? [10, 12, 12][i] : 4 + ((i * 3 + sample.value) % 12),
        tone: "danger" as const,
      },
      {
        id: "last",
        label: i === 2 ? "Green" : "Blue",
        value: i < 3 ? [5, 7, 12][i] : 2 + ((i * 5 + sample.value) % 8),
        tone: i === 2 ? ("success" as const) : ("info" as const),
      },
    ],
  })),
);
function next() {
  sample.value++;
  const i = sample.value + 7;
  columns.value = [
    ...columns.value.slice(1),
    {
      id: String(i),
      label: `${String((i + 9) % 24).padStart(2, "0")}:00`,
      values: {
        success: 65 + (i % 4) * 7,
        retry: 25 - (i % 4) * 4,
        error: 10 - (i % 4) * 3,
      },
    },
  ];
}
const options = [
  {
    id: "curl",
    label: "cURL",
    filename: "Request",
    language: "sh",
    code: "curl --request GET \\\n  https://api.example.com/v1/status",
  },
  {
    id: "js",
    label: "JavaScript",
    filename: "status.ts",
    language: "ts",
    code: 'const response = await fetch("/api/status");\nconst status = await response.json();\nconsole.log(status);',
  },
  {
    id: "python",
    label: "Python",
    filename: "status.py",
    language: "py",
    code: 'from urllib.request import urlopen\n\nwith urlopen("https://api.example.com/status") as response:\n    print(response.read().decode())',
  },
];
const rows = computed(() => [
  {
    id: "api",
    service: "API gateway",
    endpoint: stress.value
      ? "https://example.com/" + "very-long-unbroken-resource-name".repeat(18)
      : "https://api.example.com",
    state: "Healthy",
  },
  {
    id: "worker",
    service: stress.value
      ? "Background processing service with an unusually descriptive and lengthy display name"
      : "Worker",
    endpoint: "worker.internal:8080",
    state: "Ready",
  },
]);
</script>
<template>
  <section
    ref="root"
    class="technical-examples"
    aria-label="Developer and diagram examples"
  >
    <HPageHeader
      title="Tools for technical interfaces."
      description="Interactive examples for code, diagrams, workflows, and data tools, with links to every API."
      eyebrow="Developer playground"
      ><HButton href="#components">Component gallery</HButton></HPageHeader
    >
    <nav class="technical-nav" aria-label="Technical sections">
      <button
        v-for="section in sections"
        :key="section.id"
        type="button"
        :aria-current="activeSection === section.id ? 'location' : undefined"
        @click="jump(section.id)"
      >
        {{ section.label }}
      </button>
    </nav>
    <div class="technical-meta">
      <HBadge label="Vue + Elements" /><HBadge label="Local examples" /><span
        >Open the API links for props and events.</span
      >
    </div>
    <section class="technical-section" aria-labelledby="technical-code">
      <header class="technical-section-heading">
        <h2 id="technical-code" data-technical-section tabindex="-1">
          Code &amp; installation
        </h2>
        <p>
          Switch frameworks, copy the active example, and inspect command
          output.
        </p>
      </header>
      <div class="technical-grid technical-code-grid">
        <HCard
          title="One example. Several ways in."
          description="Arrow keys switch between examples. Copy uses the active tab."
          :components="['HCodeSnippet']"
          ><HCodeSnippet
            :options="options"
            label="API request language"
            line-numbers
        /></HCard>
        <HCard title="Install in your stack" :components="['HPackageInstall']"
          ><HPackageInstall :packages="['@hearth-ui/vue', 'vue']" />
          <p class="technical-note">
            Native Vue and standalone web components share the same source.
          </p></HCard
        ><HCard title="Terminal transcript" :components="['HTerminal']"
          ><HTerminal
            :lines="[
              { id: '1', kind: 'command', text: 'npm run build' },
              { id: '2', kind: 'output', text: 'Compiling components…' },
              { id: '3', kind: 'success', text: 'Build complete in 824ms' },
            ]"
        /></HCard>
      </div>
    </section>
    <section class="technical-section" aria-labelledby="technical-signals">
      <header class="technical-section-heading">
        <h2 id="technical-signals" data-technical-section tabindex="-1">
          Signals &amp; amounts
        </h2>
        <p>
          Compare amounts, signed percentages, and changing time intervals. Each
          chart keeps its own selection.
        </p>
      </header>
      <div class="technical-grid">
        <HCard
          title="Amounts, stacked like a waveform"
          :components="['HStackedWaveform']"
          ><HStackedWaveform
            :columns="stackedAmounts"
            label="Amount composition"
            description="Each pillar is a stack of amounts, separated by 0.5px gaps. The first three totals are 16, 21, and 29."
            :selected="selected.amounts"
            @select="selected.amounts = $event"
          /><HButton @click="next">Update amounts</HButton></HCard
        >
        <HCard
          title="Signals and change"
          :components="['HWaveform', 'HDivergingBarChart']"
          ><HWaveform v-model:active="signal" label="Microphone activity" />
          <p class="technical-note">
            Illustrative motion. Pause at any time; reduced-motion settings keep
            the bars still.
          </p>
          <div class="technical-signed">
            <HDivergingBarChart
              :items="changes"
              label="Throughput change"
              description="Slim bars, a centered zero, and a fixed ±100% scale."
              :selected="selected.changes"
              @select="selected.changes = $event"
            /><HButton @click="next">Update changes</HButton>
          </div></HCard
        >
        <HCard title="Build duration" :components="['HBarChart']"
          ><HBarChart
            :items="durations"
            label="Duration by interval"
            unit="s"
            :selected="selected.duration"
            @select="selected.duration = $event"
        /></HCard>
        <HCard title="Outcomes over time" :components="['HStackedBarChart']"
          ><HStackedBarChart
            :columns="columns"
            :series="[
              { id: 'success', label: 'Success', tone: 'success' },
              { id: 'retry', label: 'Retry', tone: 'warning' },
              { id: 'error', label: 'Error', tone: 'danger' },
            ]"
            label="Request outcomes"
            :selected="selected.outcomes"
            @select="selected.outcomes = $event"
          /><HButton @click="next">Next interval</HButton></HCard
        >
      </div>
    </section>
    <OperationsExamples embedded id-prefix="technical" />
    <section class="technical-section" aria-labelledby="technical-interactions">
      <header class="technical-section-heading">
        <h2 id="technical-interactions" data-technical-section tabindex="-1">
          Interaction lab
        </h2>
        <p>
          Try loading, keyboard shortcuts, menus, disclosures, and deliberately
          awkward content.
        </p>
      </header>
      <div class="technical-grid">
        <HCard
          title="Small details"
          :components="[
            'HButton',
            'HKeyboardKey',
            'HRange',
            'HDropdownMenu',
            'HCollapsible',
          ]"
          @keydown.ctrl.enter.prevent="busy = true"
        >
          <div class="technical-stack">
            <div class="technical-actions">
              <HButton variant="primary" :loading="busy" @click="busy = true"
                >Run build</HButton
              ><HButton @click="busy = false">Reset state</HButton
              ><HKeyboardKey
                :keys="['Ctrl', 'Enter']"
                label="Control plus Enter"
              />
            </div>
            <p class="technical-note">
              Ctrl+Enter also activates the local loading-state example while
              focus is in this card.
            </p>
            <HRange v-model="volume" label="Output level" />
            <HDropdownMenu
              label="Workspace actions"
              :items="[
                { id: 'copy', label: 'Copy endpoint' },
                { id: 'logs', label: 'View logs' },
                { id: 'remove', label: 'Remove workspace', danger: true },
              ]"
              @select="lastAction = $event"
            />
            <output class="technical-event" role="status" aria-atomic="true">{{
              lastAction ? `Selected action: ${lastAction}` : ""
            }}</output>
            <HCollapsible label="Connection details"
              ><p>
                The native disclosure opens and closes without remounting its
                content. Press Enter or Space on its trigger.
              </p></HCollapsible
            >
          </div>
        </HCard>
        <HCard
          class="technical-table"
          title="Content should fit the layout."
          :components="['HDataTable', 'HSwitch']"
          ><HSwitch
            v-model="stress"
            label="Stress test long content" /><HDataTable
            :rows="rows"
            :columns="[
              { key: 'service', label: 'Service', sortable: true },
              { key: 'endpoint', label: 'Endpoint' },
              { key: 'state', label: 'State', width: '100px' },
            ]"
            :actions="[{ id: 'inspect', label: 'Inspect service' }]"
            label="Service endpoints"
        /></HCard>
      </div>
    </section>
  </section>
</template>
<style scoped>
:global(html:has(.technical-examples)) {
  scroll-padding-block-start: 72px;
}
.technical-examples {
  padding-block: 32px 64px;
  min-width: 0;
}
.technical-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 24px;
  font-size: 12px;
  color: var(--h-muted);
}
.technical-nav {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  gap: 4px;
  max-width: 100%;
  overflow-x: auto;
  box-sizing: border-box;
  padding: 6px;
  margin-top: 24px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  background: var(--h-bg);
  box-shadow: var(--h-shadow-soft);
  scrollbar-width: thin;
}
.technical-nav button {
  flex-shrink: 0;
  min-height: 40px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: calc(var(--h-radius-control) - 3px);
  background: none;
  color: var(--h-muted);
  font: 12px/1.5 var(--h-font);
  white-space: nowrap;
  cursor: pointer;
}
.technical-nav button[aria-current="location"] {
  background: var(--h-accent-subtle);
  color: var(--h-accent-text);
  border-color: var(--h-border);
}
.technical-nav button:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 2px;
}
.technical-section {
  margin-top: 40px;
}
.technical-section-heading h2 {
  margin: 0;
  font-size: 22px;
  line-height: 1.5;
  font-weight: 550;
  scroll-margin-top: 24px;
  overflow-wrap: anywhere;
}
.technical-section-heading h2:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 5px;
}
.technical-section-heading p {
  margin: 6px 0 0;
  font-size: 13px;
  line-height: 1.7;
  color: var(--h-muted);
  max-width: 72ch;
}
.technical-grid {
  display: grid;
  align-items: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 20px;
}
.technical-code-grid {
  grid-template-columns: minmax(0, 1.3fr) repeat(2, minmax(0, 1fr));
}
.technical-stack {
  display: grid;
  gap: 20px;
  min-width: 0;
  align-content: start;
}
.technical-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.technical-note {
  color: var(--h-muted);
  font-size: 12px;
  line-height: 1.7;
  margin-top: 16px;
}
.technical-table {
  min-width: 0;
}
.technical-event {
  font: 12px/1.6 var(--h-font-mono);
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.technical-signed {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--h-border);
}
@media (max-width: 1100px) {
  .technical-code-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .technical-code-grid > :first-child {
    grid-column: 1/-1;
  }
}
@media (max-width: 900px) {
  .technical-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .technical-code-grid > :first-child {
    grid-column: auto;
  }
}
@media (hover: hover) {
  .technical-nav button:hover {
    background: var(--h-raised);
    color: var(--h-text);
  }
}
@media (pointer: coarse) {
  .technical-nav button {
    min-height: 44px;
  }
}
</style>
