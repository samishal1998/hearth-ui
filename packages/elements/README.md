# @hearth-ui/elements

**A home for what you build.** Framework-independent web components for dashboards, public pages, and authentication.

Hearth UI includes **94 components**, **seven page recipes**, and **five palettes** with light, dark, and system modes. Version **0.7.1** includes the 0.7 foundation release and a mobile dashboard toolbar layout fix.

[Component registry](https://hearth-ui.samyx.net/#components) · [HTML example](https://hearth-ui.samyx.net/elements.html) · [React example](https://hearth-ui.samyx.net/react.html) · [GitHub](https://github.com/samishal1998/hearth-ui)

## Installation

```sh
npm install @hearth-ui/elements
```

This ESM package has **no host runtime dependencies and no Vue peer dependency**. Its rendering runtime and component styles are bundled. TypeScript declarations depend only on DOM types.

## Quick start with a bundler

```js
import "@hearth-ui/elements/auto";
import "@hearth-ui/elements/themes.css";
```

```html
<hearth-theme theme="sunset" mode="system" mobile-breakpoint="768">
  <hearth-card title="Plan your next update">
    <hearth-date-picker
      label="Maintenance date"
      name="maintenance"
    ></hearth-date-picker>
  </hearth-card>
</hearth-theme>
```

Listen directly on the element. Component events carry their arguments as an array in `event.detail`:

```js
const picker = document.querySelector("hearth-date-picker");
picker.addEventListener("change", (event) => {
  const [date] = event.detail;
  // Use the YYYY-MM-DD string in your application.
});
```

For explicit registration, use `registerElements()` instead of the `auto` import:

```js
import { registerElements } from "@hearth-ui/elements";
registerElements();
```

Registration is idempotent. `registerElements("my-app")` provides a custom prefix such as `<my-app-button>`. Individual constructors are also exported for selective registration.

## Plain HTML, no bundler

Use a pinned CDN version:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Hearth UI</title>
    <link
      rel="stylesheet"
      href="https://cdn.jsdelivr.net/npm/@hearth-ui/elements@0.7.1/dist/themes.css"
    />
    <script
      type="module"
      src="https://cdn.jsdelivr.net/npm/@hearth-ui/elements@0.7.1/dist/elements/auto.js"
    ></script>
  </head>
  <body>
    <hearth-theme theme="sunset" mode="dark">
      <hearth-button variant="primary">Hello, Hearth</hearth-button>
    </hearth-theme>
  </body>
</html>
```

To self-host, serve the package's `dist/` folder and use local URLs for `dist/themes.css` and `dist/elements/auto.js`. Keep all files in `dist/elements/` together: the entry points import shared chunks. No global Vue or Node variables are required.

## Properties, events, and forms

- **Arrays and objects are properties**, not JSON attributes. Assign them before connecting the element when they should establish its initial/reset state.
- Boolean attributes use presence/absence. Set `.disabled = false` or remove the attribute to enable a control.
- Vue-emitted component events use `event.detail` arrays. Native events such as `click` retain their normal browser payloads.
- Use native named slots: `<div slot="footer">…</div>`.
- Form controls participate in their owning HTML form, including validation, reset, and disabled fieldsets.
- Use `FormData.getAll(name)` for multi-selects, date ranges, and numeric intervals. Range endpoints are submitted in start/end or lower/upper order.

Typed constructors make property and event contracts available without installing Vue:

```ts
import {
  registerElements,
  HearthMultiSelectElement,
} from "@hearth-ui/elements";

registerElements();

const providers = new HearthMultiSelectElement({
  label: "Discovery providers",
  name: "providers",
  value: ["docker"],
  options: [
    { value: "docker", label: "Docker" },
    { value: "manual", label: "Manual entries" },
  ],
});

providers.addEventListener("change", (event) => {
  const values: string[] = event.detail[0];
  // Update application state with values.
});

document.querySelector("form")?.append(providers);
```

For React 19, use custom elements directly; arrays and objects can be passed as properties. Use refs and `addEventListener` for component events when integrating with frameworks that do not bind custom events automatically. See the [React example](https://hearth-ui.samyx.net/react.html).

## Themes and responsive overlays

Wrap an application or section in `<hearth-theme>`:

- Palettes: **Sunset**, **Ocean**, **Forest**, **Dusk**, and **Rose**.
- Modes: `light`, `dark`, and `system` (follows the operating system).
- Density: `comfortable` or `compact`.
- Customize through the `tokens` property, inherited `--h-*` CSS variables, or exposed CSS parts.

```html
<hearth-theme theme="ocean" mode="system" mobile-breakpoint="768">
  <hearth-date-picker label="Maintenance date"></hearth-date-picker>
  <hearth-popover label="Filters" mobile-breakpoint="900">
    <hearth-input label="Application name"></hearth-input>
  </hearth-popover>
</hearth-theme>
```

The default mobile threshold is **640 CSS pixels**. Set `mobile-breakpoint` on the theme island, or override it on an individual overlay. With JavaScript, use the numeric `mobileBreakpoint` property. **0 keeps the desktop presentation.** The inherited setting crosses shadow roots and updates live.

- Dialogs, side sheets, command palettes, and dashboard navigation become bottom sheets.
- Popovers, date/time pickers, menus, and searchable selection panels dock at the bottom.
- Mobile modal dialogs preserve native focus containment and lock background scrolling. Popovers retain nonmodal/light-dismiss behavior.
- Navigation flyouts expand inline; tooltips stay anchored and support touch dismissal.

Date, time, and local date-time controls use Hearth picker popovers instead of native browser picker dropdowns. Their ISO string values, form validation, and submission contracts are preserved.

## Components and page recipes

New in v0.7.0: layout/typography primitives, responsive inspectors, messages, virtual lists, trees, richer table/list/field composition, mode-aware profiles, and DOM-only behavior helpers. Both archives include `docs/primitives/llms.txt` and optional `primitives.css` for consumer-owned native markup. Vue scoped slots remain Vue-specific; use the documented native named-slot contracts in HTML. Tables default to mobile cards and compact action icons; use `mobile-layout="scroll"` and `action-display="label"` for the earlier presentation.

The collection includes forms, tables, cards, lists, sparklines, activity timelines, logs, code blocks, navigation, dialogs, notifications, and layout primitives.

Seven page recipes provide starting points for **authentication**, **settings**, **provider setup**, **resource details**, **public status**, **errors**, and **first-run setup**. Your application owns routing, authentication, authorization, persistence, uploads, and requests.

Browse all components in the [registry](https://hearth-ui.samyx.net/#components) and the [page recipe gallery](https://hearth-ui.samyx.net/#recipes).

## Documentation for agents

Version-matched references are included in the installed package:

```text
node_modules/@hearth-ui/elements/llms.txt
node_modules/@hearth-ui/elements/docs/components/<slug>/llms.txt
```

Start with `llms.txt` for component selection, public props, events, slots, and CSS parts. The [hosted agent index](https://hearth-ui.samyx.net/llms.txt) follows the deployed showcase version.

## Browser support and rendering

Target modern browsers with Custom Elements, Shadow DOM, ElementInternals, native dialog, Popover API, and modern CSS support. Component styles are injected into shadow roots. Elements render when connected in the browser; for server-rendered component content, use **[@hearth-ui/vue](https://www.npmjs.com/package/@hearth-ui/vue)**.

## License

MIT. The bundled rendering runtime's MIT notice is included at `dist/VUE-LICENSE`.
