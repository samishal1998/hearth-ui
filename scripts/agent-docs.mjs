import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";
import { parse } from "vue/compiler-sfc";
import { examples } from "./agent-examples.mjs";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const internal = new Set(["formDisabled", "control-sync"]);
const categories = [
  "Layouts",
  "Controls",
  "Surfaces",
  "Feedback",
  "Foundation",
];
const sourceURL = "https://github.com/samishal1998/hearth-ui/blob/main/";
const slug = (component) => component.tag.slice("hearth-".length);
const docPath = (component) => `docs/components/${slug(component)}/llms.txt`;
const fence = (language, code) => `\`\`\`${language}\n${code.trim()}\n\`\`\``;

async function loadTypeScript(path) {
  const code = ts.transpileModule(read(path), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
function memberName(node) {
  return node.name &&
    (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ? node.name.text
    : "";
}
function publicType(node) {
  if (ts.isTypeLiteralNode(node))
    return ts.factory.updateTypeLiteralNode(
      node,
      node.members.filter((m) => !internal.has(memberName(m))),
    );
  if (ts.isInterfaceDeclaration(node))
    return ts.factory.updateInterfaceDeclaration(
      node,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members.filter((m) => !internal.has(memberName(m))),
    );
  return node;
}
function apiSource(name, shared) {
  const path = `src/components/${name}.vue`;
  const parsed = parse(read(path), { filename: path });
  if (parsed.errors.length)
    throw new Error(`Cannot parse ${path}: ${parsed.errors.join(", ")}`);
  const source = ts.createSourceFile(
    path,
    parsed.descriptor.scriptSetup?.content || "",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let props, events, defaults, icons;
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === "defineProps")
        props = node.typeArguments?.[0];
      if (node.expression.text === "defineEmits")
        events = node.typeArguments?.[0];
      if (node.expression.text === "withDefaults") defaults = node.arguments[1];
    }
    if (
      name === "HIcon" &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "paths" &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    )
      icons = node.initializer.properties.map(memberName);
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!props) throw new Error(`No typed props found for ${name}`);
  const found = new Map();
  function dependencies(node) {
    if (
      ts.isIdentifier(node) &&
      shared.has(node.text) &&
      !found.has(node.text)
    ) {
      const declaration = shared.get(node.text);
      found.set(node.text, declaration);
      ts.forEachChild(declaration, dependencies);
    }
    ts.forEachChild(node, dependencies);
  }
  dependencies(publicType(props));
  if (events) dependencies(publicType(events));
  return {
    path,
    props: printer.printNode(
      ts.EmitHint.Unspecified,
      publicType(props),
      source,
    ),
    events: events
      ? printer.printNode(ts.EmitHint.Unspecified, publicType(events), source)
      : "",
    defaults: defaults
      ? defaults.getText(source)
      : "No component defaults; omitted optional props are undefined (Vue casts absent boolean props to false unless explicitly defaulted).",
    types: [...found.values()]
      .map((node) =>
        printer.printNode(
          ts.EmitHint.Unspecified,
          publicType(node),
          node.getSourceFile(),
        ),
      )
      .join("\n\n"),
    icons,
  };
}

export async function renderAgentDocs() {
  const { catalog } = await loadTypeScript("site/catalog.ts");
  const { themes } = await loadTypeScript("src/themes.ts");
  const { version } = JSON.parse(read("package.json"));
  const sharedFile = ts.createSourceFile(
    "src/themes.ts",
    read("src/themes.ts"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const shared = new Map();
  for (const node of sharedFile.statements) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
      shared.set(node.name.text, node);
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some(
        (d) => ts.isIdentifier(d.name) && d.name.text === "themes",
      )
    )
      shared.set("themes", node);
  }
  const names = new Set(catalog.map((c) => c.name));
  if (names.size !== catalog.length)
    throw new Error("Duplicate component names in catalog");
  if (Object.keys(examples).some((name) => !names.has(name)))
    throw new Error("An agent example refers to an uncataloged component");
  const files = new Map();
  for (const component of catalog) {
    if (
      !/^H[A-Z][A-Za-z]+$/.test(component.name) ||
      !/^hearth-[a-z]+(?:-[a-z]+)*$/.test(component.tag)
    )
      throw new Error("Unsafe component name or tag");
    const example = examples[component.name];
    if (!example) throw new Error(`Add an agent recipe for ${component.name}`);
    const source = apiSource(component.name, shared);
    const imports = [...new Set([component.name, ...(example.imports || [])])];
    for (const name of [...imports, ...example.related])
      if (!names.has(name))
        throw new Error(`Unknown component reference ${name}`);
    const vue = `<script setup lang="ts">\n${example.script?.includes("ref(") || example.script?.includes("ref<") ? "import { ref } from 'vue';\n" : ""}import { ${imports.join(", ")} } from '@samishal1998/hearth-ui';\nimport '@samishal1998/hearth-ui/styles.css';\n${example.script || ""}\n</script>\n\n<template>\n${example.vue
      .split("\n")
      .map((line) => "  " + line)
      .join("\n")}\n</template>`;
    const js = `import { registerElements } from '@samishal1998/hearth-ui/elements';\nimport '@samishal1998/hearth-ui/themes.css';\nregisterElements();\n\nconst mount = document.querySelector('#example');\nconst element = document.createElement('${component.tag}');\nObject.assign(element, ${JSON.stringify(example.props, null, 2)});\n${example.children ? `element.innerHTML = ${JSON.stringify(example.children)}; // Static example markup only; never inject untrusted HTML.\n` : ""}${example.event ? `element.addEventListener('${example.event}', event => {\n  const [value] = event.detail;\n  // Update your application state using value.\n});\n` : ""}${example.js ? example.js + "\n" : ""}mount.append(element);`;
    const related = example.related
      .map((name) => {
        const c = catalog.find((c) => c.name === name);
        return `- [${name}](../${slug(c)}/llms.txt): ${c.description}`;
      })
      .join("\n");
    const body = `# ${component.name}\n\n> ${component.description}\n\n[Start with the Hearth UI agent index](../../../llms.txt). This reference describes repository source; package.json version: ${version}. Match it to the source/release you are using.\n\n## Identity\n\n- Vue export: \`${component.name}\` from \`@samishal1998/hearth-ui\`.\n- Custom element: \`<${component.tag}>\`.\n- Individual constructor: \`Hearth${component.name.slice(1)}Element\` from \`@samishal1998/hearth-ui/elements\`.\n- Category: ${component.category}.\n- [Implementation](${sourceURL}${source.path}).\n\n## Choose and use it correctly\n\n${example.notes.map((note) => "- " + note).join("\n")}\n\n## Public API\n\n${component.props}\n\nA \`?\` marks optional source props. A prop with a default may be omitted even when the source type is required. Internal \`formDisabled\` and \`control-sync\` plumbing is excluded below; do not use it in application code.\n\n${fence("ts", `type Props = ${source.props};`)}\n\n### Defaults\n\n${source.defaults.startsWith("No component") ? source.defaults : fence("ts", source.defaults)}\n\n### Events\n\n${component.events}\n${source.events ? "\n" + fence("ts", `type Emits = ${source.events};`) + "\n" : ""}\nVue-emitted custom-element events expose arguments as \`event.detail\`, an array. Listen directly on the element. Native DOM events such as \`click\` keep their normal payloads.\n\n### Slots\n\n${component.slots}\n\nVue uses \`<template #slotName>\`; custom elements use \`<div slot="slotName">\`. Custom elements do not support Vue scoped slots.\n\n### CSS parts\n\n${component.parts}\n\nUse \`${component.tag}::part(part-name)\` for an exposed part, or inherited \`--h-*\` tokens for system-level styling. Native Vue components use the shared stylesheet and \`h-*\` classes.\n${source.types ? "\n## Supporting types\n\n" + fence("ts", source.types) + "\n" : ""}\n## Vue example\n\n${fence("vue", vue)}\n\n## Web-component example\n\nProvide a mount point (use a \`form\` instead of \`div\` when demonstrating field submission):\n\n${fence("html", '<div id="example"></div>')}\n\nThe following is bundler-based ESM. For raw HTML, load \`dist/themes.css\` with a stylesheet link and import \`registerElements\` from \`./dist/elements/index.js\` instead. Set array/object properties before connection when they should become reset defaults.\n\n${fence("js", js)}\n${source.icons ? "\n## Available icon names\n\n" + source.icons.map((name) => "`" + name + "`").join(", ") + ".\n" : ""}${component.name === "HTheme" ? "\n## Theme token reference\n\n" + fence("css", read("src/styles/themes.css")) + "\n" : ""}\n## Related components\n\n${related}\n\n---\nGenerated by \`npm run docs:generate\` from component source, \`site/catalog.ts\`, and \`scripts/agent-examples.mjs\`. Do not edit this generated file directly.\n`;
    files.set(docPath(component), body);
  }
  const groups = categories
    .map(
      (category) =>
        `## ${category}\n\n${catalog
          .filter((c) => c.category === category)
          .sort((a, b) => a.name.localeCompare(b.name, "en"))
          .map((c) => `- [${c.name}](${docPath(c)}): ${c.description}`)
          .join("\n")}`,
    )
    .join("\n\n");
  files.set(
    "llms.txt",
    `# Hearth UI\n\n> A themeable Vue and web-component system for self-hosted dashboards, public pages, and authentication screens. Start here, then read only the component references needed for the task.\n\nThis index covers ${catalog.length} public components from repository source. The current package.json version is ${version}; the working tree may contain unreleased changes. Check the installed version and matching source/tag before assuming a feature is in a published release.\n\n## Agent workflow\n\n1. Identify the host framework and choose native Vue components or web components. Do not create another implementation of an existing Hearth component.\n2. Pick a page frame first: [HPublicShell](docs/components/public-shell/llms.txt), [HAuthPage](docs/components/auth-page/llms.txt), or [HDashboardShell](docs/components/dashboard-shell/llms.txt).\n3. Read [HTheme](docs/components/theme/llms.txt) before changing tokens, palettes, density, or scoped theme islands.\n4. Follow the relevant component links below for props, defaults, events, slots, examples, and constraints. Do not invent props, tags, or event payload shapes.\n5. Keep authentication, authorization, routing, network requests, persistence, and business logic in the consuming application.\n6. If changing this repository, regenerate these files with \`npm run docs:generate\` and verify them with \`npm run docs:check\`.\n\n## Installation and entry points\n\n- Package name: \`@samishal1998/hearth-ui\`. [GitHub releases](https://github.com/samishal1998/hearth-ui/releases) provide npm-compatible tarballs; do not assume an npm registry publication. For current unreleased source, build this checkout.\n- Vue: import named components from the package and load \`@samishal1998/hearth-ui/styles.css\`. Use the host's Vue 3.5+ runtime.\n- Web components: import \`registerElements\` from \`@samishal1998/hearth-ui/elements\`, load \`@samishal1998/hearth-ui/themes.css\`, and call \`registerElements()\`.\n- Auto-registration: \`@samishal1998/hearth-ui/elements/auto\`. A custom prefix is supported through \`registerElements('my-app')\`.\n- Raw browser: serve the extracted package contents, link \`dist/themes.css\`, and load \`dist/elements/auto.js\` as a module. Keep the shared chunks alongside the entry files. No Node globals or host Vue global are needed.\n- Native Vue supports SSR. Web components render when connected in the browser; declarative shadow-DOM hydration is not provided.\n\n## Shared integration rules\n\n- Vue prop names use camelCase; HTML attributes use kebab-case. Array/object values are DOM properties, never JSON strings in attributes.\n- Boolean attributes use presence/absence. Set \`element.disabled = false\`, not \`disabled="false"\`.\n- Vue-emitted events become custom events with argument arrays: \`const [value] = event.detail\`. Listen on the element itself; do not assume bubbling. Native \`click\` is still a normal DOM event.\n- Native Vue models use \`v-model\` (or a named model when documented). Update consumer-owned state for callbacks such as \`favorite-change\`, \`close\`, and navigation.\n- Native slots use \`slot="name"\`; Vue uses \`#name\`. There are no web-component scoped slots.\n- Fields need names to participate in form submission. Custom fields bridge to their owning native form through ElementInternals. Multi-selection uses repeated values: \`new FormData(form).getAll(name)\`.\n- Keep form and field hosts in the same DOM tree. Configure initial properties before connection if they should become reset defaults. Do not attach unrelated slotted fields to an internal auth form.\n- \`formDisabled\` and \`control-sync\` are internal adapter plumbing. Do not configure or subscribe to them in application code.\n- Palettes in this source: ${themes.map((t) => "`" + t + "`").join(", ")}. Sunset is the default. Modes: dark, light, system. Density: comfortable, compact.\n- Prefer \`--h-*\` tokens for consistent changes; use documented CSS parts for targeted web-component styling. Do not reach into shadow roots to patch implementation DOM.\n- Use visible labels, meaningful state text, and native keyboard behavior. Validate custom palettes and your composed application; component tests are not an application-wide accessibility certification.\n\n## Quick component selection\n\n- Short fixed choice: HSelect. Searchable choice: HCombobox. Array-typed searchable choices: HMultiSelect. One visible choice among alternatives: HRadioGroup.\n- Selection/agreement: HCheckbox. On/off setting: HSwitch. Free text: HInput/HTextarea. Bounded numeric adjustment: HRange.\n- Revealing panels: HTabs. Expandable sections: HAccordion. Route navigation: HNavigationMenu/HSidebar/HBreadcrumbs.\n- Known/unknown work progress: HProgress. Loading shapes: HSkeleton. Empty/no-results state: HEmptyState. Feedback: HAlert. Compact state label: HBadge.\n- Generic content: HCard. Application launchers: HAppCard. Metrics: HStatCard.\n\n${groups}\n\n## Project references\n\n- [Repository](https://github.com/samishal1998/hearth-ui): source and contribution workflows.\n- [README](${sourceURL}README.md): package setup and host integration.\n- [Live catalog](https://samishal1998.github.io/hearth-ui/#components): interactive examples.\n- [Theme studio](https://samishal1998.github.io/hearth-ui/#themes): visual token configuration.\n- [Shared source types](${sourceURL}src/themes.ts): types and theme helpers.\n\nAll local component links resolve in this repository and under the static site's base path. Source links point to main; use a matching tag when working with an older release.\n\n---\nGenerated by \`npm run docs:generate\`. Update source/catalog/recipes instead of editing generated references.\n`,
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
      if (entry.isDirectory()) {
        const path = `docs/components/${entry.name}/llms.txt`;
        if (existsSync(resolve(root, path)) && !files.has(path))
          stale.push(path + " (not in catalog; review before removing)");
      }
    }
  if (stale.length)
    throw new Error(
      `Agent docs are stale or unexpected. Run npm run docs:generate and review:\n${stale.join("\n")}`,
    );
  console.log(
    `${check ? "Verified" : "Generated"} llms.txt and ${catalog.length} component references.`,
  );
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  generate({ check: process.argv.includes("--check") }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
