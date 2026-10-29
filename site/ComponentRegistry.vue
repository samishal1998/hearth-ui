<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from "vue";
import {
  HInput,
  HButton,
  HBadge,
  HPageHeader,
  HPagination,
  HEmptyState,
  HNumberInput,
  HTabs,
  HSelect,
  HCodeSnippet,
  HKeyboardKey,
} from "../src";
import RegistryThumbnail from "./RegistryThumbnail.vue";
import { catalog, mobileOverlayComponents } from "./catalog";
import { examples } from "../scripts/agent-examples.mjs";
const props = defineProps<{ selected: string }>();
const query = ref(""),
  category = ref("All"),
  page = ref(1);
const host = ref<HTMLElement>();
const root = ref<HTMLElement>();
const mobileBreakpoint = ref<number | null>(640);
const frameWidth = ref("100%");
const sidebarOpen = ref(false);
const previewTab = ref("preview");
const grouped = computed(() =>
  categories
    .filter((group) => group !== "All")
    .map((group) => ({
      label: group,
      items: filtered.value.filter((item) => item.category === group),
    }))
    .filter((group) => group.items.length),
);
const configurableOverlay = computed(
  () =>
    !!selected.value &&
    mobileOverlayComponents.has(selected.value.name) &&
    !["HTheme", "HInput"].includes(selected.value.name),
);
const feedback = ref(""),
  previewError = ref("");
const categories = ["All", ...new Set(catalog.map((c) => c.category))];
const filtered = computed(() =>
  catalog
    .filter(
      (c) =>
        (category.value === "All" || c.category === category.value) &&
        `${c.name} ${c.tag} ${c.description}`
          .toLowerCase()
          .includes(query.value.toLowerCase().trim()),
    )
    .sort((a, b) => a.name.localeCompare(b.name)),
);
const selected = computed(() => catalog.find((c) => c.name === props.selected));
const recipe = computed(() =>
  selected.value ? examples[selected.value.name] : undefined,
);
const items = computed(() =>
  filtered.value.slice((page.value - 1) * 12, page.value * 12),
);
watch([query, category], () => (page.value = 1));
const recipeRoutes: Record<string, string> = {
  HAuthPage: "auth",
  HSettingsPage: "settings",
  HProviderSetup: "provider",
  HResourceDetail: "resource",
  HStatusPage: "status",
  HErrorPage: "error",
  HFirstRunSetup: "setup",
};
const pageRecipe = computed(() =>
  selected.value ? recipeRoutes[selected.value.name] : undefined,
);
let generation = 0;
async function preview() {
  const token = ++generation;
  feedback.value = "";
  previewError.value = "";
  await nextTick();
  host.value?.replaceChildren();
  if (!selected.value || !recipe.value || pageRecipe.value || !host.value)
    return;
  try {
    const { registerElements } = await import("@hearth/elements");
    if (token !== generation || !host.value) return;
    registerElements();
    const example = recipe.value;
    const element = document.createElement(selected.value.tag);
    Object.assign(element, example.props || {});
    if (example.children) element.innerHTML = example.children;
    element.addEventListener("select", (event) => {
      if (
        [
          "HBarChart",
          "HStackedBarChart",
          "HDivergingBarChart",
          "HStackedWaveform",
        ].includes(selected.value?.name || "")
      )
        Object.assign(element, {
          selected: (event as CustomEvent).detail?.[0],
        });
    });
    for (const event of [
      "change",
      "select",
      "submit",
      "action",
      "dismiss",
      "close",
      "update:modelValue",
      "update:open",
    ])
      element.addEventListener(event, (e) => {
        const detail = (e as CustomEvent).detail;
        feedback.value = `${event}: ${JSON.stringify(detail ?? [])}`;
        if (event === "update:modelValue")
          Object.assign(element, { modelValue: detail?.[0] });
        if (event === "update:open")
          Object.assign(element, { open: detail?.[0] });
        if (event === "close" && "open" in element)
          Object.assign(element, { open: false });
        if (event === "submit") e.preventDefault();
      });
    if (example.mountTag) {
      const mount = document.createElement(example.mountTag);
      mount.append(element);
      host.value.append(mount);
    } else host.value.append(element);
    const opener: Record<string, string> = {
      HDialog: "Open dialog",
      HSheet: "Open sheet",
      HCommandPalette: "Open command palette",
      HAlertDialog: "Open confirmation",
      HPane: "Open inspector",
    };
    if (opener[selected.value.name]) {
      const trigger = document.createElement("hearth-button");
      trigger.textContent = opener[selected.value.name];
      trigger.addEventListener("click", () =>
        Object.assign(element, { open: true }),
      );
      host.value.prepend(trigger);
    }
  } catch {
    previewError.value = "The preview could not load. Try resetting it.";
  }
}
watch(
  () => props.selected,
  async (value, previous) => {
    previewTab.value = "preview";
    sidebarOpen.value = false;
    await preview();
    if (value !== props.selected || previous === undefined) return;
    const heading = root.value?.querySelector("h1");
    if (heading) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  },
  { immediate: true },
);
onBeforeUnmount(() => generation++);
const vueCode = computed(() =>
  recipe.value
    ? `<script setup lang="ts">\n${recipe.value.script ? "import { ref } from 'vue';\n" : ""}import { ${[selected.value!.name, ...(recipe.value.imports || [])].join(", ")} } from '@hearth-ui/vue';\nimport '@hearth-ui/vue/styles.css';\n${recipe.value.script || ""}\n<\/script>\n\n<template>\n  ${recipe.value.vue}\n</template>`
    : "",
);
const elementCode = computed(() =>
  recipe.value && selected.value
    ? `<div id="example"></div>\n<script type="module">\nimport { registerElements } from '@hearth-ui/elements';\nimport '@hearth-ui/elements/themes.css';\nregisterElements();\nconst element = document.createElement('${selected.value.tag}');\nObject.assign(element, ${JSON.stringify(recipe.value.props || {}, null, 2)});\n${recipe.value.children ? `element.innerHTML = ${JSON.stringify(recipe.value.children)}; // Static markup only.\n` : ""}document.querySelector('#example').append(element);\n<\/script>`
    : "",
);
const usageOptions = computed(() => [
  { id: "vue", label: "Vue", language: "vue", code: vueCode.value },
  {
    id: "elements",
    label: "Web components",
    language: "html",
    code: elementCode.value,
  },
]);
const apiRows = computed(
  () =>
    selected.value?.props.split(" · ").map((text) => {
      const index = text.indexOf(":");
      return {
        name: index < 0 ? text : text.slice(0, index),
        detail:
          index < 0
            ? "See the complete reference for types and defaults."
            : text.slice(index + 1).trim(),
      };
    }) || [],
);
</script>
<template>
  <section ref="root" class="registry">
    <div class="registry-doc-layout">
      <aside class="registry-sidebar">
        <a class="registry-home" href="#components"
          >Component library <span>{{ catalog.length }}</span></a
        >
        <HInput
          v-model="query"
          label="Find a component"
          type="search"
          placeholder="Search components…"
        />
        <button
          type="button"
          class="registry-nav-toggle"
          :aria-expanded="sidebarOpen"
          aria-controls="registry-navigation"
          @click="sidebarOpen = !sidebarOpen"
        >
          Browse components
        </button>
        <div
          id="registry-navigation"
          class="registry-navigation"
          :class="{ 'is-open': sidebarOpen }"
        >
          <nav aria-label="Component categories">
            <button
              v-for="group in categories"
              :key="group"
              type="button"
              :aria-pressed="category === group"
              @click="category = group"
            >
              {{ group
              }}<span>{{
                group === "All"
                  ? catalog.length
                  : catalog.filter((c) => c.category === group).length
              }}</span>
            </button>
          </nav>
          <nav
            v-if="selected"
            class="registry-component-nav"
            aria-label="Components"
          >
            <section v-for="group in grouped" :key="group.label">
              <h2>{{ group.label }}</h2>
              <a
                v-for="component in group.items"
                :key="component.name"
                :href="`#components/${component.name}`"
                :aria-current="
                  component.name === selected.name ? 'page' : undefined
                "
                >{{ component.name.slice(1) }}</a
              >
            </section>
            <p v-if="!filtered.length">No components match your search.</p>
          </nav>
        </div>
        <a href="#recipes">Page recipes ↗</a>
      </aside>
      <div class="registry-main">
        <template v-if="selected"
          ><nav class="registry-back" aria-label="Component breadcrumb">
            <HButton href="#components" variant="ghost"
              >← All components</HButton
            ><HBadge :label="selected.category" /><HBadge
              label="Hearth UI 0.9"
              tone="accent"
            />
          </nav>
          <HPageHeader
            :title="selected.name"
            :description="selected.description"
            :eyebrow="`<${selected.tag}>`"
          />
          <nav class="registry-outline" aria-label="On this page">
            <button
              type="button"
              @click="
                root?.querySelector('#registry-preview')?.scrollIntoView()
              "
            >
              Preview</button
            ><button
              type="button"
              @click="root?.querySelector('#registry-api')?.scrollIntoView()"
            >
              API</button
            ><button
              type="button"
              @click="root?.querySelector('#registry-notes')?.scrollIntoView()"
            >
              Usage notes
            </button>
          </nav>
          <div class="registry-detail">
            <section
              id="registry-preview"
              class="registry-panel registry-preview-panel"
              aria-label="Component preview"
            >
              <HTabs
                v-model="previewTab"
                label="Example view"
                variant="underline"
                :items="[
                  { value: 'preview', label: 'Preview' },
                  { value: 'code', label: 'Code' },
                ]"
              >
                <template #preview>
                  <div class="registry-panel-heading">
                    <HSelect
                      v-model="frameWidth"
                      label="Preview frame width"
                      :options="[
                        { value: '100%', label: 'Fill available space' },
                        { value: '360px', label: 'Narrow · 360px' },
                        { value: '768px', label: 'Wide · 768px' },
                      ]"
                      size="compact"
                    />
                    <HButton v-if="!pageRecipe" size="compact" @click="preview"
                      >Reset preview</HButton
                    >
                  </div>
                  <p v-if="pageRecipe" class="registry-recipe">
                    This page recipe has a full-size interactive preview.
                  </p>
                  <HButton
                    v-if="pageRecipe"
                    :href="`#recipe-${pageRecipe}`"
                    variant="primary"
                    >Open page preview</HButton
                  >
                  <template v-else
                    ><HNumberInput
                      v-if="configurableOverlay"
                      v-model="mobileBreakpoint"
                      class="registry-breakpoint"
                      label="Mobile breakpoint (px)"
                      :min="0"
                      hint="Resize the window, or increase this value to preview mobile behavior. Set 0 for desktop." />
                    <div class="registry-preview-stage">
                      <div
                        ref="host"
                        class="registry-preview"
                        :style="{
                          width: frameWidth,
                          '--h-mobile-breakpoint': `${mobileBreakpoint ?? 640}px`,
                        }"
                      /></div
                  ></template>
                  <p v-if="previewError" role="alert">{{ previewError }}</p>
                  <output class="registry-event" aria-live="polite">{{
                    feedback
                  }}</output>
                  <p class="registry-preview-hint">
                    Try keyboard focus and resizing. Frame width constrains
                    content; overlay breakpoints follow the browser viewport.
                  </p> </template
                ><template #code
                  ><HCodeSnippet
                    :options="usageOptions"
                    label="Example framework"
                    :max-height="'520px'"
                /></template>
              </HTabs>
            </section>
            <section id="registry-api" class="registry-panel">
              <h2>API at a glance</h2>
              <div
                class="registry-api-scroll"
                tabindex="0"
                role="region"
                aria-label="Component properties"
              >
                <table>
                  <thead>
                    <tr>
                      <th scope="col">Property</th>
                      <th scope="col">Type / default</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in apiRows" :key="row.name">
                      <th scope="row">
                        <code>{{ row.name }}</code>
                      </th>
                      <td>{{ row.detail }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <dl>
                <div
                  v-for="(value, key) in {
                    Events: selected.events,
                    Slots: selected.slots,
                    'CSS parts': selected.parts,
                  }"
                  :key="key"
                >
                  <dt>{{ key }}</dt>
                  <dd>{{ value }}</dd>
                </div>
              </dl>
              <a :href="`docs/components/${selected.tag.slice(7)}/llms.txt`"
                >Complete component reference ↗</a
              >
            </section>
          </div>
          <section class="registry-usage">
            <div id="registry-notes" class="registry-panel">
              <h2>Usage notes</h2>
              <ul>
                <li v-for="note in recipe?.notes" :key="note">{{ note }}</li>
              </ul>
              <nav
                v-if="recipe?.related?.length"
                class="registry-related"
                aria-label="Related components"
              >
                <a
                  v-for="name in recipe.related"
                  :key="name"
                  :href="`#components/${name}`"
                  >{{ name }}</a
                >
              </nav>
              <p class="registry-preview-hint">
                Keyboard: <HKeyboardKey :keys="['Tab']" /> moves between
                controls. Arrow keys navigate composite widgets.
                <HKeyboardKey :keys="['Esc']" label="Escape" /> dismisses
                overlays. Use visible labels, names for icon-only actions, and
                native elements before adding ARIA.
              </p>
            </div>
          </section>
        </template>
        <template v-else
          ><HPageHeader
            title="Find the right component."
            :description="`${catalog.length} components. Browse by purpose, then open a focused preview and API reference.`"
            eyebrow="Component registry"
            ><HButton href="#examples" trailing-icon="arrow"
              >Browse composed examples</HButton
            ><HButton href="#technical"
              >Developer & diagrams</HButton
            ></HPageHeader
          >
          <p v-if="props.selected" role="status">
            That component was not found. Browse the registry below.
          </p>
          <div class="registry-layout">
            <div class="registry-results">
              <p class="registry-count" role="status">
                {{ filtered.length }}
                {{ filtered.length === 1 ? "component" : "components"
                }}{{ category !== "All" ? ` in ${category}` : "" }}
              </p>
              <div class="registry-grid">
                <a
                  v-for="component in items"
                  :key="component.name"
                  class="registry-card"
                  :href="`#components/${component.name}`"
                  ><RegistryThumbnail
                    :name="component.name"
                    :tag="component.tag"
                    :category="component.category"
                  />
                  <div class="registry-card-copy">
                    <HBadge :label="component.category" />
                    <h2>{{ component.name }}</h2>
                    <p>{{ component.description }}</p>
                    <code>&lt;{{ component.tag }}&gt;</code
                    ><span class="registry-card-action"
                      >Preview &amp; reference
                      <span aria-hidden="true">↗</span></span
                    >
                  </div></a
                >
              </div>
              <HEmptyState
                v-if="!filtered.length"
                title="No matching components."
                description="Try another name or category."
                icon="search"
                ><HButton
                  @click="
                    query = '';
                    category = 'All';
                  "
                  >Reset filters</HButton
                ></HEmptyState
              ><HPagination
                v-if="filtered.length > 12"
                v-model="page"
                :total="filtered.length"
                :page-size="12"
                label="Registry pages"
              />
            </div>
          </div>
        </template>
      </div>
    </div>
  </section>
</template>
<style scoped>
.registry {
  padding-block: 32px 64px;
}
.registry-layout {
  display: block;
  margin-top: 28px;
}
.registry-sidebar {
  align-self: start;
  position: sticky;
  display: grid;
  gap: 18px;
  top: 20px;
  height: calc(100dvh - 40px);
  max-height: calc(100dvh - 40px);
  grid-template-rows: auto auto minmax(0, 1fr) auto;
  background: var(--h-bg);
}
.registry-sidebar nav {
  display: grid;
  gap: 2px;
}
.registry-sidebar button {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  min-height: 36px;
  padding: 7px 10px;
  border: 1px solid transparent;
  border-radius: var(--h-radius-control);
  background: none;
  color: var(--h-muted);
  font: 12px var(--h-font);
  text-align: start;
  cursor: pointer;
}
.registry-sidebar button[aria-pressed="true"] {
  color: var(--h-accent-text);
  background: var(--h-accent-subtle);
  border-color: var(--h-border);
}
.registry-sidebar button span,
.registry-count {
  font-variant-numeric: tabular-nums;
}
.registry-count {
  margin: 0 0 16px;
  color: var(--h-muted);
  font-size: 12px;
}
.registry-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}
.registry-card {
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  gap: 0;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  color: var(--h-text);
  background: var(--h-surface);
  text-decoration: none;
  min-width: 0;
}
.registry-card h2 {
  font-size: 17px;
  margin: 0;
  overflow-wrap: anywhere;
}
.registry-card p {
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
  color: var(--h-muted);
  text-wrap: pretty;
}
.registry-card code {
  font-size: 12px;
  color: var(--h-faint);
  overflow-wrap: anywhere;
}
.registry-card-action {
  padding-top: 8px;
  margin-top: auto;
  display: flex;
  width: 100%;
  justify-content: space-between;
  font-size: 12px;
  color: var(--h-accent-text);
}
.registry a:focus-visible,
.registry button:focus-visible {
  outline: var(--h-focus-width) solid var(--h-focus);
  outline-offset: 3px;
}
.registry-back {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}
.registry-detail,
.registry-usage {
  display: block;
  margin-top: 24px;
}
.registry-panel {
  margin-top: 24px;
  padding: 24px;
  min-width: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-surface);
  scroll-margin-top: 24px;
}
.registry-panel h2 {
  font-size: 16px;
  margin: 0 0 16px;
}
.registry-panel-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-block: 16px;
}
.registry-panel-heading h2 {
  margin: 0;
}
.registry-preview {
  min-height: 180px;
  min-width: 0;
  isolation: isolate;
  margin-inline: auto;
  max-width: 100%;
  transition: width var(--h-motion-enter) var(--h-ease);
}
.registry-breakpoint {
  max-width: 360px;
  margin-bottom: 24px;
}
.registry-event {
  display: block;
  font: 11px/1.7 var(--h-font-mono);
  overflow-wrap: anywhere;
  color: var(--h-muted);
  margin-top: 16px;
}
.registry-panel dl {
  margin: 0 0 24px;
  display: grid;
  gap: 18px;
}
.registry-panel dt {
  font-weight: 550;
  font-size: 12px;
  margin-bottom: 4px;
}
.registry-panel dd {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 12px;
  line-height: 1.8;
  color: var(--h-muted);
}
.registry-panel li,
.registry-recipe {
  font-size: 13px;
  line-height: 1.8;
  color: var(--h-muted);
}
.registry-panel ul {
  padding-inline-start: 18px;
  display: grid;
  gap: 12px;
}
.registry-related {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.registry-panel a,
.registry-sidebar > a {
  color: var(--h-accent-text);
  font-size: 12px;
}
.registry-usage > :first-child {
  min-width: 0;
}
@media (min-width: 1400px) {
  .registry-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .registry-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .registry-sidebar button {
    gap: 8px;
    padding: 10px;
  }
}
.registry-doc-layout {
  display: grid;
  grid-template-columns: 230px minmax(0, 1fr);
  gap: 40px;
  align-items: start;
}
.registry-main {
  min-width: 0;
}
.registry-home {
  display: flex;
  justify-content: space-between;
  text-decoration: none;
  font-weight: 600;
  color: var(--h-text) !important;
}
.registry-home span {
  font-size: 11px;
  color: var(--h-muted);
}
.registry-navigation {
  overflow: auto;
  min-height: 0;
  scrollbar-width: thin;
  padding: 3px;
}
.registry-component-nav section {
  margin-top: 22px;
}
.registry-component-nav h2 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: var(--h-muted);
  padding-inline: 10px;
  margin: 0 0 8px;
}
.registry-component-nav a {
  display: block;
  border-inline-start: 2px solid transparent;
  padding: 6px 12px;
  color: var(--h-muted);
  font-size: 12px;
  text-decoration: none;
  border-radius: 0 5px 5px 0;
  overflow-wrap: anywhere;
}
.registry-component-nav a[aria-current="page"] {
  color: var(--h-accent-text);
  border-color: var(--h-accent);
  background: var(--h-accent-subtle);
}
.registry-nav-toggle {
  display: none !important;
}
.registry-panel-heading > .h-field {
  width: 220px;
}
.registry-preview-stage {
  background: var(--h-bg);
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-control);
  padding: 24px;
  overflow: auto;
  max-width: 100%;
}
.registry-preview-hint {
  font-size: 12px;
  color: var(--h-muted);
  line-height: 1.8;
  margin-top: 16px;
}
.registry-outline {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 18px;
}
.registry-outline button {
  border: 0;
  border-bottom: 1px solid var(--h-border);
  padding: 7px 0;
  color: var(--h-muted);
  background: none;
  font: 12px var(--h-font);
  cursor: pointer;
}
.registry-api-scroll {
  overflow: auto;
  margin-bottom: 24px;
}
.registry-api-scroll table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  font-size: 12px;
}
.registry-api-scroll th,
.registry-api-scroll td {
  padding: 12px;
  text-align: start;
  vertical-align: top;
  border-bottom: 1px solid var(--h-border);
  overflow-wrap: anywhere;
  line-height: 1.7;
}
.registry-api-scroll thead {
  color: var(--h-muted);
  background: var(--h-raised);
}
.registry-api-scroll th:first-child {
  width: 32%;
}
.registry-card-copy {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
}
.registry-card-copy > .h-badge {
  align-self: flex-start;
}
@media (hover: hover) {
  .registry-card:hover {
    border-color: var(--h-border-strong);
    background: var(--h-raised);
  }
  .registry-sidebar button:hover {
    background: var(--h-raised);
  }
  .registry-component-nav a:hover {
    background: var(--h-raised);
    color: var(--h-text);
  }
}
@media (prefers-reduced-motion: no-preference) {
  .registry-card {
    transition:
      border-color var(--h-motion),
      box-shadow var(--h-motion);
  }
  .registry-card:hover {
    box-shadow: var(--h-shadow-soft);
  }
}
@media (max-width: 1000px) {
  .registry-doc-layout {
    grid-template-columns: 200px minmax(0, 1fr);
    gap: 24px;
  }
  .registry-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 760px) {
  .registry-doc-layout {
    grid-template-columns: minmax(0, 1fr);
    gap: 24px;
  }
  .registry-sidebar {
    position: static;
    height: auto;
    max-height: none;
    gap: 12px;
    grid-template-rows: none;
  }
  .registry-navigation:not(.is-open) {
    display: none;
  }
  .registry-navigation {
    max-height: 320px;
  }
  .registry-sidebar .registry-component-nav {
    display: block;
  }
  .registry-nav-toggle {
    display: flex !important;
    border-color: var(--h-border) !important;
  }
  .registry-panel,
  .registry-preview-stage {
    padding: 16px;
  }
  .registry-grid {
    grid-template-columns: 1fr;
  }
  .registry-back {
    gap: 8px;
  }
  .registry-api-scroll table {
    min-width: 420px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .registry-preview {
    transition: none;
  }
}
</style>
