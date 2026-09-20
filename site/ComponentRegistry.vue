<script setup lang="ts">
import { computed, ref, watch, nextTick, onBeforeUnmount } from "vue";
import {
  HInput,
  HButton,
  HBadge,
  HPageHeader,
  HPagination,
  HEmptyState,
  HCodeBlock,
} from "../src";
import { catalog } from "./catalog";
import { examples } from "../scripts/agent-examples.mjs";
const props = defineProps<{ selected: string }>();
const query = ref(""),
  category = ref("All"),
  page = ref(1);
const host = ref<HTMLElement>();
const root = ref<HTMLElement>();
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
    const element = document.createElement(
      example.mountTag || selected.value.tag,
    );
    Object.assign(element, example.props || {});
    if (example.children) element.innerHTML = example.children;
    for (const event of [
      "change",
      "select",
      "submit",
      "action",
      "dismiss",
      "close",
      "update:modelValue",
    ])
      element.addEventListener(event, (e) => {
        const detail = (e as CustomEvent).detail;
        feedback.value = `${event}: ${JSON.stringify(detail ?? [])}`;
        if (event === "update:modelValue")
          Object.assign(element, { modelValue: detail?.[0] });
        if (event === "submit") e.preventDefault();
      });
    host.value.append(element);
  } catch {
    previewError.value = "The preview could not load. Try resetting it.";
  }
}
watch(
  () => props.selected,
  async (value, previous) => {
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
</script>
<template>
  <section ref="root" class="registry">
    <template v-if="selected"
      ><nav class="registry-back" aria-label="Component breadcrumb">
        <HButton href="#components" variant="ghost">← All components</HButton
        ><HBadge :label="selected.category" />
      </nav>
      <HPageHeader
        :title="selected.name"
        :description="selected.description"
        :eyebrow="`<${selected.tag}>`"
      />
      <div class="registry-detail">
        <section class="registry-panel" aria-label="Component preview">
          <div class="registry-panel-heading">
            <h2>Preview</h2>
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
          <div v-else ref="host" class="registry-preview" />
          <p v-if="previewError" role="alert">{{ previewError }}</p>
          <output class="registry-event" aria-live="polite">{{
            feedback
          }}</output>
        </section>
        <section class="registry-panel">
          <h2>API at a glance</h2>
          <dl>
            <div
              v-for="(value, key) in {
                Props: selected.props,
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
        <HCodeBlock
          v-if="recipe"
          title="Vue usage"
          language="vue"
          :code="vueCode"
        />
        <div class="registry-panel">
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
        ></HPageHeader
      >
      <p v-if="props.selected" role="status">
        That component was not found. Browse the registry below.
      </p>
      <div class="registry-layout">
        <aside class="registry-sidebar">
          <HInput
            v-model="query"
            label="Find a component"
            type="search"
            placeholder="Calendar, button, dialog…"
          />
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
          <a href="#recipes">Explore page recipes ↗</a>
        </aside>
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
              ><HBadge :label="component.category" />
              <h2>{{ component.name }}</h2>
              <p>{{ component.description }}</p>
              <code>&lt;{{ component.tag }}&gt;</code
              ><span class="registry-card-action"
                >Preview &amp; reference <span aria-hidden="true">↗</span></span
              ></a
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
  </section>
</template>
<style scoped>
.registry {
  padding-block: 32px 64px;
}
.registry-layout {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 32px;
  margin-top: 32px;
}
.registry-sidebar {
  align-self: start;
  position: sticky;
  top: 24px;
  display: grid;
  gap: 24px;
}
.registry-sidebar nav {
  display: grid;
  gap: 4px;
}
.registry-sidebar button {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid transparent;
  border-radius: var(--h-radius-control);
  background: none;
  color: var(--h-muted);
  font: inherit;
  text-align: start;
  cursor: pointer;
}
.registry-sidebar button[aria-pressed="true"] {
  color: var(--h-accent-text);
  background: var(--h-accent-subtle);
  border-color: var(--h-border);
}
.registry-sidebar button:hover {
  background: var(--h-raised);
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
  gap: 12px;
  padding: 24px;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  color: var(--h-text);
  background: var(--h-panel);
  text-decoration: none;
  min-width: 0;
}
.registry-card:hover {
  border-color: var(--h-border-strong);
  background: var(--h-raised);
}
.registry-card h2 {
  font-size: 17px;
  margin: 0;
  overflow-wrap: anywhere;
}
.registry-card p {
  font-size: 13px;
  line-height: 1.8;
  margin: 0;
  color: var(--h-muted);
  text-wrap: pretty;
}
.registry-card code {
  font-size: 10px;
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
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
}
.registry-detail,
.registry-usage {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 24px;
}
.registry-panel {
  padding: 24px;
  min-width: 0;
  border: 1px solid var(--h-border);
  border-radius: var(--h-radius-card);
  background: var(--h-panel);
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
  margin-bottom: 24px;
}
.registry-panel-heading h2 {
  margin: 0;
}
.registry-preview {
  min-height: 140px;
  min-width: 0;
  isolation: isolate;
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
  .registry-layout,
  .registry-detail,
  .registry-usage {
    grid-template-columns: 1fr;
  }
  .registry-sidebar {
    position: static;
  }
  .registry-sidebar nav {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .registry-sidebar button {
    gap: 8px;
    padding: 10px;
  }
  .registry-grid {
    grid-template-columns: 1fr;
  }
  .registry-card,
  .registry-panel {
    padding: 20px;
  }
}
</style>
