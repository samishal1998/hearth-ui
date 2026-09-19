# Hearth UI

**A home for what you build.** A configurable design and component system for self-hosted applications: a public front door, one auth screen, and the dashboard behind it.

**[Showcase & guide](https://samishal1998.github.io/hearth-ui/)** · **[Theme studio](https://samishal1998.github.io/hearth-ui/#themes)** · **[Downloads](https://github.com/samishal1998/hearth-ui/releases)**

Hearth carries the visual direction of Apptrail into a standalone library. **Sunset** is the primary palette: deep navy, warm orange, restrained glass surfaces, rounded geometry, and calm typography. Ocean, Forest, Dusk, and Rose offer alternate atmospheres. Every palette has dark, light, and system modes. Match source documentation to your installed release when using newly added features.

## Agent references

Start at **[llms.txt](llms.txt)**. It routes agents to focused references for all 61 components under **`docs/components/<slug>/llms.txt`**, for example:

- [Authentication page](docs/components/auth-page/llms.txt)
- [Dashboard shell](docs/components/dashboard-shell/llms.txt)
- [Multi-select](docs/components/multi-select/llms.txt)
- [Theme system and tokens](docs/components/theme/llms.txt)

Each file includes component selection guidance, source-derived public props/defaults/event types, supporting types, slots, CSS parts, Vue and web-component recipes, and related components. The index also documents the shared form/event/theming contracts.

```sh
npm run docs:generate
npm run docs:check
```

The references are generated from `site/catalog.ts`, Vue component source, shared types, and `scripts/agent-examples.mjs`. Update those inputs instead of editing generated text. The check catches stale files, missing component coverage, broken local references, and invalid example syntax; it runs with normal build checks.

The Vite development server and static showcase expose the same files as plain text at `llms.txt` and `docs/components/<slug>/llms.txt`, relative to the site's base path. New npm package builds also include the references. Existing release archives remain versioned snapshots.

## One source, two distributions

- **`@hearth-ui/vue`:** native Vue components with typed props, events, slots, `v-model`, and SSR-compatible rendering. Uses the host application's Vue runtime.
- **`@hearth-ui/elements`:** the same components compiled as web components. The runtime and component styles are bundled; its DOM-based TypeScript declarations have no Vue dependency. Use it in React, Astro, plain HTML, or another framework.

The application owns its router, authentication, authorization, storage, and data fetching. Hearth supplies the presentation and interaction primitives.

## Install

The current release is **0.4.0**. Install the distribution you need:

```sh
# Native Vue
npm install @hearth-ui/vue vue

# Web components (no Vue dependency in the host)
npm install @hearth-ui/elements
```

Before publication, use `npm run build && npm run pack:packages` and install the relevant tarball from `release-dist/`. See [PUBLISHING.md](PUBLISHING.md) for first-publication and trusted-publisher setup. Existing `@samishal1998/hearth-ui` releases were a combined distribution; their immutable archives remain available for older consumers.

### Vue

```vue
<script setup lang="ts">
import { HTheme, HAuthPage, type AuthCredentials } from "@hearth-ui/vue";
import "@hearth-ui/vue/styles.css";

function signIn(credentials: AuthCredentials) {
  // Call your auth API. Bind loading/error to the response.
}
</script>

<template>
  <HTheme theme="sunset" mode="dark">
    <HAuthPage brand="homestead" @submit="signIn" />
  </HTheme>
</template>
```

### Web components with a bundler

```js
import { registerElements } from "@hearth-ui/elements";
import "@hearth-ui/elements/themes.css";

registerElements();
```

```html
<hearth-theme theme="sunset" mode="dark">
  <hearth-auth-page brand="homestead"></hearth-auth-page>
</hearth-theme>
```

```js
document
  .querySelector("hearth-auth-page")
  .addEventListener("submit", (event) => {
    const [{ username, password }] = event.detail;
    // Call your auth API here.
  });
```

For automatic registration, import `@hearth-ui/elements/auto`. For a custom namespace, call `registerElements('my-app')` to get `<my-app-button>`, `<my-app-auth-page>`, and so on. Registration is idempotent; conflicting definitions produce an error rather than silently replacing another library.

Individual constructors such as `HearthButtonElement` are exported for selective registration. The element collection shares one bundled Vue runtime; selective registration is not a promise of per-element bundle sizes.

### Plain HTML, no framework or bundler

Extract the elements package, serve its contents over HTTP, and load:

```html
<link rel="stylesheet" href="./dist/themes.css" />
<script type="module" src="./dist/elements/auto.js"></script>

<hearth-theme theme="sunset" mode="dark">
  <hearth-button variant="primary">Make yourself at home</hearth-button>
</hearth-theme>
```

Keep the files inside `dist/elements/` together: entry points import a shared runtime chunk. The build resolves Vue's production flags, so no Node globals or host bundler are required. Vue's bundled runtime license is included at `dist/VUE-LICENSE`. See the live [plain HTML example](https://samishal1998.github.io/hearth-ui/elements.html) and [React 19 example](https://samishal1998.github.io/hearth-ui/react.html).

## Components

| Foundation | Controls  | Surfaces & feedback | Full layouts      |
| ---------- | --------- | ------------------- | ----------------- |
| `HTheme`   | `HButton` | `HCard`             | `HPageHeader`     |
| `HBrand`   | `HInput`  | `HAppCard`          | `HPublicShell`    |
| `HIcon`    | `HSelect` | `HStatCard`         | `HDashboardShell` |
|            | `HSwitch` | `HBadge`            | `HAuthPage`       |
|            | `HTabs`   | `HAlert`            |                   |
|            |           | `HEmptyState`       |                   |
|            |           | `HDialog`           |                   |

### New in 0.2

| Selection & forms | Navigation & layout | Feedback & identity |
| ----------------- | ------------------- | ------------------- |
| `HCombobox`       | `HSidebar`          | `HProgress`         |
| `HMultiSelect`    | `HNavigationMenu`   | `HAvatar`           |
| `HCheckbox`       | `HButtonBar`        | `HSkeleton`         |
| `HRadioGroup`     | `HBreadcrumbs`      | `HSeparator`        |
| `HTextarea`       | `HPagination`       |                     |
| `HRange`          | `HAccordion`        |                     |

The [component catalog](https://samishal1998.github.io/hearth-ui/#components) includes interactive previews and documents props, events, slots, and CSS parts for all **61 components**. Vue declarations and web-component constructors are included for every component.

### New in 0.4.0

- Overlays and feedback: `HPopover`, `HTooltip`, `HDropdownMenu`, `HSheet`, `HToast`, and `HToaster`.
- Data and selection: `HDataTable`, `HDescriptionList`, `HList`, `HListItem`, `HChip`, `HChipGroup`, and `HSegmentedControl`.
- Dashboard utilities: `HFileUpload`, `HCodeBlock`, `HCommandPalette`, `HLogViewer`, `HCopyField`, `HConnectionState`, and `HSparkline`.
- Six [page recipes](https://samishal1998.github.io/hearth-ui/#recipes): `HSettingsPage`, `HProviderSetup`, `HResourceDetail`, `HStatusPage`, `HErrorPage`, and `HFirstRunSetup`.
- Native date, time, and local date-time inputs through `HInput`.

Applications own persistence, requests, notification queues, and file uploads. The recipes demonstrate those boundaries with in-memory state. Tables support client-side sorting, selection, pagination, and per-cell slots using `tableCellSlot(rowId, columnKey)`; logs keep a bounded rendered window. See each component's agent reference for supported limits and event contracts.

### Searchable selection

`HCombobox` supports single selection or `multiple` mode with a `string | string[]` model. `HMultiSelect` uses the same implementation with an array-only model, making it convenient with Vue's typed `ref<string[]>`.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { HMultiSelect } from "@hearth-ui/vue";
import "@hearth-ui/vue/styles.css";

const providers = ref<string[]>(["docker"]);
const options = [
  { value: "docker", label: "Docker", keywords: ["containers", "compose"] },
  { value: "traefik", label: "Traefik", description: "Reverse-proxy routes" },
  { value: "caddy", label: "Caddy", disabled: true },
];
</script>

<template>
  <HMultiSelect
    v-model="providers"
    :options="options"
    label="Providers"
    name="providers"
    required
  />
</template>
```

Search matches labels, descriptions, and optional keywords. Arrow keys move the active option, Enter selects, Escape closes, and Backspace removes the last multi-selection when the query is empty. The `search(query)` event and `loading` prop allow application-owned remote search. Unknown selected IDs keep their values while option data loads; no free-form options are invented.

Popup content stays local to the component, so overflow-clipping ancestors can clip it. The current option list is not virtualized; a future anchored/virtualized popup can extend that ceiling without changing the selection API.

### Radio groups, tabs, and navigation

Use `HRadioGroup` for a complete radio field. Its native radio inputs share a DOM tree, including in custom-element mode. Separate web-component shadow roots do not share native radio grouping, which is why the component owns the whole group. Options may include descriptions and disabled states. Arrow, Home, and End keys move between enabled choices.

`HTabs` now supports `orientation="vertical"`, `variant="underline"`, and `activation="manual"`. Manual activation moves focus with arrows and switches the panel with Enter/Space; the original automatic pill tabs remain the default.

`HNavigationMenu` uses navigation links and native disclosure elements, not application-menu ARIA roles. Use Tab, Enter, ArrowDown on a group trigger, and Escape. `HSidebar` can be composed independently of the full dashboard shell, with grouped sections and a collapsible icon rail. `HButtonBar` groups actions while keeping normal button keyboard behavior.

`HProgress` wraps native `<progress>` and supports indeterminate state. `HRange` uses the browser's slider behavior and displays its actual stepped value. `HAccordion` uses native `<details>` and can allow one or multiple sections open. Pagination emits page changes; data fetching stays with your application.

## Theme your application

### Presets and modes

```vue
<HTheme theme="sunset" mode="dark" density="comfortable">
  <YourApplication />
</HTheme>
```

- Palettes in this source: `sunset`, `ocean`, `forest`, `dusk`, `rose`.
- Modes: `dark`, `light`, `system` (CSS follows OS preference).
- Densities: `comfortable` (44px controls) and `compact` (40px controls).

Without a wrapper, apply `data-hearth-theme`, `data-hearth-mode`, and `data-hearth-density` to an HTML ancestor and load the stylesheet. Vue component consumers need `styles.css`; custom-element consumers need `themes.css` because component styles are already injected into shadow roots.

### Override any Hearth token

```vue
<HTheme
  theme="sunset"
  mode="dark"
  :tokens="{
    '--h-accent': '#ff7a2f',
    '--h-accent-hover': '#ffb15c',
    '--h-on-accent': '#24160f',
    '--h-bg': '#0b1220',
    '--h-surface': '#101a2b',
    '--h-font': 'Inter, system-ui, sans-serif',
    '--h-radius-control': '10px',
    '--h-radius-card': '16px',
    '--h-radius-panel': '20px',
  }"
>
  <HDashboardShell brand="homestead" :items="navigation">
    <!-- Your content -->
  </HDashboardShell>
</HTheme>
```

For web components, object/array values are properties:

```js
document.querySelector("hearth-theme").tokens = {
  "--h-accent": "#8bd7a4",
  "--h-on-accent": "#152a1c",
};
```

The complete token reference is [`src/styles/themes.css`](src/styles/themes.css). Tokens cover surfaces, text, branding, semantic status colors, focus, typography, geometry, density, spacing, content width, shadows, motion, and the auth-page scenery. `themeStyle()` filters an object to Hearth custom properties; `themeCSS()` serializes those trusted, application-authored values as CSS.

Theme islands can coexist. CSS custom properties inherit through native slots and shadow roots. Use the [theme studio](https://samishal1998.github.io/hearth-ui/#themes) to preview a palette, tune colors and geometry, rename the demo brand, and export a resolved stylesheet.

### Detailed styling

Use tokens for system-wide changes and `::part()` for component-specific adjustments:

```css
hearth-button::part(control) {
  font-size: 15px;
}
hearth-auth-page::part(panel) {
  padding-block: 80px;
}
```

Native Vue components expose `h-*` classes on their rendered markup. Slots let you replace larger sections. The auth page's `form` slot replaces the entire default form; this is the path for OAuth or another credential flow.

## Compose public pages and dashboards

`HPublicShell` provides your brand, a small navigation area, an account/action slot, and a footer. Use it for a landing page, guide, or public app listing.

`HDashboardShell` adds a desktop sidebar, mobile navigation dialog, account controls, header actions, and a content region. Navigation data uses:

```ts
const navigation = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "apps", label: "Applications", icon: "apps", badge: 6 },
  { id: "settings", label: "Settings", icon: "settings" },
];
```

Handle `navigate(id)` with your router and `logout()` with your auth service. An item's `href` supplies native link navigation. The desktop `navigation` slot can replace that list; the mobile drawer uses the `items` array, so keep it meaningful even when customizing the desktop slot.

`HAuthPage` emits `submit({ username, password })`, never sends requests, and never stores credentials. The library does not provide access control: enforce private routes and API authorization in your application.

Use normal CSS Grid to arrange application/stat cards. The library does not couple layout to a drag/drop engine or persistence model.

## Form and event interoperability

Native Vue controls support `v-model`. Custom-element fields use `ElementInternals` to participate in an outer native form:

```html
<form id="settings">
  <hearth-input name="workspace" label="Workspace name" required></hearth-input>
  <hearth-switch
    name="public"
    label="Public dashboard"
    value="yes"
  ></hearth-switch>
  <hearth-button type="submit" variant="primary">Save</hearth-button>
  <hearth-button type="reset">Reset</hearth-button>
</form>
```

`FormData`, native validation, disabled fieldsets, reset, and Enter-to-submit are supported. Keep the form and its custom-element fields in the same DOM tree. Do not expect a native form inside one shadow tree to own arbitrary slotted inputs from another tree. For the full auth page, the supplied form is internally composed from native Vue controls; replacing its `form` slot means you own that replacement form.

Multi-select fields submit one entry per selected value under the same name. Read them with `new FormData(form).getAll('providers')`; `Object.fromEntries()` would retain only the last duplicate entry. Use arrays as DOM properties for `hearth-multi-select`, and set initial properties before connecting the element when they should become its reset baseline.

Checkboxes support `indeterminate` and emit `update:indeterminate(false)` after a user change. `HTextarea` preserves normal Enter/newline behavior; the custom-element form bridge only interprets Enter as submission for suitable single-line fields. `formDisabled` and `control-sync` are internal compound-control plumbing, not application-owned state.

Web-component emitted events carry an **array** in `event.detail`:

```js
field.addEventListener("change", (event) => {
  const [value] = event.detail;
});

select.options = [{ value: "media", label: "Media" }];
appCard.addEventListener("favorite-change", (event) => {
  appCard.favorite = event.detail[0];
});
```

- Listen directly on the element; emitted custom events are not promised to bubble.
- Arrays/objects use DOM properties, not JSON attributes.
- Boolean attributes use presence/absence. Set `.disabled = false` instead of `disabled="false"`.
- `HAppCard.favorite` is controlled by the consumer.
- `HDialog` emits `close`; set its `open` prop/property to false in the handler.
- Form buttons invoke the owner's `requestSubmit()`/`reset()`. A custom submit button is not a native `SubmitEvent.submitter`; do not depend on native submitter name/value semantics for it.
- `control-sync` is an internal form-adapter notification, not an application data event.

Native Vue components are SSR-compatible. The custom-element module is safe to import on the server, but elements render when connected in a browser; declarative shadow-DOM hydration is not provided. Web-component styles are injected into shadow roots, so your CSP must permit that styling model. Use the native Vue build for stylesheet-only policies.

## Develop and verify

Requires Node.js 22.12+ (24 recommended).

```sh
npm ci
npm run build
npx playwright install chromium
npm test
npm run test:package
npm run dev
```

The showcase includes the component catalog, theme studio, auth/dashboard examples, and real plain-HTML and React consumers of the compiled element build. Demo data is illustrative and kept in memory; only visual preferences are saved in local storage.

```sh
npm run build:site
npm run pack:packages
```

Build outputs:

```text
src/                       Shared Vue component implementation
dist/                      Intermediate library builds and declarations
packages/vue/              @hearth-ui/vue manifest, README, and generated payload
packages/elements/         @hearth-ui/elements manifest, README, and generated payload
release-dist/              Two npm tarballs and SHA256SUMS
site-dist/                 Static showcase
```

Browser integration tests cover both distributions, raw packaged web components, a React 19 host, forms, keyboard interaction, mobile navigation, themes, and credential non-persistence. Node tests exercise SSR and tokens. Separate package smoke checks install both actual tarballs, type-check their APIs, and verify that the elements consumer has no Vue installation. Element props/event types are derived from the same component source used for agent docs.

Use current browsers with Shadow DOM, Custom Elements, ElementInternals, native dialog, `color-mix()`, and `:has()` support. Focus, labels, reduced motion, and status text are built in. Validate custom palettes and your composed application's accessibility before shipping.

## Repository workflows

### Self-host the docs with Docker

The container builds both component distributions and the complete docs/showcase at the domain root, including `llms.txt` and all component references:

```sh
docker compose up --build -d --wait
docker compose ps
```

The service listens on **127.0.0.1:8187** on the host. It serves static files as an unprivileged user; Node.js is only used during the image build. The health check verifies the agent index is available.

Add the route from `deploy/host.Caddyfile` to the host's Caddy configuration:

```caddyfile
hearth-ui.samyx.net, hearth-ui.h02.samyx.net {
    reverse_proxy 127.0.0.1:8187
}
```

Validate and reload the host configuration after adding it. Both DNS names must point at the server, and ports 80/443 must reach Caddy for automatic HTTPS. `deploy/docs.Caddyfile` is the separate HTTP-only static-server configuration inside the container.

Rebuild with the same Compose command after updating the checkout. Use `docker compose logs docs` for diagnostics or `docker compose down` to stop this docs deployment.

### GitHub automation

- **Checks:** builds both distributions, runs integration/package checks, and builds the showcase for pushes and pull requests.
- **Showcase:** deploys the static site to GitHub Pages on `main`.
- **Release:** validates a `v*` tag, verifies both packages, and uploads two tarballs plus `SHA256SUMS` to GitHub Releases.
- **Publish npm packages:** manually publishes a selected release tag through npm trusted publishing/OIDC. Configure both npm packages as described in [PUBLISHING.md](PUBLISHING.md).

Keep the root and both package versions aligned, update the lockfile, and regenerate agent docs before tagging. The root is a private workspace and cannot be published to npm. Generated package payloads are rebuilt from shared source; do not edit them by hand.

## License

MIT; see [LICENSE](LICENSE). The elements distribution includes the bundled Vue runtime's MIT notice.
