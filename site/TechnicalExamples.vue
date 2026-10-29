<script setup lang="ts">
import { computed, ref } from "vue";
import {
  HPageHeader,
  HButton,
  HCard,
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
const selected = ref(""),
  signal = ref(false),
  volume = ref(45),
  busy = ref(false),
  stress = ref(false);
const sample = ref(0);
const columns = ref<ChartColumn[]>(
  Array.from({ length: 8 }, (_, i) => ({
    id: String(i),
    label: `${i + 9}:00`,
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
      id: String(i + 1),
      label: `${i + 10}:00`,
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
    class="technical-examples"
    aria-label="Developer and diagram examples"
  >
    <HPageHeader
      title="Tools for technical interfaces."
      description="Copyable code, inspectable data, and small interactions built on native HTML."
      eyebrow="Developer components & diagrams"
      ><HButton href="#components">Component gallery</HButton></HPageHeader
    >
    <div class="technical-grid">
      <HCard
        title="One example. Several ways in."
        description="Arrow keys switch between examples. Copy uses the active tab."
        ><HCodeSnippet
          :options="options"
          label="API request language"
          line-numbers
      /></HCard>
      <div class="technical-stack">
        <HCard title="Install in your stack"
          ><HPackageInstall :packages="['@hearth-ui/vue', 'vue']" />
          <p class="technical-note">
            Native Vue and standalone web components share the same source.
          </p></HCard
        ><HCard title="Terminal transcript"
          ><HTerminal
            :lines="[
              { id: '1', kind: 'command', text: 'npm run build' },
              { id: '2', kind: 'output', text: 'Compiling components…' },
              { id: '3', kind: 'success', text: 'Build complete in 824ms' },
            ]"
        /></HCard>
      </div>
      <HCard title="Amounts, stacked like a waveform"
        ><HStackedWaveform
          :columns="stackedAmounts"
          label="Amount composition"
          description="Each pillar is a stack of amounts, separated by 0.5px gaps. The first three totals are 16, 21, and 29."
          :selected="selected"
          @select="selected = $event"
        /><HButton @click="next">Update amounts</HButton></HCard
      >
      <HCard title="Signals and change"
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
            :selected="selected"
            @select="selected = $event"
          /><HButton @click="next">Update changes</HButton>
        </div></HCard
      >
      <HCard title="Small details"
        ><div class="technical-stack">
          <div class="technical-actions">
            <HButton variant="primary" :loading="busy" @click="busy = true"
              >Run build</HButton
            ><HButton @click="busy = false">Reset state</HButton
            ><HKeyboardKey
              :keys="['Ctrl', 'Enter']"
              label="Control plus Enter"
            />
          </div>
          <HRange v-model="volume" label="Output level" /><HDropdownMenu
            label="Workspace actions"
            :items="[
              { id: 'copy', label: 'Copy endpoint' },
              { id: 'logs', label: 'View logs' },
              { id: 'remove', label: 'Remove workspace', danger: true },
            ]"
          /><HCollapsible label="Connection details"
            ><p>
              The native disclosure opens and closes without remounting its
              content. Press Enter or Space on its trigger.
            </p></HCollapsible
          >
        </div></HCard
      >
      <HCard title="Build duration"
        ><HBarChart
          :items="durations"
          label="Duration by interval"
          unit="s"
          :selected="selected"
          @select="selected = $event"
      /></HCard>
      <HCard title="Outcomes over time"
        ><HStackedBarChart
          :columns="columns"
          :series="[
            { id: 'success', label: 'Success', tone: 'success' },
            { id: 'retry', label: 'Retry', tone: 'warning' },
            { id: 'error', label: 'Error', tone: 'danger' },
          ]"
          label="Request outcomes"
          :selected="selected"
          @select="selected = $event"
        /><HButton @click="next">Next interval</HButton></HCard
      >
    </div>
    <HCard class="technical-table" title="Content should fit the layout."
      ><HSwitch v-model="stress" label="Stress test long content" /><HDataTable
        :rows="rows"
        :columns="[
          { key: 'service', label: 'Service', sortable: true },
          { key: 'endpoint', label: 'Endpoint' },
          { key: 'state', label: 'State', width: '100px' },
        ]"
        :actions="[{ id: 'inspect', label: 'Inspect service' }]"
        label="Service endpoints"
    /></HCard>
  </section>
</template>
<style scoped>
.technical-examples {
  padding-block: 32px 64px;
  min-width: 0;
}
.technical-grid {
  display: grid;
  align-items: start;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  margin-top: 32px;
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
  margin-top: 24px;
}
.technical-signed {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--h-border);
}
@media (max-width: 900px) {
  .technical-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
