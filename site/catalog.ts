export const catalog = [
  {
    name: "HTheme",
    tag: "hearth-theme",
    category: "Foundation",
    description:
      "A scoped theme island. CSS variables flow through Vue trees, native slots, and shadow roots.",
    props:
      "theme: string = sunset · mode: dark | light | system · density: comfortable | compact · tokens: ThemeTokens",
    events: "None",
    slots: "default",
    parts: "base",
  },
  {
    name: "HIcon",
    tag: "hearth-icon",
    category: "Foundation",
    description:
      "A small, consistent supporting icon set. Decorative by default; put the accessible label on its control.",
    props: "name: string · size: number = 20",
    events: "None",
    slots: "None",
    parts: "icon",
  },
  {
    name: "HBrand",
    tag: "hearth-brand",
    category: "Foundation",
    description:
      "A text wordmark with the signature accent. Use your own name, optional logo, and tagline.",
    props: "name: string = hearth · logo: string · tagline: string",
    events: "None",
    slots: "None",
    parts: "base",
  },
  {
    name: "HButton",
    tag: "hearth-button",
    category: "Controls",
    description:
      "Native button or link behavior, clear focus, icon-only labels, and restrained press feedback.",
    props:
      "variant: primary | secondary | ghost | danger · size: regular | compact · type: button | submit | reset · disabled, loading, iconOnly: boolean · icon, trailingIcon, label, href, target: string",
    events: "Native click",
    slots: "default",
    parts: "control, label",
  },
  {
    name: "HInput",
    tag: "hearth-input",
    category: "Controls",
    description:
      "A labeled input with help/error text and native validation. Web components participate in their owning form.",
    props:
      "modelValue, value, label, name, placeholder, hint, error, autocomplete, pattern: string · type: text | email | password | url | search | number | tel · required, disabled, readonly: boolean · minlength, maxlength: number · min, max: string | number",
    events: "update:modelValue(value), change(value)",
    slots: "None",
    parts: "base, label, control, hint",
  },
  {
    name: "HSelect",
    tag: "hearth-select",
    category: "Controls",
    description:
      "A native select with labeled options, not a recreated browser picker.",
    props:
      "modelValue, value, label, name, placeholder, hint, error: string · options: {value, label, disabled?}[] · required, disabled: boolean",
    events: "update:modelValue(value), change(value)",
    slots: "None",
    parts: "base, label, control, hint",
  },
  {
    name: "HSwitch",
    tag: "hearth-switch",
    category: "Controls",
    description:
      "A keyboard-operable switch backed by a real checkbox, with form participation in custom-element mode.",
    props:
      "modelValue, checked, disabled, required: boolean · label, description, name, value: string",
    events: "update:modelValue(checked), change(checked)",
    slots: "None",
    parts: "base, label, description, control",
  },
  {
    name: "HBadge",
    tag: "hearth-badge",
    category: "Feedback",
    description:
      "A compact label with optional status dot. Color always accompanies text.",
    props:
      "tone: neutral | accent | success | warning | danger | info · label: string · dot: boolean",
    events: "None",
    slots: "default",
    parts: "base",
  },
  {
    name: "HAlert",
    tag: "hearth-alert",
    category: "Feedback",
    description:
      "Inline feedback for success, information, and problems. Errors announce as alerts; other tones use status.",
    props: "title, description: string · tone: Tone · dismissible: boolean",
    events: "dismiss()",
    slots: "default",
    parts: "base, title, description",
  },
  {
    name: "HEmptyState",
    tag: "hearth-empty-state",
    category: "Feedback",
    description:
      "An inviting first-run or no-results state, with room for a useful next action.",
    props: "title, description, icon: string",
    events: "None",
    slots: "default (actions)",
    parts: "base, icon, title, description",
  },
  {
    name: "HDialog",
    tag: "hearth-dialog",
    category: "Feedback",
    description:
      "A native modal dialog with focus containment, Escape dismissal, and focus return. Keep it inside your theme island.",
    props: "open: boolean · title: string · description: string",
    events: "close() — set open=false in your handler",
    slots: "default, footer",
    parts: "dialog, header, body",
  },
  {
    name: "HTabs",
    tag: "hearth-tabs",
    category: "Controls",
    description:
      "Tabs with roving focus, arrow/Home/End keys, and properly associated panels.",
    props: "items: {value, label, disabled?}[] · modelValue, label: string",
    events: "update:modelValue(value), change(value)",
    slots: "One named slot per item.value",
    parts: "base, list, tab, panel",
  },
  {
    name: "HCard",
    tag: "hearth-card",
    category: "Surfaces",
    description:
      "The common surface: restrained depth, a readable heading, and generous space for your content.",
    props: "title, description: string",
    events: "None",
    slots: "header, default, footer",
    parts: "base, header, body",
  },
  {
    name: "HAppCard",
    tag: "hearth-app-card",
    category: "Surfaces",
    description:
      "A launchable application card with source, status, and optional owner controls. Favorite state belongs to your app.",
    props:
      "name, url, description, category, image, source, target: string · status: healthy | unknown | degraded | unreachable | missing · editable, favorite: boolean",
    events: "favorite-change(checked), inspect(), edit()",
    slots: "default (beside category)",
    parts: "base, app-icon, title, description, footer, favorite",
  },
  {
    name: "HStatCard",
    tag: "hearth-stat-card",
    category: "Surfaces",
    description:
      "A quiet overview metric with tabular numbers, an icon, and a supporting label.",
    props:
      "label: string · value: string | number · detail, icon: string · tone: Tone",
    events: "None",
    slots: "None",
    parts: "base, icon, value, label",
  },
  {
    name: "HPageHeader",
    tag: "hearth-page-header",
    category: "Layouts",
    description:
      "A plain page introduction or the signature atmospheric dashboard hero.",
    props:
      "title, accent, description, eyebrow: string · variant: plain | hero · decoration: boolean",
    events: "None",
    slots: "title, default (actions), aside",
    parts: "base, eyebrow, title, description, actions",
  },
  {
    name: "HPublicShell",
    tag: "hearth-public-shell",
    category: "Layouts",
    description:
      "A public landing-page frame: brand, a few links, an account action, and a quiet footer.",
    props:
      "brand, logo, brandHref, active, footerText: string · items: NavItem[]",
    events: "navigate(id)",
    slots: "brand, navigation, actions, default, footer",
    parts: "base, header, content, footer",
  },
  {
    name: "HDashboardShell",
    tag: "hearth-dashboard-shell",
    category: "Layouts",
    description:
      "A complete dashboard frame with desktop sidebar, native mobile navigation dialog, account controls, and content area.",
    props:
      "brand, logo, workspace, workspaceDescription, active, pageTitle, username, userRole, footerNote: string · items: NavItem[]",
    events: "navigate(id), logout()",
    slots:
      "brand, navigation (desktop), header-actions, sidebar-footer, default, footer",
    parts: "base, sidebar, header, content, footer, mobile-navigation",
  },
  {
    name: "HAuthPage",
    tag: "hearth-auth-page",
    category: "Layouts",
    description:
      "The full split-screen welcome/login page. It emits credentials; your application owns authentication.",
    props:
      "brand, logo, title, description, eyebrow, storyTitle, storyAccent, storyDescription, storyEyebrow, storyFooter, submitLabel, usernameLabel, passwordAutocomplete, note, error: string · usernameType: text | email · passwordMinLength: number · loading, scenery: boolean",
    events: "submit({username, password})",
    slots:
      "brand, story-extra, form (replace the entire default form), note, footer",
    parts: "base, story, panel, title",
  },
];
