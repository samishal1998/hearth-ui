import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import {
  root,
  read,
  loadTypeScript,
  apiSource,
  sharedTypes,
} from "./component-api.mjs";
import { examples } from "./agent-examples.mjs";
export { root };

const categories = [
  "Layouts",
  "Controls",
  "Surfaces",
  "Feedback",
  "Foundation",
];
const sourceURL = "https://github.com/samishal1998/hearth-ui/blob/main/";
const slug = (c) => c.tag.slice("hearth-".length);
const docPath = (c) => `docs/components/${slug(c)}/llms.txt`;
const fence = (language, code) => `\`\`\`${language}\n${code.trim()}\n\`\`\``;

export async function renderAgentDocs() {
  const { catalog } = await loadTypeScript("site/catalog.ts");
  const { themes } = await loadTypeScript("src/themes.ts");
  const { version } = JSON.parse(read("package.json"));
  const vuePackage = JSON.parse(read("packages/vue/package.json")).name;
  const elementsPackage = JSON.parse(
    read("packages/elements/package.json"),
  ).name;
  const shared = sharedTypes();
  const names = new Set(catalog.map((c) => c.name));
  if (names.size !== catalog.length)
    throw new Error("Duplicate component names in catalog");
  if (Object.keys(examples).some((name) => !names.has(name)))
    throw new Error("An agent recipe refers to an uncataloged component");
  const files = new Map();
  for (const component of catalog) {
    if (
      !/^H[A-Z][A-Za-z]+$/.test(component.name) ||
      !/^hearth-[a-z]+(?:-[a-z]+)*$/.test(component.tag)
    )
      throw new Error("Unsafe component name or tag");
    const recipe = examples[component.name];
    if (!recipe) throw new Error(`Add an agent recipe for ${component.name}`);
    const source = apiSource(component.name, shared);
    const mobileNote = `${source.props} ${source.types}`.includes(
      "mobileBreakpoint",
    )
      ? "mobileBreakpoint sets the mobile viewport threshold in CSS pixels. Per-component props override the inherited --h-mobile-breakpoint value from HTheme; the fallback is 640px. Set 0 to keep desktop presentation. The breakpoint updates live across Vue and custom-element shadow roots."
      : "";
    const fieldNote = `${source.props} ${source.types}`.includes("hideLabel")
      ? "hideLabel visually hides the label while retaining the accessible name; keep supplying label. size=compact provides dense desktop controls, with larger touch targets on coarse pointers. Without size, controls inherit theme density. --h-font-min-size supplies a 12px default floor for caption/helper text and field typography."
      : "";
    const imports = [...new Set([component.name, ...(recipe.imports || [])])];
    for (const name of [...imports, ...recipe.related])
      if (!names.has(name))
        throw new Error(`Unknown component reference: ${name}`);
    const vue = `<script setup lang="ts">\n${recipe.script?.includes("ref(") || recipe.script?.includes("ref<") ? "import { ref } from 'vue';\n" : ""}import { ${imports.join(", ")} } from '${vuePackage}';\nimport '${vuePackage}/styles.css';\n${recipe.script || ""}\n</script>\n\n<template>\n${recipe.vue
      .split("\n")
      .map((line) => "  " + line)
      .join("\n")}\n</template>`;
    const js = [
      `import { registerElements } from '${elementsPackage}';\nimport '${elementsPackage}/themes.css';\nregisterElements();`,
      `const mount = document.querySelector('#example');\nconst element = document.createElement('${component.tag}');\nObject.assign(element, ${JSON.stringify(recipe.props, null, 2)});`,
      recipe.children
        ? `element.innerHTML = ${JSON.stringify(recipe.children)}; // Static example markup only; never inject untrusted HTML.`
        : "",
      recipe.event
        ? `element.addEventListener('${recipe.event}', event => {\n  const [value] = event.detail;\n  // Update your application state using value.\n});`
        : "",
      recipe.js || "",
      "mount.append(element);",
    ]
      .filter(Boolean)
      .join("\n\n");
    const related = recipe.related
      .map((name) => {
        const c = catalog.find((c) => c.name === name);
        return `- [${name}](../${slug(c)}/llms.txt): ${c.description}`;
      })
      .join("\n");
    const body =
      [
        `# ${component.name}\n\n> ${component.description}`,
        `[Start with the Hearth UI agent index](../../../llms.txt). This describes repository source for version ${version}. Match documentation to your installed source/release.`,
        `## Identity\n\n- Vue export: \`${component.name}\` from \`${vuePackage}\`.\n- Custom element: \`<${component.tag}>\`.\n- Constructor: \`Hearth${component.name.slice(1)}Element\` from \`${elementsPackage}\`.\n- Category: ${component.category}.\n- [Implementation](${sourceURL}${source.path}).`,
        `## Choose and use it correctly\n\n${[
          ...recipe.notes,
          mobileNote,
          fieldNote,
        ]
          .filter(Boolean)
          .map((n) => "- " + n)
          .join("\n")}`,
        `## Public API\n\n${component.props}\n\nA \`?\` marks optional source props. Props with defaults may be omitted. Internal \`formDisabled\` and \`control-sync\` plumbing is excluded below; do not use it in application code.`,
        fence("ts", `type Props = ${source.props};`),
        "### Defaults",
        source.defaults.startsWith("No component")
          ? source.defaults
          : fence("ts", source.defaults),
        `### Events\n\n${component.events}`,
        source.events === "{}"
          ? ""
          : fence("ts", `type Emits = ${source.events};`),
        "Vue-emitted custom-element events expose argument arrays in `event.detail`. Listen on the element. Native events such as `click` retain their normal payloads. The elements package provides framework-independent DOM event types.",
        `### Slots\n\n${component.slots}\n\nVue uses \`<template #slotName>\`; custom elements use \`<div slot="slotName">\`. Web components do not support Vue scoped slots.`,
        `### CSS parts\n\n${component.parts}\n\nUse \`${component.tag}::part(part-name)\` for an exposed part or inherited \`--h-*\` tokens for shared styling. Native Vue components use the shared stylesheet and \`h-*\` classes.`,
        source.types
          ? "## Supporting types\n\n" + fence("ts", source.types)
          : "",
        "## Vue example",
        fence("vue", vue),
        "## Web-component example",
        "Provide a mount point. For field submission, use an owning native form; the auth page already contains its own form.",
        fence(
          "html",
          `<${recipe.mountTag || "div"} id="example"></${recipe.mountTag || "div"}>`,
        ),
        "This is bundler-based ESM. For raw HTML, load `dist/themes.css` with a link and import `registerElements` from `./dist/elements/index.js` instead. Initial array/object properties are assigned before connection to establish reset defaults.",
        fence("js", js),
        source.icons
          ? "## Available icon names\n\n" +
            source.icons.map((name) => "`" + name + "`").join(", ") +
            "."
          : "",
        component.name === "HTheme"
          ? "## Theme token reference\n\n" +
            fence("css", read("src/styles/themes.css"))
          : "",
        "## Related components\n\n" + related,
        "---\nGenerated by `npm run docs:generate` from component source, `site/catalog.ts`, and `scripts/agent-examples.mjs`. Do not edit this generated file directly.",
      ]
        .filter(Boolean)
        .join("\n\n") + "\n";
    files.set(docPath(component), body);
  }
  const groups = categories.map(
    (category) =>
      `## ${category}\n\n${catalog
        .filter((c) => c.category === category)
        .sort((a, b) => a.name.localeCompare(b.name, "en"))
        .map((c) => `- [${c.name}](${docPath(c)}): ${c.description}`)
        .join("\n")}`,
  );
  files.set(
    "docs/primitives/llms.txt",
    [
      "# Hearth UI behavior and native markup primitives",
      `[Start at the agent index](../../llms.txt). Version ${version}. Match this reference to your installed package or release.`,
      "## Public API",
      "Both package roots export nextCollectionId, toggleSelection, createTypeahead, focusComposed, positionPopup, observePopup, createOverlayController, bindField, and createFormControlController. Their types use DOM/data types, not Vue. Imports are SSR-safe; call DOM controllers only after mounting.",
      "## Composition contracts",
      "- nextCollectionId(items,current,key,{orientation,direction,wrap}) handles enabled IDs and Home/End/arrows. CollectionEntry uses id, textValue?, disabled?. It does not assign ARIA roles or mutate focus itself.",
      "- toggleSelection(values,id,multiple) returns a new selected-ID array. Focus/active state stays independent of selection.",
      "- createTypeahead(timeout) returns search(items,key,current?,now?) and reset(). Buffered repeated characters cycle through matching labels. Call only for unmodified, non-IME character events.",
      "- focusComposed(root) traverses native slots and open shadow roots for a visible focus target. It is not a focus trap. Native modal dialog behavior remains the focus-containment mechanism.",
      "- positionPopup(anchor,panel,{side,align,gap,padding}) accepts an element or a DOMRect getter, supporting context/virtual anchors. Uses the owning window visual viewport and clamping/flipping. Set fixed positioning, inset:auto, and margin:0 on the consumer surface.",
      "- observePopup(anchor,panel,optionsGetter) returns update()/dispose(). Positioning does not create a portal, set modal semantics, or own visibility. Call update after showing; dispose when detached.",
      "- createOverlayController(element,{modal,initialFocus,returnFocus,onClose}) returns open()/close(reason?)/dispose(). Use a native dialog or popover element. Default dialog behavior is modal; popovers remain nonmodal. Call dispose on teardown. Initial focus policy is caller-owned, with composed-tree fallback.",
      "- bindField(nativeControl,{label,descriptions,validationMessage,invalid}) requires label and descriptions in the same DOM root as the control. Returns update()/dispose(), preserves existing description IDs, and restores attributes/validity. This does not make a custom element form-associated; use native owning forms or Hearth fields for ElementInternals behavior.",
      "- createFormControlController(internals,{getValue,getState,getValidity,onDisabled,onReset,onRestore}) supports consumer-defined form controls without Hearth private data attributes. The custom-element class must declare static formAssociated=true, call attachInternals(), and forward formDisabledCallback/formResetCallback/formStateRestoreCallback to setDisabled/reset/restore. sync updates value/state/validity; setCustomValidity adds an external validation error; validity/validationMessage expose snapshots for consumer UI; dispose stops writes. Values may be strings, Files, FormData (for repeated values), or null. The consumer owns reset defaults, accessible naming and error associations, and an anchor inside its own DOM root.",
      "## Native markup styles",
      "Import @hearth-ui/vue/primitives.css or @hearth-ui/elements/primitives.css for h-visually-hidden, h-focus-ring, h-field-layout, h-field-label, h-field-description, h-field-error, and h-input-group. Import these styles inside a consumer-owned shadow root if its markup is encapsulated there.",
      "## Example",
      '```js\nimport { createOverlayController, observePopup } from "@hearth-ui/elements";\nconst trigger = document.querySelector("#filter-trigger");\nconst content = document.querySelector("#filter-popover");\nconst placement = observePopup(trigger, content, () => ({ side: "bottom", align: "end" }));\nconst overlay = createOverlayController(content, { returnFocus: () => trigger });\ntrigger.addEventListener("click", () => { overlay.open(); placement.update(); });\n// During application teardown: placement.dispose(); overlay.dispose();\n```',
      "## Related references",
      "- [HSurface](../components/surface/llms.txt) for custom presentation.",
      "- [HListbox](../components/listbox/llms.txt) for owner-rendered choices.",
      "- [HPane](../components/pane/llms.txt) for persistent responsive inspectors.",
      "- [HFieldset](../components/fieldset/llms.txt) for grouping and DOM-root constraints.",
    ].join("\n\n") + "\n",
  );
  files.set(
    "llms.txt",
    [
      "# Hearth UI\n\n> Themeable Vue and web components for self-hosted dashboards, public pages, and authentication. Start here, then read only the component references needed for the task.",
      `This index covers ${catalog.length} public components in source version ${version}. The working tree may contain unpublished changes. Check package versions and registry/release availability before assuming a new feature is published.`,
      `## Agent workflow\n\n1. Choose the native Vue or web-component distribution for the host framework. Reuse existing Hearth components.\n2. Choose a frame: [HPublicShell](docs/components/public-shell/llms.txt), [HAuthPage](docs/components/auth-page/llms.txt), or [HDashboardShell](docs/components/dashboard-shell/llms.txt).\n3. Read [HTheme](docs/components/theme/llms.txt) before changing palettes, tokens, or density.\n4. Follow the component links for props, defaults, events, slots, recipes, and constraints. Do not invent APIs.\n5. Keep authentication, authorization, routing, requests, and persistence in the application.\n6. After editing repository APIs, run \`npm run docs:generate\` and \`npm run docs:check\`.`,
      `## Packages and entry points\n\n- Native Vue: \`${vuePackage}\`. Import named components and \`${vuePackage}/styles.css\`. Vue 3.5+ is a peer dependency; this build does not bundle Vue.\n- Web components: \`${elementsPackage}\`. Import \`registerElements\` from its root and load \`${elementsPackage}/themes.css\`. No Vue dependency or Vue types are required by the host.\n- Auto-registration: \`${elementsPackage}/auto\`. Custom prefixes use \`registerElements('my-app')\`.\n- Both packages export theme helpers/types and include these references. Install from npm after publication, or use tarballs from \`npm run pack:packages\` / [GitHub Releases](https://github.com/samishal1998/hearth-ui/releases). Do not assume a prepared package is already on npm.\n- Raw HTML: extract the elements package, link \`dist/themes.css\`, and load \`dist/elements/auto.js\` as a module. Keep shared chunks together. No Node globals or global Vue are required.\n- Native Vue supports SSR. Custom elements render when connected in the browser; declarative shadow-DOM hydration is not provided.\n- The repository root is a private build workspace, not a publishable UI package. Earlier \`@samishal1998/hearth-ui\` release artifacts were a combined distribution; use matching version documentation when maintaining those installs.`,
      `## Shared integration rules\n\n- Vue props use camelCase; HTML attributes use kebab-case. Array/object values are DOM properties, never JSON attributes.\n- Boolean attributes use presence/absence. Assign \`element.disabled = false\`, not \`disabled="false"\`.\n- Custom events emitted by Vue use argument arrays: \`const [value] = event.detail\`. Listen on the element; do not assume bubbling. Native \`click\` remains a MouseEvent.\n- Vue uses \`v-model\` or a documented named model. Apply consumer-owned state changes for favorite, close, and navigation events.\n- Vue named slots use \`#name\`; native slots use \`slot="name"\`. Web components have no scoped slots.\n- Named fields join their owning form through ElementInternals. Multi-selects submit repeated values: read \`FormData.getAll(name)\`.\n- Keep forms and field hosts in one DOM tree. Set initial properties before connection for reset defaults. Do not put unrelated fields into an auth page's non-form slots.\n- \`formDisabled\` and \`control-sync\` are internal plumbing, not application APIs.\n- Source palettes: ${themes.map((t) => "`" + t + "`").join(", ")}. Sunset is default. Modes: dark, light, system. Densities: comfortable, compact.\n- Prefer inherited \`--h-*\` variables, then exposed CSS parts. Do not patch shadow-root implementation DOM.\n- Use visible labels, state text, and native keyboard behavior. Verify your custom palette and complete application, not just isolated components.`,
      "## Quick component selection\n\n- Fixed choice: HSelect. Searchable choice: HCombobox. Array-only searchable choice: HMultiSelect. Visible exclusive choices: HRadioGroup.\n- Selection/agreement: HCheckbox. On/off setting: HSwitch. Text: HInput/HTextarea. Numeric adjustment: HRange.\n- Panels: HTabs. Expandable sections: HAccordion. Routes: HNavigationMenu/HSidebar/HBreadcrumbs.\n- Work progress: HProgress. Loading shapes: HSkeleton. Empty results: HEmptyState. Feedback: HAlert. State label: HBadge.\n- Content: HCard. App launcher: HAppCard. Metric: HStatCard.",
      "## Custom UI foundation\n\nStart with HSurface, HStack/HGrid/HContainer, HText/HHeading/HLink, and HToolbar/HFilterBar. Use [behavior and native-markup primitives](docs/primitives/llms.txt) when custom markup needs shared focus, selection, field association, or overlay positioning. HPane is persistent desktop content with a mobile full-screen dialog; HSheet remains modal on both sizes. HVirtualList uses fixed-height rows, not variable-height messages.",
      ...groups,
      `## Project references\n\n- [Repository](https://github.com/samishal1998/hearth-ui): source and workflows.\n- [README](${sourceURL}README.md): integration and publishing.\n- [Live catalog](https://hearth-ui.samyx.net/#components): interactive examples.\n- [Theme studio](https://hearth-ui.samyx.net/#themes): configure tokens.\n- [Shared types](${sourceURL}src/themes.ts): theme and data contracts.\n\nRelative links work in the repository and under the site's base path. Source links point to main; choose a matching tag when maintaining an older release.`,
      "---\nGenerated by `npm run docs:generate`; edit source, catalog, and recipes instead.",
    ].join("\n\n") + "\n",
  );
  return { files, catalog };
}
export async function generate({ check = false } = {}) {
  const { files, catalog } = await renderAgentDocs();
  const stale = [];
  for (const [path, content] of files) {
    const target = resolve(root, path);
    if (check) {
      if (!existsSync(target) || readFileSync(target, "utf8") !== content)
        stale.push(path);
    } else {
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, content);
    }
  }
  const directory = resolve(root, "docs/components");
  if (existsSync(directory))
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = `docs/components/${entry.name}/llms.txt`;
      if (
        entry.isDirectory() &&
        existsSync(resolve(root, path)) &&
        !files.has(path)
      )
        stale.push(path + " (not in catalog; review before removing)");
    }
  if (stale.length)
    throw new Error(
      `Agent docs are stale. Run npm run docs:generate and review:\n${stale.join("\n")}`,
    );
  console.log(
    `${check ? "Verified" : "Generated"} llms.txt and ${catalog.length} component references.`,
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
)
  generate({ check: process.argv.includes("--check") }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
