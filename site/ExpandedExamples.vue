<script setup lang="ts">
import { ref, computed } from "vue";
import {
  HCard,
  HCombobox,
  HMultiSelect,
  HCheckbox,
  HRadioGroup,
  HTextarea,
  HRange,
  HButton,
  HButtonBar,
  HNavigationMenu,
  HSidebar,
  HProgress,
  HBreadcrumbs,
  HAvatar,
  HSeparator,
  HSkeleton,
  HAccordion,
  HPagination,
  HTabs,
  HBadge,
} from "../src";
const emit = defineEmits<{ notice: [message: string] }>();
const options = [
  {
    value: "docker",
    label: "Docker",
    description: "Containers on your infrastructure",
    keywords: ["containers", "compose"],
  },
  {
    value: "traefik",
    label: "Traefik",
    description: "Routes from your reverse proxy",
  },
  {
    value: "caddy",
    label: "Caddy",
    description: "Coming to your workspace later",
    disabled: true,
  },
  {
    value: "manual",
    label: "Manual entries",
    description: "The apps you add yourself",
  },
];
const providers = ref<string[]>(["docker"]);
const primary = ref<string | string[]>("docker");
const summaries = ref(true);
const mixed = ref(true);
const selectedAll = ref(false);
const access = ref("private");
const notes = ref("A home for the things you host.");
const interval = ref(15);
const page = ref(1);
const collapsed = ref(false);
const active = ref("apps");
const currentTab = ref("general");
const rows = computed(() =>
  Array.from({ length: 5 }, (_, i) => ({
    id: (page.value - 1) * 5 + i + 1,
    name: `Application ${(page.value - 1) * 5 + i + 1}`,
  })),
);
const nav = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "apps", label: "Applications", icon: "apps", badge: 12 },
  { id: "providers", label: "Providers", icon: "providers" },
];
const menu = [
  { id: "workspace", label: "Workspace", icon: "home" },
  {
    id: "manage",
    label: "Manage",
    children: [
      { id: "apps", label: "Applications", icon: "apps" },
      { id: "providers", label: "Providers", icon: "providers" },
      { id: "locked", label: "Organization", disabled: true },
    ],
  },
  { id: "guide", label: "Guide", href: "#guide" },
];
</script>
<template>
  <section class="expanded-examples">
    <div class="expanded-heading">
      <HBadge label="New in 0.2" tone="accent" />
      <h2>More ways to make it yours.</h2>
      <p>
        Selection, navigation, feedback, and the everyday details of a working
        dashboard.
      </p>
    </div>
    <div class="expanded-grid">
      <HCard
        title="One choice. Or quite a few."
        description="Search, keyboard navigation, selected chips, and native form values."
        ><form
          class="form-stack"
          @submit.prevent="emit('notice', 'Selection saved in this demo.')"
        >
          <HMultiSelect
            v-model="providers"
            :options="options"
            label="Discovery providers"
            name="providers"
            required
            hint="Try containers, proxy, or manual. Disabled options cannot be selected."
          /><HCombobox
            v-model="primary"
            :options="options"
            label="Primary provider"
            name="primary"
            required
          />
          <div class="example-result">
            Selected:
            {{
              Array.isArray(providers)
                ? providers.join(", ") || "none"
                : providers
            }}
            · Primary: {{ primary || "none" }}
          </div>
          <HButtonBar align="end" label="Save provider selections"
            ><HButton
              @click="
                providers = ['docker'];
                primary = 'docker';
              "
              >Reset selection</HButton
            ><HButton type="submit" variant="primary"
              >Save providers</HButton
            ></HButtonBar
          >
        </form></HCard
      ><HCard
        title="Decisions, without the guesswork."
        description="Real checkbox and radio inputs, including mixed selection."
        ><div class="form-stack">
          <HCheckbox
            v-model="summaries"
            label="Email summaries"
            description="A quiet overview of your workspace."
          /><HCheckbox
            v-model="selectedAll"
            v-model:indeterminate="mixed"
            label="Select all applications"
            description="Starts in a mixed state. Click to choose all."
          /><HSeparator /><HRadioGroup
            v-model="access"
            label="Default page access"
            name="example-access"
            :options="[
              {
                value: 'private',
                label: 'Private',
                description: 'Only the workspace owner.',
              },
              {
                value: 'public',
                label: 'Public',
                description: 'Anyone can view the page.',
              },
              {
                value: 'team',
                label: 'Team',
                description: 'Not available in this workspace.',
                disabled: true,
              },
            ]"
          />
          <div class="example-result">
            {{
              access === "private"
                ? "A private starting point."
                : "A page you can share."
            }}
          </div>
        </div></HCard
      ><HCard
        title="A little room for the details."
        description="Longer text and bounded numeric values, with native keyboard support."
        ><div class="form-stack">
          <HTextarea
            v-model="notes"
            label="Workspace description"
            name="description"
            :maxlength="400"
            hint="Something that makes this space feel like yours."
          /><HRange
            v-model="interval"
            label="Refresh interval"
            name="interval"
            :min="5"
            :max="60"
            :step="5"
            unit=" min"
          /><HButtonBar align="between" label="Workspace details actions"
            ><HButton variant="ghost" @click="notes = ''"
              >Clear description</HButton
            ><HButton
              variant="primary"
              @click="emit('notice', 'Preferences saved in this demo.')"
              >Save details</HButton
            ></HButtonBar
          >
        </div></HCard
      ><HCard
        title="Show the work in progress."
        description="Determinate and indeterminate progress. Motion respects reduced-motion preferences."
        ><div class="form-stack">
          <HProgress
            label="Discovery scan"
            :value="interval"
            :max="60"
            description="Move the refresh interval slider to change this preview."
          /><HProgress
            label="Storage migration"
            :value="78"
            tone="success"
          /><HProgress
            label="Connecting to infrastructure"
            indeterminate
            :show-value="false"
          /><HSeparator label="While the content arrives" />
          <div class="avatar-row">
            <HSkeleton
              variant="circle"
              width="44px"
              label="Loading avatar"
            /><HSkeleton :lines="2" label="Loading account details" />
          </div></div
      ></HCard>
    </div>
    <HCard
      class="expanded-navigation"
      title="A standalone place to navigate."
      description="Use a sidebar inside your own layout, or compose a public navigation menu with native disclosures."
      ><HBreadcrumbs
        :items="[
          { id: 'home', label: 'Workspace' },
          { id: 'settings', label: 'Settings' },
          { id: 'access', label: 'Access' },
        ]"
        @navigate="
          emit('notice', `Navigate to ${$event}`)
        " /><HSeparator /><HNavigationMenu
        :items="menu"
        :active="active"
        @navigate="
          active = $event;
          emit('notice', `Navigation event: ${$event}`);
        " /><HSeparator />
      <div class="sidebar-example">
        <HSidebar
          v-model:collapsed="collapsed"
          brand="homestead"
          :items="nav"
          :sections="[
            {
              label: 'Account',
              items: [{ id: 'settings', label: 'Settings', icon: 'settings' }],
            },
          ]"
          :active="active"
          @navigate="active = $event"
          ><template #footer
            ><div class="avatar-row" v-if="!collapsed">
              <HAvatar name="Sami Mishal" :size="32" /><span class="muted"
                >Workspace owner</span
              >
            </div></template
          ></HSidebar
        >
        <div class="sidebar-content">
          <div class="avatar-row">
            <HAvatar name="Sami Mishal" :size="48" />
            <div>
              <strong>Your little workspace.</strong>
              <p class="muted">Selected: {{ active }}</p>
            </div>
          </div>
          <HSeparator /><HTabs
            v-model="currentTab"
            label="Workspace sections"
            orientation="vertical"
            activation="manual"
            variant="underline"
            :items="[
              { value: 'general', label: 'General' },
              { value: 'appearance', label: 'Appearance' },
              { value: 'advanced', label: 'Advanced', disabled: true },
            ]"
            ><template #general
              ><p class="muted">
                Vertical tabs can use manual activation: arrow keys move focus,
                Enter selects the panel.
              </p></template
            ><template #appearance
              ><div class="avatar-row">
                <HAvatar name="Ocean" tone="info" shape="rounded" /><HAvatar
                  name="Forest"
                  tone="success"
                  shape="rounded"
                /><HAvatar name="Sunset" shape="rounded" /></div></template
          ></HTabs>
        </div></div
    ></HCard>
    <div class="expanded-grid">
      <HCard
        title="Reveal the next useful detail."
        description="Native details and summary elements, with single or multiple expansion."
        ><HAccordion
          :items="[
            {
              id: 'identity',
              title: 'How does stable identity work?',
              description:
                'Keep the same application identity even when a container is recreated.',
            },
            {
              id: 'visibility',
              title: 'Who can view a public page?',
              description:
                'Visitors can see that page. Editing stays with the owner.',
            },
            {
              id: 'storage',
              title: 'Where does this example store data?',
              description: 'This showcase keeps example data in memory.',
            },
          ]" /></HCard
      ><HCard
        title="A manageable page at a time."
        description="Bounded page controls, previous/next actions, and an accessible current page."
        ><ul class="pagination-rows">
          <li v-for="row in rows" :key="row.id">
            <span>{{ row.name }}</span
            ><HBadge label="Healthy" tone="success" dot />
          </li>
        </ul>
        <HSeparator /><HPagination v-model="page" :total="60" :page-size="5" />
        <p class="example-result">Showing page {{ page }} of 12.</p></HCard
      >
    </div>
  </section>
</template>
<style scoped>
.expanded-examples {
  margin-block: 60px;
}
.expanded-heading {
  margin-bottom: 25px;
}
.expanded-heading h2 {
  font-size: 28px;
  font-weight: 550;
  letter-spacing: -0.8px;
  margin: 14px 0 10px;
}
.expanded-heading p {
  font-size: 13px;
  color: var(--h-muted);
  line-height: 1.85;
}
.expanded-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px;
  align-items: start;
}
.expanded-navigation {
  margin-block: 22px;
}
.example-result {
  font: 11px/1.8 var(--h-font-mono);
  color: var(--h-muted);
  overflow-wrap: anywhere;
}
.avatar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}
.avatar-row > .h-skeleton.text {
  flex: 1;
}
.sidebar-example {
  display: grid;
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 28px;
  align-items: start;
}
.sidebar-content {
  min-width: 0;
  padding-top: 12px;
}
.sidebar-content strong {
  font-size: 16px;
  font-weight: 550;
}
.pagination-rows {
  list-style: none;
  margin: 0;
  padding: 0;
}
.pagination-rows li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--h-border);
  font-size: 12px;
}
.pagination-rows li:last-child {
  border-bottom: 0;
}
.example-result:last-child {
  margin-top: 12px;
}
@media (max-width: 850px) {
  .expanded-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  .sidebar-example {
    grid-template-columns: 1fr;
  }
  .sidebar-example :deep(.h-sidebar-panel:not(.collapsed)) {
    width: 100%;
  }
  .expanded-heading h2 {
    font-size: 24px;
  }
  .sidebar-content {
    padding: 0;
  }
  .sidebar-content :deep(.h-tabs.vertical) {
    grid-template-columns: 100px minmax(0, 1fr);
    gap: 12px;
  }
}
</style>
