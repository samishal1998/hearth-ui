<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import {
  HTheme,
  HBrand,
  HIcon,
  HButton,
  HBadge,
  HInput,
  HSelect,
  HSwitch,
  HCard,
  HAppCard,
  HStatCard,
  HAlert,
  HEmptyState,
  HTabs,
  HDialog,
  HPageHeader,
  HPublicShell,
  HDashboardShell,
  HAuthPage,
  themes,
  themeStyle,
  themeCSS,
  type Theme,
  type Mode,
  type Density,
  type ThemeTokens,
  type AuthCredentials,
} from "../src";
import { catalog } from "./catalog";
import ExpandedExamples from "./ExpandedExamples.vue";
const document = window.document;

const route = ref(location.hash.slice(1) || "home");
const navigate = (id: string) => (location.hash = id);
const hashChange = () => {
  route.value = location.hash.slice(1) || "home";
  window.scrollTo(0, 0);
};
onMounted(() => window.addEventListener("hashchange", hashChange));
onUnmounted(() => window.removeEventListener("hashchange", hashChange));
let saved: Record<string, unknown> = {};
try {
  const parsed = JSON.parse(localStorage.getItem("hearth-playground") || "{}");
  if (parsed && typeof parsed === "object" && !Array.isArray(parsed))
    saved = parsed;
} catch {}
const theme = ref<Theme>(
  themes.includes(saved.theme as Theme) ? (saved.theme as Theme) : "sunset",
);
const mode = ref<Mode>(
  ["dark", "light", "system"].includes(String(saved.mode))
    ? (saved.mode as Mode)
    : "dark",
);
const density = ref<Density>(
  saved.density === "compact" ? "compact" : "comfortable",
);
const brand = ref(typeof saved.brand === "string" ? saved.brand : "hearth");
const overrides = ref<ThemeTokens>(
  saved.tokens && typeof saved.tokens === "object"
    ? themeStyle(saved.tokens as ThemeTokens)
    : {},
);
const themeRoot = ref<InstanceType<typeof HTheme>>();
const resolved = ref<ThemeTokens>({});
async function readTokens() {
  await nextTick();
  const el = themeRoot.value?.$el;
  if (!(el instanceof HTMLElement)) return;
  const css = getComputedStyle(el);
  resolved.value = Object.fromEntries(
    Array.from(css)
      .filter((k) => k.startsWith("--h-"))
      .map((k) => [k, css.getPropertyValue(k).trim()]),
  );
}
watch(
  [theme, mode, density, brand, overrides],
  () => {
    localStorage.setItem(
      "hearth-playground",
      JSON.stringify({
        theme: theme.value,
        mode: mode.value,
        density: density.value,
        brand: brand.value,
        tokens: overrides.value,
      }),
    );
    readTokens();
  },
  { deep: true },
);
onMounted(readTokens);
const colorPreference = window.matchMedia("(prefers-color-scheme: dark)");
const systemDark = ref(colorPreference.matches);
const isDark = computed(() =>
  mode.value === "system" ? systemDark.value : mode.value === "dark",
);
function systemChanged() {
  systemDark.value = colorPreference.matches;
  readTokens();
}
onMounted(() => colorPreference.addEventListener("change", systemChanged));
onUnmounted(() => colorPreference.removeEventListener("change", systemChanged));
function toggleMode() {
  mode.value = isDark.value ? "light" : "dark";
}
const notice = ref("");
let noticeTimer: ReturnType<typeof setTimeout>;
function notify(text: string) {
  notice.value = text;
  clearTimeout(noticeTimer);
  noticeTimer = setTimeout(() => (notice.value = ""), 4500);
}
onUnmounted(() => clearTimeout(noticeTimer));
const themeOptions = themes.map((t) => ({
  value: t,
  label: t[0].toUpperCase() + t.slice(1),
}));
const themeDescriptions: Record<Theme, string> = {
  sunset: "Warm. Familiar. The original.",
  ocean: "Clear skies. A quieter blue.",
  forest: "A breath of green. Room to grow.",
  dusk: "Soft violet. A little evening calm.",
  rose: "Muted rose. A warmer welcome.",
};
const modeOptions = [
  { value: "dark", label: "After sunset · dark" },
  { value: "light", label: "First light · light" },
  { value: "system", label: "Follow your system" },
];
function selectTheme(value: string) {
  theme.value = value as Theme;
  overrides.value = {};
}
function setToken(key: `--h-${string}`, value: string) {
  overrides.value = { ...overrides.value, [key]: value };
}
function resetTheme() {
  theme.value = "sunset";
  mode.value = "dark";
  density.value = "comfortable";
  brand.value = "hearth";
  overrides.value = {};
}
const exportOpen = ref(false);
const exportCode = computed(() => themeCSS(resolved.value));
async function copy(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    notify("Copied. Make it yours.");
  } catch {
    exportOpen.value = true;
    notify(
      "Clipboard is unavailable here. Select and copy the export instead.",
    );
  }
}
const controlLabel = ref("Photo library");
const controlSelect = ref("media");
const controlSwitch = ref(true);
const controlError = ref(false);
const tab = ref("preview");
const dialogOpen = ref(false);
const catalogFilter = ref("All");
const catalogSearch = ref("");
const filteredCatalog = computed(() =>
  catalog.filter(
    (c) =>
      (catalogFilter.value === "All" || c.category === catalogFilter.value) &&
      `${c.name} ${c.tag} ${c.description}`
        .toLowerCase()
        .includes(catalogSearch.value.toLowerCase()),
  ),
);
const docFramework = ref("vue");
const dashboardView = ref("overview");
const demoSearch = ref("");
const demoFavorites = ref(false);
const addOpen = ref(false);
const inspectName = ref("");
const signedInAs = ref("Sami");
const apps = ref([
  {
    name: "Immich",
    description: "All your memories, beautifully organized.",
    category: "Media",
    status: "healthy" as const,
    favorite: true,
    source: "Docker",
  },
  {
    name: "Jellyfin",
    description: "Your personal cinema, on your own terms.",
    category: "Media",
    status: "healthy" as const,
    favorite: false,
    source: "Docker",
  },
  {
    name: "Home Assistant",
    description: "A smarter home. A quieter everyday.",
    category: "Home",
    status: "healthy" as const,
    favorite: true,
    source: "Docker",
  },
  {
    name: "Grafana",
    description: "A clearer picture of what matters.",
    category: "Monitoring",
    status: "healthy" as const,
    favorite: false,
    source: "Docker",
  },
  {
    name: "Paperless",
    description: "Every document. Finally in its place.",
    category: "Productivity",
    status: "unknown" as const,
    favorite: false,
    source: "Manual",
  },
  {
    name: "Gitea",
    description: "A home for your code and your next idea.",
    category: "Development",
    status: "healthy" as const,
    favorite: false,
    source: "Docker",
  },
]);
const shownApps = computed(() =>
  apps.value.filter(
    (a) =>
      (!demoFavorites.value || a.favorite) &&
      `${a.name} ${a.description} ${a.category}`
        .toLowerCase()
        .includes(demoSearch.value.toLowerCase()),
  ),
);
const publicNav = [
  { id: "components", label: "Components", href: "#components" },
  { id: "themes", label: "Themes", href: "#themes" },
  { id: "guide", label: "Get started", href: "#guide" },
];
const dashboardNav = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "apps", label: "Applications", icon: "apps", badge: 6 },
  { id: "providers", label: "Providers", icon: "providers" },
  { id: "settings", label: "Settings", icon: "settings" },
];
const loginLoading = ref(false);
async function login(credentials: AuthCredentials) {
  loginLoading.value = true;
  await new Promise((r) => setTimeout(r, 350));
  signedInAs.value = credentials.username;
  loginLoading.value = false;
  navigate("dashboard");
  notify("Welcome in. This is a UI demo; no authentication request was sent.");
}
function addApp(e: SubmitEvent) {
  e.preventDefault();
  const f = new FormData(e.currentTarget as HTMLFormElement);
  apps.value.push({
    name: String(f.get("name")),
    description: String(f.get("description") || "Your newest self-hosted app."),
    category: "Other",
    status: "unknown",
    favorite: false,
    source: "Manual",
  });
  addOpen.value = false;
  notify("Added to this demo workspace.");
}
const vueExample = `<script setup>\nimport { HTheme, HAuthPage } from '@samishal1998/hearth-ui'\nimport '@samishal1998/hearth-ui/styles.css'\n\nfunction signIn({ username, password }) {\n  // Call your authentication API here.\n}\n<\/script>\n\n<template>\n  <HTheme theme="sunset" mode="dark">\n    <HAuthPage brand="homestead" @submit="signIn" />\n  </HTheme>\n</template>`;
const wcExample = `<link rel="stylesheet" href="./dist/themes.css">\n<script type="module">\n  import { registerElements } from './dist/elements/index.js'\n  registerElements()\n\n  document.querySelector('hearth-auth-page')\n    .addEventListener('submit', event => {\n      const [{ username, password }] = event.detail\n      // Call your authentication API here.\n    })\n<\/script>\n\n<hearth-theme theme="sunset" mode="dark">\n  <hearth-auth-page brand="homestead"></hearth-auth-page>\n</hearth-theme>`;
</script>

<template>
  <HTheme
    ref="themeRoot"
    :theme="theme"
    :mode="mode"
    :density="density"
    :tokens="overrides"
  >
    <div v-if="notice" class="site-toast">
      <HAlert
        :description="notice"
        tone="success"
        dismissible
        @dismiss="notice = ''"
      />
    </div>
    <template v-if="route === 'login'">
      <div class="demo-back">
        <HButton href="#home" icon="arrow" variant="ghost"
          >Back to Hearth UI</HButton
        ><HBadge label="Interactive page template" tone="accent" />
      </div>
      <HAuthPage
        :brand="brand"
        :loading="loginLoading"
        description="Try any username and password to explore the demo workspace."
        @submit="login"
        ><template #note
          ><HIcon name="lock" :size="13" />UI demo · Credentials are never
          stored or sent.</template
        ></HAuthPage
      >
    </template>
    <HDashboardShell
      v-else-if="route === 'dashboard'"
      :brand="brand"
      :items="dashboardNav"
      :active="dashboardView"
      :page-title="dashboardNav.find((n) => n.id === dashboardView)?.label"
      :username="signedInAs"
      @navigate="dashboardView = $event"
      @logout="navigate('login')"
    >
      <template #header-actions
        ><HBadge label="Demo workspace" tone="accent" dot /><HButton
          variant="ghost"
          :icon="isDark ? 'sun' : 'moon'"
          icon-only
          label="Toggle theme mode"
          @click="toggleMode" /><HButton
          href="#home"
          variant="ghost"
          size="compact"
          >Design system<HIcon name="launch" :size="14" /></HButton
      ></template>
      <template v-if="dashboardView === 'overview' || dashboardView === 'apps'">
        <HPageHeader
          v-if="dashboardView === 'overview'"
          title="Your apps."
          accent="Right where you left them."
          description="A home for everything you host. Less searching, more doing."
          eyebrow="Your corner of the internet"
          variant="hero"
          ><HButton icon="providers" @click="dashboardView = 'providers'"
            >Connect provider</HButton
          ><HButton variant="primary" icon="plus" @click="addOpen = true"
            >Add app</HButton
          ></HPageHeader
        >
        <HPageHeader
          v-else
          title="All your applications."
          description="The things you build and the services you come home to."
          eyebrow="Your workspace"
          ><HButton variant="primary" icon="plus" @click="addOpen = true"
            >Add app</HButton
          ></HPageHeader
        >
        <div class="stats-grid">
          <HStatCard
            label="Applications"
            :value="apps.length"
            icon="apps"
          /><HStatCard
            label="Healthy apps"
            :value="apps.filter((a) => a.status === 'healthy').length"
            :detail="`/ ${apps.length}`"
            tone="success"
            icon="health"
          /><HStatCard
            label="Demo providers"
            :value="2"
            tone="info"
            icon="providers"
          /><HStatCard
            label="Favorites"
            :value="apps.filter((a) => a.favorite).length"
            tone="warning"
            icon="star"
          />
        </div>
        <div class="demo-section-head">
          <h2>
            Your applications <HBadge :label="String(shownApps.length)" />
          </h2>
          <HBadge label="Private" dot />
        </div>
        <div class="demo-filters">
          <div class="filter-buttons">
            <HButton
              :variant="!demoFavorites ? 'secondary' : 'ghost'"
              size="compact"
              @click="demoFavorites = false"
              >All apps</HButton
            ><HButton
              :variant="demoFavorites ? 'secondary' : 'ghost'"
              size="compact"
              icon="star"
              @click="demoFavorites = true"
              >Favorites</HButton
            >
          </div>
          <HInput
            v-model="demoSearch"
            label="Search applications"
            type="search"
            placeholder="Find your next stop…"
          />
        </div>
        <div v-if="shownApps.length" class="apps-grid">
          <HAppCard
            v-for="app in shownApps"
            :key="app.name"
            v-bind="app"
            editable
            @favorite-change="app.favorite = $event"
            @inspect="inspectName = app.name"
            @edit="inspectName = app.name"
          />
        </div>
        <HEmptyState
          v-else
          title="No apps match just yet."
          description="Try another name, or make a little room for something new."
          icon="search"
          ><HButton
            @click="
              demoSearch = '';
              demoFavorites = false;
            "
            >Clear filters</HButton
          ></HEmptyState
        >
      </template>
      <template v-else-if="dashboardView === 'providers'"
        ><HPageHeader
          title="Connected to your infrastructure."
          description="The library supplies the presentation. Your application supplies the connections."
          eyebrow="A working layout, not a backend"
        />
        <div class="provider-demo">
          <HCard
            v-for="provider in ['Docker', 'Traefik']"
            :key="provider"
            :title="provider"
            description="Illustrative provider · No infrastructure requests are made."
            ><div class="provider-row">
              <HBadge label="Connected" tone="success" dot /><HButton
                icon="search"
                @click="
                  notify('A real scan would be handled by your application.')
                "
                >Scan provider</HButton
              >
            </div></HCard
          >
        </div></template
      >
      <template v-else
        ><HPageHeader
          title="Make yourself at home."
          description="The same design, with your own colors, branding, and density."
        />
        <div class="settings-demo">
          <HCard title="Your workspace"
            ><HInput v-model="brand" label="Brand name" />
            <div class="spacer" />
            <HSelect
              :model-value="theme"
              :options="themeOptions"
              label="Palette"
              @update:model-value="selectTheme" />
            <div class="spacer" />
            <HSwitch
              :model-value="!isDark"
              label="First light"
              description="A light companion using the same component geometry."
              @update:model-value="mode = $event ? 'light' : 'dark'" /></HCard
          ><HCard
            title="The whole system, at your fingertips."
            description="Change tokens once. Every component follows, including web components."
            ><HButton href="#themes" icon="settings" variant="primary"
              >Open theme studio</HButton
            ></HCard
          >
        </div></template
      >
    </HDashboardShell>
    <HPublicShell
      v-else
      brand="hearth"
      brand-href="#home"
      :items="publicNav"
      :active="route"
      footer-text="A home for what you build."
    >
      <template #actions
        ><HButton
          variant="ghost"
          :icon="isDark ? 'sun' : 'moon'"
          icon-only
          label="Toggle theme mode"
          @click="toggleMode"
        /><HButton href="#dashboard" size="compact" trailing-icon="arrow"
          >Open dashboard</HButton
        ></template
      >
      <template
        v-if="
          route === 'home' || !['components', 'themes', 'guide'].includes(route)
        "
      >
        <section class="landing-hero">
          <div class="hero-copy">
            <HBadge
              label="A design system for the things you host"
              tone="accent"
              dot
            />
            <h1>Make yourself<br /><span>at home.</span></h1>
            <p>
              Thoughtful components for your dashboard, the pages that welcome
              people in, and the one screen in between.
            </p>
            <div class="hero-actions">
              <HButton
                variant="primary"
                href="#components"
                trailing-icon="arrow"
                >Explore the components</HButton
              ><HButton href="#login" icon="lock">Try the login page</HButton>
            </div>
            <div class="hero-notes">
              <span><HIcon name="code" :size="16" />Vue, natively</span
              ><span
                ><HIcon name="globe" :size="16" />Web components,
                everywhere</span
              >
            </div>
          </div>
          <div class="hero-preview">
            <div class="preview-chrome">
              <span /><span /><span /><small
                >your little corner of the internet</small
              >
            </div>
            <div class="preview-content">
              <HBrand :name="brand" />
              <div class="preview-greeting">
                <span>Welcome home.</span
                ><strong>Everything has a place.</strong>
              </div>
              <div class="mini-stats">
                <HStatCard label="Applications" :value="12" /><HStatCard
                  label="All systems good"
                  :value="12"
                  tone="success"
                  icon="health"
                />
              </div>
              <HAppCard
                name="Photo library"
                description="The moments worth coming back to."
                category="Media"
                status="healthy"
                source="Self-hosted"
              />
              <div class="preview-caption">
                <HIcon name="lock" :size="13" />Private, until you say
                otherwise.
              </div>
            </div>
          </div>
        </section>
        <div class="principle-strip">
          <span
            ><strong>{{ catalog.length }}</strong> components, one family</span
          ><span><strong>2</strong> ways to use them</span
          ><span
            ><strong>{{ themes.length }}</strong> palettes, endless possibilities</span
          ><span><strong>0</strong> backend assumptions</span>
        </div>
        <section class="landing-section">
          <div class="section-intro">
            <span class="eyebrow">A familiar shape for your next idea</span>
            <h2>A couple of public pages.<br />A whole world behind them.</h2>
            <p>
              A shared visual language from the first hello to the everyday
              dashboard.
            </p>
          </div>
          <div class="journey-grid">
            <HCard
              title="01 / Welcome them in."
              description="Public pages with a clear story, confident type, and space to breathe."
              ><HIcon name="globe" :size="30" />
              <div class="spacer" />
              <HButton href="#guide" variant="ghost" trailing-icon="arrow"
                >Public shell</HButton
              ></HCard
            ><HCard
              title="02 / Make it theirs."
              description="The signature split-screen auth page, ready for your own name and sign-in flow."
              ><HIcon name="lock" :size="30" />
              <div class="spacer" />
              <HButton href="#login" variant="ghost" trailing-icon="arrow"
                >Authentication page</HButton
              ></HCard
            ><HCard
              title="03 / Get out of their way."
              description="A calm workspace for apps, data, controls, and the things that need attention."
              ><HIcon name="layout" :size="30" />
              <div class="spacer" />
              <HButton href="#dashboard" variant="ghost" trailing-icon="arrow"
                >Dashboard shell</HButton
              ></HCard
            >
          </div>
        </section>
        <section class="landing-section palette-section">
          <div class="section-intro">
            <span class="eyebrow">Sunset is just the beginning</span>
            <h2>The same feeling.<br />Your own atmosphere.</h2>
            <p>
              Keep the warm orange and deep navy you fell for, choose another
              palette, or take control of every token.
            </p>
            <HButton href="#themes" variant="primary" icon="settings"
              >Make it your own</HButton
            >
          </div>
          <div class="palette-cards">
            <button
              v-for="t in themes"
              :key="t"
              class="palette-choice"
              :class="{ selected: theme === t }"
              :aria-pressed="theme === t"
              @click="selectTheme(t)"
            >
              <span class="palette-swatches" :class="t"><i /><i /><i /></span
              ><strong>{{ t[0].toUpperCase() + t.slice(1) }}</strong
              ><span>{{ themeDescriptions[t] }}</span
              ><HIcon v-if="theme === t" name="check" :size="16" />
            </button>
          </div>
        </section>
        <section class="landing-section build-section">
          <HPageHeader
            title="Start with a good foundation."
            description="Native Vue components when you want them. Standards-based custom elements when you need them. The same source, either way."
            eyebrow="Built to belong in your stack"
            ><HButton href="#guide" variant="primary" trailing-icon="arrow"
              >Start building</HButton
            ><HButton
              href="https://github.com/samishal1998/hearth-ui"
              target="_blank"
              icon="code"
              >View source</HButton
            ></HPageHeader
          >
        </section>
      </template>
      <template v-else-if="route === 'components'">
        <section class="page-intro">
          <HPageHeader
            title="Small details. A complete system."
            description="From the button you press a hundred times to the page that welcomes you home."
            eyebrow="The component collection"
            ><HButton
              variant="primary"
              trailing-icon="arrow"
              @click="
                document.getElementById('expanded-components')?.scrollIntoView()
              "
              >Explore what's new in 0.2</HButton
            ></HPageHeader
          >
        </section>
        <div class="catalog-toolbar">
          <div class="filter-buttons">
            <HButton
              v-for="category in [
                'All',
                'Foundation',
                'Controls',
                'Surfaces',
                'Feedback',
                'Layouts',
              ]"
              :key="category"
              size="compact"
              :variant="catalogFilter === category ? 'secondary' : 'ghost'"
              @click="catalogFilter = category"
              >{{ category }}</HButton
            >
          </div>
          <HInput
            v-model="catalogSearch"
            label="Find a component"
            type="search"
            placeholder="Search the collection…"
          />
        </div>
        <div class="live-components">
          <HCard
            title="Buttons, without the fuss."
            description="Clear hierarchy. Consistent geometry. Native semantics."
            ><div class="component-row">
              <HButton
                variant="primary"
                icon="plus"
                @click="notify('That is a Hearth button.')"
                >Add application</HButton
              ><HButton @click="notify('Secondary action')">Settings</HButton
              ><HButton
                variant="ghost"
                icon="star"
                @click="notify('Quiet action')"
                >Favorite</HButton
              ><HButton variant="danger" @click="dialogOpen = true"
                >Remove</HButton
              ><HButton disabled>Disabled</HButton
              ><HButton loading variant="primary">Saving</HButton
              ><HButton
                icon="settings"
                icon-only
                label="Icon button example"
                @click="notify('Labeled icon-only control')"
              /></div></HCard
          ><HCard
            title="A place for every input."
            description="Help text, error states, native validation, and a comfortable focus ring."
            ><form
              class="form-stack"
              @submit.prevent="
                notify('Valid form. Your app takes it from here.')
              "
            >
              <HInput
                v-model="controlLabel"
                name="appName"
                label="Application name"
                hint="A name that feels familiar."
                :error="
                  controlError ? 'Give this app a name you recognize.' : ''
                "
                required
              /><HSelect
                v-model="controlSelect"
                name="category"
                label="Category"
                :options="[
                  { value: 'media', label: 'Media' },
                  { value: 'home', label: 'Home' },
                  { value: 'development', label: 'Development' },
                ]"
              /><HSwitch
                v-model="controlSwitch"
                name="visible"
                label="Public dashboard"
                description="Let visitors see a read-only page."
              />
              <div class="component-row">
                <HButton type="submit" variant="primary"
                  >Save preferences</HButton
                ><HButton @click="controlError = !controlError"
                  >Toggle error state</HButton
                >
              </div>
            </form></HCard
          ><HCard
            title="Feedback that makes sense."
            description="State is communicated with words as well as color."
            ><div class="component-row">
              <HBadge
                v-for="tone in [
                  'neutral',
                  'accent',
                  'success',
                  'warning',
                  'danger',
                  'info',
                ] as const"
                :key="tone"
                :tone="tone"
                :label="tone"
                dot
              />
            </div>
            <div class="spacer" />
            <HAlert
              title="Everything is in its place."
              description="Your preferences have been saved."
              tone="success"
            />
            <div class="spacer" />
            <HButton @click="dialogOpen = true"
              >Open a real dialog</HButton
            ></HCard
          ><HCard
            title="A little progressive disclosure."
            description="Arrow keys, Home, and End work just as you expect."
            ><HTabs
              v-model="tab"
              :items="[
                { value: 'preview', label: 'Preview' },
                { value: 'source', label: 'Source' },
                { value: 'unavailable', label: 'Coming later', disabled: true },
              ]"
              label="Component example"
              ><template #preview
                ><p class="muted">
                  A calm surface for the detail that matters right now.
                </p></template
              ><template #source>
                <pre><code>&lt;HTabs v-model="selected" :items="tabs" /&gt;</code></pre>
              </template></HTabs
            ></HCard
          >
        </div>
        <HEmptyState
          v-if="!filteredCatalog.length"
          title="No matching components."
          description="Try another name or category."
          icon="search"
          ><HButton
            @click="
              catalogSearch = '';
              catalogFilter = 'All';
            "
            >Reset filters</HButton
          ></HEmptyState
        >
        <ExpandedExamples id="expanded-components" @notice="notify" />
        <section class="api-section">
          <h2>The component API</h2>
          <p class="muted">
            The same props work in Vue and as properties on a custom element.
            HTML attributes use kebab-case.
          </p>
          <div class="api-list">
            <details v-for="component in filteredCatalog" :key="component.name">
              <summary>
                <span
                  ><strong>{{ component.name }}</strong
                  ><code>&lt;{{ component.tag }}&gt;</code></span
                ><HBadge :label="component.category" />
              </summary>
              <p>{{ component.description }}</p>
              <dl>
                <div>
                  <dt>Props</dt>
                  <dd>{{ component.props }}</dd>
                </div>
                <div>
                  <dt>Events</dt>
                  <dd>{{ component.events }}</dd>
                </div>
                <div>
                  <dt>Slots</dt>
                  <dd>{{ component.slots }}</dd>
                </div>
                <div>
                  <dt>CSS parts</dt>
                  <dd>{{ component.parts }}</dd>
                </div>
              </dl>
            </details>
          </div>
        </section>
      </template>
      <template v-else-if="route === 'themes'">
        <section class="page-intro">
          <HPageHeader
            title="Set your own atmosphere."
            description="Start with Sunset. Change as much or as little as you like. These controls theme the entire showcase."
            eyebrow="The theme studio"
            ><HButton icon="copy" variant="primary" @click="exportOpen = true"
              >Export your theme</HButton
            ><HButton @click="resetTheme">Reset to Sunset</HButton></HPageHeader
          >
        </section>
        <div class="theme-studio">
          <HCard
            title="Your starting point"
            description="Color, geometry, and character."
            ><div class="form-stack">
              <HSelect
                :model-value="theme"
                label="Palette"
                :options="themeOptions"
                @update:model-value="selectTheme"
              /><HSelect
                :model-value="mode"
                label="Color mode"
                :options="modeOptions"
                @update:model-value="mode = $event as Mode"
              /><HInput
                v-model="brand"
                label="Your brand name"
                hint="Used on the dashboard and login page."
              /><HSwitch
                :model-value="density === 'compact'"
                label="Compact density"
                description="A little more room for information. Controls retain a 40px minimum."
                @update:model-value="
                  density = $event ? 'compact' : 'comfortable'
                "
              /><label class="range-label"
                >Corner radius
                <input
                  type="range"
                  min="0"
                  max="20"
                  :value="parseInt(resolved['--h-radius-control'] || '10')"
                  @input="
                    (e) => {
                      const n = Number((e.target as HTMLInputElement).value);
                      overrides = {
                        ...overrides,
                        '--h-radius-control': `${n}px`,
                        '--h-radius-card': `${n + 6}px`,
                        '--h-radius-panel': `${n + 10}px`,
                      };
                    }
                  "
              /></label>
              <div class="color-inputs">
                <label
                  v-for="[key, label] in [
                    ['--h-accent', 'Accent'],
                    ['--h-on-accent', 'On accent'],
                    ['--h-accent-text', 'Accent text'],
                    ['--h-bg', 'Background'],
                    ['--h-surface', 'Surface'],
                    ['--h-text', 'Primary text'],
                    ['--h-muted', 'Secondary text'],
                  ]"
                  :key="key"
                  ><span>{{ label }}</span
                  ><input
                    type="color"
                    :aria-label="label"
                    :value="resolved[key as keyof ThemeTokens] || '#000000'"
                    @input="
                      setToken(
                        key as keyof ThemeTokens,
                        ($event.target as HTMLInputElement).value,
                      )
                    "
                /></label>
              </div></div
          ></HCard>
          <div class="theme-preview-stack">
            <HPageHeader
              title="Your apps."
              accent="A little closer."
              description="One coherent system, with your own character."
              variant="hero"
              :decoration="false"
              ><HButton variant="primary">Primary action</HButton
              ><HButton>Secondary action</HButton></HPageHeader
            >
            <div class="theme-preview-cards">
              <HAppCard
                name="Photo library"
                description="The moments worth coming back to."
                category="Media"
                status="healthy"
                source="Docker"
                editable
                :favorite="true"
                @favorite-change="
                  notify('Favorite state is controlled by the consuming app.')
                "
              /><HCard
                title="A familiar setting."
                description="Same geometry. Different atmosphere."
                ><div class="form-stack">
                  <HInput
                    label="Workspace name"
                    value="My little homelab"
                  /><HSwitch label="Keep it private" checked /><HButton
                    variant="primary"
                    >Save changes</HButton
                  >
                </div></HCard
              >
            </div>
            <HAlert
              tone="info"
              title="Full control is a CSS variable away."
              description="Every --h-* token is overridable. Use the exported values globally, on a theme island, or directly on a web component."
            />
            <div class="component-row">
              <HButton href="#login" icon="lock">Preview the auth page</HButton
              ><HButton href="#dashboard" icon="layout"
                >Preview the dashboard</HButton
              >
            </div>
          </div>
        </div>
        <section class="landing-section">
          <h2>Theme islands, side by side.</h2>
          <p class="muted">
            Presets can coexist on one page. Their variables stay scoped and
            reach nested shadow roots.
          </p>
          <div class="theme-islands">
            <HTheme theme="ocean" mode="dark"
              ><HCard title="Ocean · after dark"
                ><HButton variant="primary">Your blue period</HButton>
                <div class="spacer" />
                <HBadge label="Healthy" tone="success" dot /></HCard></HTheme
            ><HTheme theme="forest" mode="light"
              ><HCard title="Forest · first light"
                ><HButton variant="primary">A breath of green</HButton>
                <div class="spacer" />
                <HBadge label="Healthy" tone="success" dot /></HCard
            ></HTheme>
          </div>
        </section>
      </template>
      <template v-else-if="route === 'guide'">
        <section class="page-intro">
          <HPageHeader
            title="Good foundations. Your own application."
            description="Pick the Vue components or the web components. Keep the same design language across your public pages, sign-in, and dashboard."
            eyebrow="Get started"
          />
        </section>
        <div class="guide-layout">
          <aside class="guide-nav">
            <a
              href="#guide"
              @click.prevent="
                document.getElementById('install')?.scrollIntoView()
              "
              >Installation</a
            ><a
              href="#guide"
              @click.prevent="
                document.getElementById('usage')?.scrollIntoView()
              "
              >Vue & web components</a
            ><a
              href="#guide"
              @click.prevent="
                document.getElementById('theming')?.scrollIntoView()
              "
              >Theming</a
            ><a
              href="#guide"
              @click.prevent="
                document.getElementById('forms')?.scrollIntoView()
              "
              >Forms & events</a
            ><a
              href="#guide"
              @click.prevent="
                document.getElementById('composition')?.scrollIntoView()
              "
              >Page composition</a
            >
          </aside>
          <article class="guide-body">
            <section id="install">
              <h2>Install the release package</h2>
              <p>
                Use the built npm-compatible tarball from GitHub Releases. An
                npm registry publication is not required.
              </p>
              <pre><code>npm install https://github.com/samishal1998/hearth-ui/releases/download/v0.2.0/samishal1998-hearth-ui-0.2.0.tgz</code></pre>
              <p>
                Vue applications also need <code>vue@^3.5</code>. The
                web-component build bundles its own Vue runtime and does not
                require Vue in the host framework.
              </p>
              <HButton
                href="https://github.com/samishal1998/hearth-ui/releases"
                target="_blank"
                icon="launch"
                >Release downloads</HButton
              >
            </section>
            <section id="usage">
              <h2>One source. Two ways in.</h2>
              <div class="component-row">
                <HButton
                  :variant="docFramework === 'vue' ? 'primary' : 'secondary'"
                  @click="docFramework = 'vue'"
                  >Native Vue</HButton
                ><HButton
                  :variant="
                    docFramework === 'elements' ? 'primary' : 'secondary'
                  "
                  @click="docFramework = 'elements'"
                  >Web components</HButton
                >
              </div>
              <pre><code>{{docFramework==='vue'?vueExample:wcExample}}</code></pre>
              <p>
                With a bundler, import custom elements from
                <code>@samishal1998/hearth-ui/elements</code> and tokens from
                <code>@samishal1998/hearth-ui/themes.css</code>. For plain HTML,
                download and extract the package, then load
                <code>dist/elements/auto.js</code> as a module and
                <code>dist/themes.css</code> as a stylesheet.
              </p>
              <div class="component-row">
                <HButton href="elements.html" icon="globe"
                  >Vanilla HTML example</HButton
                ><HButton href="react.html" icon="code"
                  >React 19 example</HButton
                >
              </div>
            </section>
            <section id="theming">
              <h2>Theme with variables, not rewrites.</h2>
              <p>
                Sunset is the default palette. Ocean, Forest, Dusk, and Rose
                share the same visual geometry. Every preset has light and dark modes;
                <code>system</code> follows the browser's preference through
                CSS.
              </p>
              <pre><code>&lt;HTheme theme="sunset" mode="dark" :tokens="{
  '--h-accent': '#ff7a2f',
  '--h-radius-control': '10px',
  '--h-font': 'Inter, system-ui, sans-serif'
}"&gt;
  &lt;HAuthPage brand="homestead" /&gt;
&lt;/HTheme&gt;</code></pre>
              <p>
                Or set <code>data-hearth-theme</code>,
                <code>data-hearth-mode</code>, and
                <code>data-hearth-density</code> on an HTML ancestor. CSS
                variables inherit through shadow DOM. Scope overrides to one
                island or one element without changing your whole app.
              </p>
              <p>
                <code>::part()</code> provides targeted styling for the
                structural parts listed in the component catalog. Native Vue
                components use the same <code>h-*</code> classes and token
                contract.
              </p>
              <HButton href="#themes" icon="settings"
                >Open the theme studio</HButton
              >
            </section>
            <section id="forms">
              <h2>Real forms. Predictable events.</h2>
              <p>
                Native Vue inputs support <code>v-model</code>. Custom-element
                inputs, selects, switches, and buttons use
                <code>ElementInternals</code> to participate in a surrounding
                HTML form: names, FormData, validation, reset, disabled
                fieldsets, and Enter-to-submit all work.
              </p>
              <p>
                Place the form and its field elements in the same DOM tree. A
                native form outside a shadow root cannot own a native input
                inside it; the provided web-component adapters bridge this
                deliberately.
              </p>
              <pre><code>const field = document.querySelector('hearth-input')
field.addEventListener('change', event =&gt; {
  const [value] = event.detail
})

const select = document.querySelector('hearth-select')
select.options = [{ value: 'media', label: 'Media' }]</code></pre>
              <p>
                Vue's emitted web-component events use an array in
                <code>event.detail</code>. Listen directly on the custom
                element. Arrays and objects are DOM properties, not JSON
                attributes. Boolean attributes use presence/absence; use a
                property assignment for <code>false</code>.
              </p>
              <p>
                The default auth page emits
                <code>submit({ username, password })</code>. It never sends
                requests or stores credentials. Bind <code>loading</code> and
                <code>error</code> to your own authentication service. For OAuth
                or a different form, replace the whole <code>form</code> slot
                and own its submission.
              </p>
            </section>
            <section id="composition">
              <h2>A public front door. A private workspace.</h2>
              <p>
                Start with <code>HPublicShell</code> for your landing page and
                guide, <code>HAuthPage</code> for sign-in, and
                <code>HDashboardShell</code> for everything behind it. Named
                slots let you supply navigation, account actions, headers, and
                footer content.
              </p>
              <p>
                Shells emit navigation IDs and logout requests. They do not
                install a router or decide access control. Authentication,
                authorization, data fetching, storage, and app-specific
                interactions belong to your application.
              </p>
              <p>
                The Vue entry is SSR-importable. Web components render when
                connected in a browser; use the native Vue components when you
                need server-rendered page content. No declarative shadow-DOM
                hydration is claimed.
              </p>
              <p>
                Use current browsers with custom elements, shadow DOM,
                ElementInternals, native dialog, and color-mix support. Motion
                respects reduced-motion preferences. Custom palettes should be
                checked for contrast in your actual application.
              </p>
            </section>
          </article>
        </div>
      </template>
    </HPublicShell>
    <HDialog
      :open="dialogOpen"
      title="A little room for a decision."
      description="This is a native modal dialog. Try Tab, Shift+Tab, or Escape."
      @close="dialogOpen = false"
      ><HInput
        label="A name for your next project"
        placeholder="Something worth building"
      /><template #footer
        ><div class="dialog-actions">
          <HButton @click="dialogOpen = false">Cancel</HButton
          ><HButton
            variant="primary"
            @click="
              dialogOpen = false;
              notify('Saved in the demo.');
            "
            >Save changes</HButton
          >
        </div></template
      ></HDialog
    >
    <HDialog
      :open="exportOpen"
      title="Take the atmosphere with you."
      description="A resolved snapshot of the current theme. Apply it to your app's root or a scoped container."
      @close="exportOpen = false"
    >
      <pre class="theme-export"><code>{{exportCode}}</code></pre>
      <template #footer
        ><div class="dialog-actions">
          <HButton @click="exportOpen = false">Done</HButton
          ><HButton variant="primary" icon="copy" @click="copy(exportCode)"
            >Copy CSS</HButton
          >
        </div></template
      ></HDialog
    >
    <HDialog
      :open="addOpen"
      title="Add a little to your world."
      description="This demo stores applications in memory only."
      @close="addOpen = false"
      ><form class="form-stack" @submit="addApp">
        <HInput name="name" label="Application name" required /><HInput
          name="description"
          label="Description"
        />
        <div class="dialog-actions">
          <HButton @click="addOpen = false">Cancel</HButton
          ><HButton variant="primary" type="submit">Add application</HButton>
        </div>
      </form></HDialog
    >
    <HDialog
      :open="!!inspectName"
      :title="inspectName"
      description="An application card, ready for your own data."
      @close="inspectName = ''"
      ><p class="muted">
        Your app handles edit and inspect events. Hearth supplies the interface,
        not an infrastructure backend.
      </p>
      <template #footer
        ><div class="dialog-actions">
          <HButton @click="inspectName = ''">Done</HButton>
        </div></template
      ></HDialog
    >
  </HTheme>
</template>
