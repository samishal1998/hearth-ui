<script setup lang="ts">
import { ref } from "vue";
import {
  HSettingsPage,
  HAuthPage,
  HProviderSetup,
  HResourceDetail,
  HStatusPage,
  HErrorPage,
  HFirstRunSetup,
  HDashboardShell,
  HPublicShell,
  HCard,
  HInput,
  HSwitch,
  HButton,
  HBadge,
  HCodeBlock,
  HLogViewer,
  HAlert,
  HSegmentedControl,
  type ConnectionDraft,
  type AuthCredentials,
} from "../src";
defineProps<{ kind: string }>();
const name = ref("Homestead");
const dirty = ref(false);
const saving = ref(false);
const notice = ref("");
const connection = ref<"offline" | "connecting" | "connected" | "failed">(
  "offline",
);
const step = ref(0);
const busy = ref(false);
const errorKind = ref("not-found");
const notifications = ref(true);
async function save() {
  saving.value = true;
  await new Promise((r) => setTimeout(r, 250));
  saving.value = false;
  dirty.value = false;
  notice.value = "Saved in this in-memory example.";
}
async function testConnection(_draft: ConnectionDraft) {
  connection.value = "connecting";
  await new Promise((r) => setTimeout(r, 300));
  connection.value = "connected";
}
async function account(_credentials: AuthCredentials) {
  busy.value = true;
  await new Promise((r) => setTimeout(r, 200));
  busy.value = false;
  step.value = 1;
}
async function signIn(_credentials: AuthCredentials) {
  busy.value = true;
  await new Promise((resolve) => setTimeout(resolve, 250));
  busy.value = false;
  notice.value = "Sign-in demo complete. No credentials were sent or stored.";
}
async function provider(_draft: ConnectionDraft) {
  busy.value = true;
  await new Promise((r) => setTimeout(r, 200));
  busy.value = false;
  step.value = 2;
}
</script>
<template>
  <div class="recipe-banner">
    <HButton href="#recipes" variant="ghost">← All page recipes</HButton
    ><HBadge label="UI example · no backend requests" tone="accent" />
  </div>
  <HAuthPage
    v-if="kind === 'auth'"
    brand="homestead"
    :loading="busy"
    note="Interactive preview. Use demo credentials only."
    @submit="signIn"
    ><template #footer
      ><HAlert v-if="notice" tone="success" :description="notice" /></template
  ></HAuthPage>
  <HDashboardShell
    v-else-if="kind === 'settings' || kind === 'resource'"
    brand="homestead"
    :items="[
      {
        id: 'settings',
        label: 'Settings',
        href: '#recipe-settings',
        icon: 'settings',
      },
      {
        id: 'resource',
        label: 'Resource',
        href: '#recipe-resource',
        icon: 'apps',
      },
    ]"
    :active="kind"
    :page-title="kind === 'settings' ? 'Settings' : 'Photo library'"
    username="Owner"
    ><HSettingsPage
      v-if="kind === 'settings'"
      :dirty="dirty"
      :saving="saving"
      @save="save"
      @reset="
        name = 'Homestead';
        notifications = true;
        dirty = false;
      "
      ><HAlert v-if="notice" tone="success" :description="notice" /><HCard
        title="Your workspace"
        ><div class="form-stack">
          <HInput
            v-model="name"
            label="Workspace name"
            @update:model-value="dirty = true"
          /><HSwitch
            v-model="notifications"
            label="Email summaries"
            @update:model-value="dirty = true"
          /><HInput
            label="Maintenance date"
            type="date"
          /></div></HCard></HSettingsPage
    ><HResourceDetail
      v-else
      title="Photo library"
      description="The moments worth coming back to."
      status="Healthy"
      tone="success"
      :breadcrumbs="[
        { id: 'home', label: 'Workspace', href: '#dashboard' },
        { id: 'photos', label: 'Photos' },
      ]"
      :fields="[
        { key: 'version', label: 'Version', value: '1.0.0' },
        { key: 'source', label: 'Source', value: 'Docker' },
      ]"
      :tabs="[
        { value: 'overview', label: 'Overview' },
        { value: 'configuration', label: 'Configuration' },
        { value: 'logs', label: 'Logs' },
      ]"
      ><template #actions
        ><HButton @click="notice = 'Refresh requested in the demo.'"
          >Refresh</HButton
        ></template
      ><template #overview
        ><HCard
          title="A place for your details."
          description="Supply resource data and actions from your application." /><HAlert
          v-if="notice"
          :description="notice" /></template
      ><template #configuration
        ><HCodeBlock code="apptrail.id: photos" language="yaml" /></template
      ><template #logs
        ><HLogViewer
          :entries="[
            { id: 'one', message: 'Application started.', level: 'info' },
          ]" /></template></HResourceDetail></HDashboardShell
  ><HStatusPage
    v-else-if="kind === 'status'"
    brand="homestead"
    updated-at="Demo snapshot · not live monitoring"
    :groups="[
      {
        id: 'apps',
        label: 'Applications',
        services: [
          { id: 'photos', name: 'Photos', status: 'operational' },
          { id: 'media', name: 'Media', status: 'operational' },
        ],
      },
      {
        id: 'infra',
        label: 'Infrastructure',
        services: [
          {
            id: 'backups',
            name: 'Backups',
            status: 'maintenance',
            description: 'Scheduled maintenance is in progress.',
          },
        ],
      },
    ]"
    :incidents="[
      {
        id: 'maintenance',
        title: 'Backup maintenance',
        description:
          'An illustrative incident update supplied by the application.',
        status: 'monitoring',
      },
    ]"
  /><template v-else-if="kind === 'error'"
    ><div class="recipe-error-picker">
      <HSegmentedControl
        v-model="errorKind"
        label="Error-page example"
        :options="[
          { value: 'not-found', label: '404' },
          { value: 'forbidden', label: '403' },
          { value: 'unavailable', label: '503' },
        ]"
      />
    </div>
    <HErrorPage
      :kind="errorKind as 'not-found' | 'forbidden' | 'unavailable'"
      brand="homestead"
      home-href="#recipes"
      retryable
      @retry="notice = 'Retry requested.'"
      ><template #footer
        ><p role="status">{{ notice }}</p></template
      ></HErrorPage
    ></template
  ><HPublicShell v-else brand="homestead" brand-href="#recipes"
    ><div class="recipe-content">
      <HProviderSetup
        v-if="kind === 'provider'"
        :state="connection"
        :testing="connection === 'connecting'"
        :saving="saving"
        message="This example simulates connectivity without making requests."
        @test="testConnection"
        @save="save"
      /><HFirstRunSetup
        v-else
        v-model:step="step"
        :busy="busy"
        :connection-state="connection"
        connection-message="A simulated connection in this UI example."
        @account="account"
        @test-provider="testConnection"
        @provider="provider"
        @complete="
          notice = 'Setup demo complete. No account or provider was created.'
        "
      /><HAlert v-if="notice" tone="success" :description="notice" /></div
  ></HPublicShell>
</template>
<style scoped>
.recipe-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 12px 20px;
  background: var(--h-surface);
  border-bottom: 1px solid var(--h-border);
}
.recipe-content {
  max-width: 850px;
  margin: 50px auto 70px;
  display: grid;
  gap: 22px;
}
.recipe-error-picker {
  max-width: 420px;
  margin: 25px auto;
  padding-inline: 20px;
}
</style>
