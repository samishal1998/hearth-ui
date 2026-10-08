# @hearth-ui/vue

**A home for what you build.** Native Vue components for dashboards, public pages, and authentication.

Hearth UI includes **94 components**, **seven page recipes**, and **five palettes** with light, dark, and system modes. Version **0.7.1** includes the 0.7 foundation release and a mobile dashboard toolbar layout fix.

[Component registry](https://hearth-ui.samyx.net/#components) · [Page recipes](https://hearth-ui.samyx.net/#recipes) · [Theme studio](https://hearth-ui.samyx.net/#themes) · [GitHub](https://github.com/samishal1998/hearth-ui)

## Installation

```sh
npm install @hearth-ui/vue vue
```

Requires **Vue 3.5+**. This ESM package uses your application's Vue runtime. Import `styles.css` once for component styles and theme tokens.

## Quick start

```vue
<script setup lang="ts">
import { ref } from "vue";
import {
  HTheme,
  HCard,
  HThemeSwitcher,
  HDatePicker,
  type Mode,
} from "@hearth-ui/vue";
import "@hearth-ui/vue/styles.css";

const mode = ref<Mode>("system");
const date = ref("");
</script>

<template>
  <HTheme theme="sunset" :mode="mode" :mobile-breakpoint="768">
    <HCard title="Plan your next update">
      <div style="display: grid; gap: 16px">
        <HThemeSwitcher v-model="mode" />
        <HDatePicker v-model="date" label="Maintenance date" />
        <p v-if="date">Scheduled date: {{ date }}</p>
      </div>
    </HCard>
  </HTheme>
</template>
```

Date, time, and local date-time fields use Hearth popovers rather than native browser picker dropdowns. Their values remain ISO-formatted strings.

## Components

New in v0.7.0: layout/typography primitives, `HSurface`, mode-aware profiles, rich field/list/table composition, responsive inspector panes, messages, virtual lists, trees, and reusable DOM-only behavior helpers. See the included `docs/primitives/llms.txt` for behavior and native-markup composition; `primitives.css` is an optional utility stylesheet. Tables now default to mobile cards and compact icon-only row actions; use `mobileLayout="scroll"` and `actionDisplay="label"` for the earlier presentation.

| Family                 | Examples                                                                                                               |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Forms                  | `HInput`, `HNumberInput`, `HSelect`, `HCombobox`, `HMultiSelect`, `HCheckbox`, `HSwitch`, `HRadioGroup`, `HFileUpload` |
| Scheduling and ranges  | `HCalendar`, `HDatePicker`, `HDateRangePicker`, `HTimePicker`, `HRange`, `HRangeSlider`                                |
| Overlays               | `HDialog`, `HSheet`, `HPopover`, `HTooltip`, `HDropdownMenu`, `HCommandPalette`                                        |
| Data display           | `HDataTable`, `HDescriptionList`, `HList`, `HTimeline`, `HLogViewer`, `HSparkline`, `HCodeBlock`                       |
| Navigation             | `HTabs`, `HSidebar`, `HNavigationMenu`, `HBreadcrumbs`, `HPagination`, `HStepper`                                      |
| Feedback               | `HAlert`, `HToast`, `HToaster`, `HProgress`, `HSkeleton`, `HEmptyState`, `HConnectionState`                            |
| Foundations and layout | `HTheme`, `HButton`, `HIcon`, `HCard`, `HAppCard`, `HPageHeader`, `HPublicShell`, `HDashboardShell`                    |

The [registry](https://hearth-ui.samyx.net/#components) contains the complete collection, focused previews, and API references.

## Themes and mobile overlays

Use `HTheme` around your application or a deliberately distinct section:

- Palettes: **Sunset**, **Ocean**, **Forest**, **Dusk**, and **Rose**.
- Modes: `light`, `dark`, and `system` (follows the operating system).
- Density: `comfortable` or `compact`.
- Customization: pass `tokens`, or override inherited `--h-*` CSS variables.
- Helpers: `themeStyle()` filters a token object; `themeCSS()` serializes it as CSS.

```vue
<HTheme
  theme="ocean"
  mode="system"
  :mobile-breakpoint="768"
  :tokens="{ '--h-accent': '#ff7a2f' }"
>
  <!-- Application content -->
</HTheme>
```

Overlays adapt at **640 CSS pixels and below** by default. `mobileBreakpoint` on `HTheme` sets the inherited threshold; the same prop on an overlay overrides it. **Set `0` to keep the desktop presentation.** Changes take effect while overlays are open, preserving their state and focus.

- Dialogs, side sheets, command palettes, and dashboard navigation become bottom sheets.
- Popovers, picker panels, action menus, and searchable selection panels dock at the bottom.
- Navigation flyouts expand inline; tooltips stay anchored and support touch dismissal.
- Mobile modal dialogs retain native focus containment and lock background scrolling. Popovers retain nonmodal/light-dismiss behavior.

`themes.css` is also exported for token-only use; it does not replace `styles.css` when rendering Vue components.

## Forms and TypeScript

Components expose typed props, events, and `v-model`. Provide a visible `label` and a `name` for form controls.

| Control                                | Model                                       |
| -------------------------------------- | ------------------------------------------- |
| `HInput`, `HDatePicker`, `HTimePicker` | `string` (including `HInput type="number"`) |
| `HNumberInput`                         | `number \| null`                            |
| `HRange`                               | `number`                                    |
| `HMultiSelect`                         | `string[]`                                  |
| `HDateRangePicker`                     | `[start: string, end: string]`              |
| `HRangeSlider`                         | `[lower: number, upper: number]`            |
| `HFileUpload`                          | `File[]`                                    |

Use `FormData.getAll(name)` for multi-selects and range endpoints. Reset controlled Vue model values when resetting a form. File selection is local; the application owns uploading.

Named slots support custom content. For table cells, use `tableCellSlot(rowId, columnKey)` to produce the slot name. Component-specific references document every prop, event, slot, and CSS part.

## Page recipes

Start with `HAuthPage`, `HSettingsPage`, `HProviderSetup`, `HResourceDetail`, `HStatusPage`, `HErrorPage`, or `HFirstRunSetup`.

For example, `HAuthPage` emits `submit` with typed `AuthCredentials`. Bind loading/error state and connect that event to your authentication API. Hearth supplies presentation and interaction; your application owns routing, authentication, authorization, persistence, and requests.

## Documentation for agents

Version-matched references are included in the installed package:

```text
node_modules/@hearth-ui/vue/llms.txt
node_modules/@hearth-ui/vue/docs/components/<slug>/llms.txt
```

Start with `llms.txt`, then read the relevant component reference. The [hosted agent index](https://hearth-ui.samyx.net/llms.txt) follows the deployed showcase version.

## Rendering and browser support

Components support Vue server-side rendering; browser interactions initialize on the client. Target modern browsers with native dialog, Popover API, and modern CSS support.

For React, Astro, or plain HTML, use the companion **[@hearth-ui/elements](https://www.npmjs.com/package/@hearth-ui/elements)** package.

## License

MIT. See the included `LICENSE`.
