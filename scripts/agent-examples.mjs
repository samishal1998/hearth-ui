// Component-specific recipes complement the API extracted from source and catalog.
// `props` are assigned before connection, preserving custom-element form reset defaults.
export const examples = {
  HTheme: {
    vue: '<HTheme theme="sunset" mode="dark" :tokens="{ \'--h-accent\': \'#ff7a2f\' }">\n  <HButton variant="primary">Save</HButton>\n</HTheme>',
    imports: ["HButton"],
    props: {
      theme: "sunset",
      mode: "dark",
      tokens: { "--h-accent": "#ff7a2f" },
    },
    children: '<hearth-button variant="primary">Save</hearth-button>',
    notes: [
      "Use one theme island around an application or a deliberately different section. Do not wrap every component in another theme: a new island establishes its own preset values.",
      "Modes are dark, light, or system; system follows CSS media preferences. Comfortable and compact densities use 44px and 40px main controls.",
      "CSS custom properties inherit across shadow roots and native slots. Override --h-* tokens through the tokens property, an ancestor, or a host style. Use themeStyle() to filter a token object and themeCSS() to serialize trusted CSS values.",
    ],
    related: ["HAuthPage", "HDashboardShell", "HPublicShell"],
  },
  HIcon: {
    vue: '<HIcon name="server" :size="20" />',
    props: { name: "server", size: 20 },
    notes: [
      "Icons are decorative and aria-hidden. Name the containing button or link; an icon is not an accessible control on its own.",
      "Use a supported icon name. Unknown names fall back to apps.",
    ],
    related: ["HButton", "HBrand"],
  },
  HBrand: {
    vue: '<HBrand name="homestead" tagline="Your self-hosted home" />',
    props: { name: "homestead", tagline: "Your self-hosted home" },
    notes: [
      "The text wordmark adds the signature accent dot. The optional logo is decorative beside the name.",
      "For a fully custom mark or logo-only treatment, supply the brand slot of a page shell/auth page.",
    ],
    related: ["HPublicShell", "HDashboardShell", "HAuthPage"],
  },
  HButton: {
    vue: '<HButton variant="primary" icon="plus" @click="save">Add application</HButton>',
    script: "function save() { /* Perform the application action. */ }",
    props: { variant: "primary", icon: "plus" },
    children: "Add application",
    js: "element.addEventListener('click', () => { /* Perform the application action. */ });",
    notes: [
      "click is a native event, not a Vue-emitted array payload. Do not read event.detail[0] from a click.",
      'The default type is button. Set type="submit" or type="reset" explicitly inside forms. href creates a link for supported HTTP(S)/relative URLs.',
      "For icon-only controls, provide label or aria-label. loading disables the control and sets aria-busy.",
      "The web-component submit button invokes its owning form; do not rely on native SubmitEvent.submitter name/value semantics.",
    ],
    related: ["HButtonBar", "HIcon", "HDialog"],
  },
  HInput: {
    vue: '<HInput v-model="name" label="Application name" name="appName" required hint="Choose a recognizable name." />',
    script: "const name = ref('Photos');",
    props: {
      label: "Application name",
      name: "appName",
      value: "Photos",
      required: true,
      hint: "Choose a recognizable name.",
    },
    event: "change",
    notes: [
      "Supply a visible label and a name for form submission. Use type=email/url/password/number/etc. for native input behavior.",
      'The model is a string, including type="number". Use HRange for a numeric slider.',
      "hint/error associate explanatory text with the input; native required, pattern, and length constraints control browser validation. Application error text does not replace backend validation.",
    ],
    related: ["HTextarea", "HSelect", "HCombobox"],
  },
  HTextarea: {
    vue: '<HTextarea v-model="description" label="Description" name="description" :rows="4" :maxlength="400" />',
    script: "const description = ref('A home for our apps.');",
    props: {
      label: "Description",
      name: "description",
      value: "A home for our apps.",
      rows: 4,
      maxlength: 400,
    },
    event: "change",
    notes: [
      "Enter inserts a newline. The form adapter does not turn textarea Enter into form submission.",
      "The model and submitted value are strings. Choose vertical, none, or both for resize.",
    ],
    related: ["HInput", "HButtonBar"],
  },
  HSelect: {
    vue: '<HSelect v-model="category" label="Category" name="category" :options="options" />',
    script:
      "const category = ref('media');\nconst options = [{ value: 'media', label: 'Media' }, { value: 'home', label: 'Home' }];",
    props: {
      label: "Category",
      name: "category",
      value: "media",
      options: [
        { value: "media", label: "Media" },
        { value: "home", label: "Home" },
      ],
    },
    event: "change",
    notes: [
      "Prefer this native select for a short, fixed set that does not need search.",
      "Supply options as an array property, not a JSON attribute. Values are strings. Use placeholder with required when an explicit initial choice is needed.",
    ],
    related: ["HCombobox", "HMultiSelect", "HRadioGroup"],
  },
  HCombobox: {
    vue: '<HCombobox v-model="provider" label="Provider" name="provider" :options="options" required />',
    script:
      "const provider = ref<string | string[]>('docker');\nconst options = [{ value: 'docker', label: 'Docker', keywords: ['containers'] }, { value: 'manual', label: 'Manual' }];",
    props: {
      label: "Provider",
      name: "provider",
      value: "docker",
      required: true,
      options: [
        { value: "docker", label: "Docker", keywords: ["containers"] },
        { value: "manual", label: "Manual" },
      ],
    },
    event: "change",
    notes: [
      "Single selection uses a string; multiple mode uses string[]. The public model type is the union. Prefer HMultiSelect when you want an array-only TypeScript API.",
      "Filtering matches labels, descriptions, and keywords. This is selection from options, not free-form tag creation.",
      "Arrow keys navigate enabled results, Enter selects an active result, Escape closes, and Tab leaves. Enter while choosing must not submit the surrounding form.",
      "Handle search(query) in application code for remote fetching and bind loading. Existing selected IDs are retained while option data changes.",
      "The popup is local, not portaled; overflow-clipping ancestors can clip it. Large option lists are not virtualized.",
    ],
    related: ["HMultiSelect", "HSelect", "HInput"],
  },
  HMultiSelect: {
    vue: '<HMultiSelect v-model="providers" label="Providers" name="providers" :options="options" required />',
    script:
      "const providers = ref<string[]>(['docker']);\nconst options = [{ value: 'docker', label: 'Docker' }, { value: 'traefik', label: 'Traefik' }];",
    props: {
      label: "Providers",
      name: "providers",
      value: ["docker"],
      required: true,
      options: [
        { value: "docker", label: "Docker" },
        { value: "traefik", label: "Traefik" },
      ],
    },
    event: "change",
    notes: [
      "Always uses string[] and multiple selection. Do not pass a multiple flag; this is the typed wrapper around HCombobox.",
      "Inherits the combobox search, disabled-option, loading, keyboard, and local-popup behavior. Backspace removes the last selected item when the query is empty.",
      'One form entry is submitted per selected value under the same name. Read FormData.getAll("providers"), not Object.fromEntries() for this field.',
      "Set initial array properties before connecting the element if they should become its form-reset baseline.",
    ],
    related: ["HCombobox", "HCheckbox", "HSelect"],
  },
  HCheckbox: {
    vue: '<HCheckbox v-model="enabled" label="Email summaries" name="summaries" value="yes" />',
    script: "const enabled = ref(true);",
    props: {
      label: "Email summaries",
      name: "summaries",
      value: "yes",
      checked: true,
    },
    event: "change",
    notes: [
      "The model is boolean. The value prop is the submitted string for a checked checkbox; unchecked checkboxes contribute no form entry.",
      "indeterminate is a mixed visual state, not a third form value. Handle update:indeterminate(false) after user interaction, or use v-model:indeterminate.",
    ],
    related: ["HSwitch", "HRadioGroup", "HMultiSelect"],
  },
  HSwitch: {
    vue: '<HSwitch v-model="visible" label="Public dashboard" description="Allow anonymous read-only visits." name="public" value="yes" />',
    script: "const visible = ref(false);",
    props: {
      label: "Public dashboard",
      description: "Allow anonymous read-only visits.",
      name: "public",
      value: "yes",
      checked: false,
    },
    event: "change",
    notes: [
      "Use for an on/off setting. Use HCheckbox for selection or agreement and HRadioGroup for one choice among alternatives.",
      "The underlying checkbox exposes role=switch. Checked submits the value string; unchecked submits nothing. The model/event payload is boolean.",
    ],
    related: ["HCheckbox", "HRadioGroup"],
  },
  HRadioGroup: {
    vue: '<HRadioGroup v-model="access" label="Page access" name="access" :options="options" required />',
    script:
      "const access = ref('private');\nconst options = [{ value: 'private', label: 'Private' }, { value: 'public', label: 'Public' }];",
    props: {
      label: "Page access",
      name: "access",
      value: "private",
      required: true,
      options: [
        { value: "private", label: "Private" },
        { value: "public", label: "Public" },
      ],
    },
    event: "change",
    notes: [
      "Use the whole group rather than inventing individual hearth-radio elements. Radios in separate shadow roots do not share native grouping.",
      "Each group is one string-valued form field. Give separate fields separate names.",
      "Arrow keys, Home, and End move between enabled choices. Options can include descriptions and disabled states.",
    ],
    related: ["HSelect", "HCheckbox", "HSwitch"],
  },
  HRange: {
    vue: '<HRange v-model="minutes" label="Refresh interval" name="interval" :min="5" :max="60" :step="5" unit=" min" />',
    script: "const minutes = ref(15);",
    props: {
      label: "Refresh interval",
      name: "interval",
      value: 15,
      min: 5,
      max: 60,
      step: 5,
      unit: " min",
    },
    event: "change",
    notes: [
      "The model and emitted payload are numbers; FormData serializes the value as a string.",
      "The native range input owns bounds, stepping, and keyboard behavior. The visible output reflects its actual stepped value.",
      "Use valid finite min/max/step values, with a positive step.",
    ],
    related: ["HInput", "HProgress"],
  },
  HButtonBar: {
    vue: '<HButtonBar label="Form actions" align="end">\n  <HButton @click="cancel">Cancel</HButton>\n  <HButton type="submit" variant="primary">Save</HButton>\n</HButtonBar>',
    imports: ["HButton"],
    script: "function cancel() { /* Close or reset your editor. */ }",
    props: { label: "Form actions", align: "end" },
    children:
      '<hearth-button type="button">Cancel</hearth-button>\n<hearth-button type="submit" variant="primary">Save</hearth-button>',
    notes: [
      "This is a labeled role=group, not a toolbar with custom arrow-key navigation.",
      "Children keep their native focus, click, and form behavior. Explicitly choose submit/reset types as needed.",
      "align supports start, center, end, and between. orientation controls horizontal or vertical layout.",
    ],
    related: ["HButton", "HDialog", "HCard"],
  },
  HTabs: {
    vue: '<HTabs v-model="section" :items="items" label="Settings sections" activation="manual">\n  <template #general>General settings</template>\n  <template #appearance>Appearance settings</template>\n</HTabs>',
    script:
      "const section = ref('general');\nconst items = [{ value: 'general', label: 'General' }, { value: 'appearance', label: 'Appearance' }];",
    props: {
      label: "Settings sections",
      activation: "manual",
      items: [
        { value: "general", label: "General" },
        { value: "appearance", label: "Appearance" },
      ],
    },
    children:
      '<div slot="general">General settings</div>\n<div slot="appearance">Appearance settings</div>',
    event: "change",
    notes: [
      "Provide one named slot per item.value. Tab and panel IDs/relationships are generated by the component.",
      "Automatic activation selects on arrow navigation. Manual activation moves focus and waits for Enter/Space to select.",
      "Horizontal uses Left/Right; vertical uses Up/Down. Home/End move to enabled endpoints. The initial/default variant is pill; underline is available.",
      "Use navigation components instead when changing application routes rather than revealing a panel.",
    ],
    related: ["HAccordion", "HNavigationMenu", "HSidebar"],
  },
  HAccordion: {
    vue: '<HAccordion v-model="open" :items="items">\n  <template #storage>Your application owns its storage.</template>\n</HAccordion>',
    script:
      "const open = ref<string[]>([]);\nconst items = [{ id: 'storage', title: 'Where is data stored?' }];",
    props: { items: [{ id: "storage", title: "Where is data stored?" }] },
    children: '<div slot="storage">Your application owns its storage.</div>',
    event: "change",
    notes: [
      "The model is always an array of open IDs, including in single-expansion mode. Set multiple to allow several sections.",
      "Native details/summary provides disclosure behavior and keyboard activation. A slot named by item.id overrides its description fallback.",
      "Do not replace disclosure semantics with tab roles.",
    ],
    related: ["HTabs", "HCard"],
  },
  HNavigationMenu: {
    vue: '<HNavigationMenu :items="items" :active="active" label="Primary navigation" @navigate="active = $event" />',
    script:
      "const active = ref('home');\nconst items = [{ id: 'home', label: 'Home', href: '/' }, { id: 'manage', label: 'Manage', children: [{ id: 'apps', label: 'Applications' }, { id: 'providers', label: 'Providers' }] }];",
    props: {
      label: "Primary navigation",
      active: "home",
      items: [
        { id: "home", label: "Home", href: "/" },
        {
          id: "manage",
          label: "Manage",
          children: [
            { id: "apps", label: "Applications" },
            { id: "providers", label: "Providers" },
          ],
        },
      ],
    },
    js: "element.addEventListener('navigate', event => {\n  const [id] = event.detail;\n  element.active = id; // Integrate your router here.\n});",
    notes: [
      "Uses navigation links and native disclosure groups, not ARIA application-menu/menuitem roles.",
      "Groups use children: NavItem[]. ArrowDown on a group trigger enters its enabled links; Escape closes an open group and returns focus. Tab remains native.",
      "href supplies native navigation. Without href, navigate(id) is an application action; the library does not install a router.",
      "Popup positioning is local; avoid clipping ancestors when you need its full flyout visible.",
    ],
    related: ["HPublicShell", "HSidebar", "HBreadcrumbs"],
  },
  HSidebar: {
    vue: '<HSidebar brand="homestead" :items="items" :active="active" v-model:collapsed="collapsed" @navigate="active = $event" />',
    script:
      "const active = ref('overview');\nconst collapsed = ref(false);\nconst items = [{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'apps', label: 'Applications', icon: 'apps' }];",
    props: {
      brand: "homestead",
      active: "overview",
      items: [
        { id: "overview", label: "Overview", icon: "home" },
        { id: "apps", label: "Applications", icon: "apps" },
      ],
    },
    js: "element.addEventListener('navigate', event => { element.active = event.detail[0]; });",
    notes: [
      "Use inside your own layout. HDashboardShell already supplies sidebar/page structure and a mobile drawer.",
      "sections groups navigation under headings; collapsed provides an icon rail with accessible labels. Handle update:collapsed(boolean) for externally controlled state.",
      "Supply icons for recognizable collapsed navigation. Header/default/footer slots permit local composition.",
    ],
    related: ["HDashboardShell", "HNavigationMenu", "HBrand"],
  },
  HBreadcrumbs: {
    vue: '<HBreadcrumbs :items="items" @navigate="navigate" />',
    script:
      "const items = [{ id: 'home', label: 'Workspace', href: '/' }, { id: 'settings', label: 'Settings', href: '/settings' }, { id: 'access', label: 'Access' }];\nfunction navigate(id: string) { /* Integrate your router if using action crumbs. */ }",
    props: {
      items: [
        { id: "home", label: "Workspace", href: "/" },
        { id: "settings", label: "Settings", href: "/settings" },
        { id: "access", label: "Access" },
      ],
    },
    notes: [
      "The last item is the current page and is rendered as text, not a navigation destination.",
      "Earlier items can be links or navigate(id) buttons. Labels wrap; use short, recognizable hierarchy names.",
    ],
    related: ["HNavigationMenu", "HPageHeader", "HDashboardShell"],
  },
  HPagination: {
    vue: '<HPagination v-model="page" :total="120" :page-size="20" @change="loadPage" />',
    script:
      "const page = ref(1);\nfunction loadPage(page: number) { /* Fetch this page in your application. */ }",
    props: { total: 120, pageSize: 20, modelValue: 1 },
    js: "element.addEventListener('change', event => {\n  const [page] = event.detail;\n  // Fetch or render the requested page.\n});",
    notes: [
      "Page numbers are 1-based. total is the item count, not the page count.",
      "Bounds, previous/next availability, current-page semantics, and ellipses are supplied. Data fetching and URL synchronization belong to the application.",
    ],
    related: ["HButtonBar", "HCard", "HProgress"],
  },
  HCard: {
    vue: '<HCard title="Workspace settings" description="A few thoughtful defaults.">\n  <p>Your settings go here.</p>\n  <template #footer><HButton variant="primary">Save</HButton></template>\n</HCard>',
    imports: ["HButton"],
    props: {
      title: "Workspace settings",
      description: "A few thoughtful defaults.",
    },
    children:
      '<p>Your settings go here.</p>\n<div slot="footer"><hearth-button variant="primary">Save</hearth-button></div>',
    notes: [
      "Use a plain surface for arbitrary content. HAppCard is specifically for an application launcher, HStatCard for a metric.",
      "The header slot replaces the default title/description header. Default and footer slots hold application content.",
    ],
    related: ["HAppCard", "HStatCard", "HButtonBar"],
  },
  HAppCard: {
    vue: '<HAppCard name="Photos" url="https://photos.example.com" description="Our photo library." category="Media" status="healthy" editable :favorite="favorite" @favorite-change="favorite = $event" @edit="edit" @inspect="inspect" />',
    script:
      "const favorite = ref(false);\nfunction edit() { /* Open your editor. */ }\nfunction inspect() { /* Show your source information. */ }",
    props: {
      name: "Photos",
      url: "https://photos.example.com",
      description: "Our photo library.",
      category: "Media",
      status: "healthy",
      editable: true,
      favorite: false,
    },
    js: "element.addEventListener('favorite-change', event => { element.favorite = event.detail[0]; });\nelement.addEventListener('edit', () => { /* Open your editor. */ });\nelement.addEventListener('inspect', () => { /* Show source information. */ });",
    notes: [
      "favorite is consumer-controlled. Update it after favorite-change(checked); persist it in application storage if needed.",
      "editable exposes owner controls; it is a presentation flag, not authorization. Enforce permissions on your server.",
      "name/url/metadata are application data. The component does not discover services, probe health, or retrieve provenance. HTTP(S)/relative launch URLs are supported; unsafe schemes are not launched.",
    ],
    related: ["HCard", "HBadge", "HEmptyState"],
  },
  HStatCard: {
    vue: '<HStatCard label="Healthy apps" :value="8" detail="/ 10" icon="health" tone="success" />',
    props: {
      label: "Healthy apps",
      value: 8,
      detail: "/ 10",
      icon: "health",
      tone: "success",
    },
    notes: [
      "value is a string or number. Supply already formatted values where formatting matters.",
      "Use concise labels and optional detail for a denominator or supporting context; the component does not calculate the metric.",
    ],
    related: ["HProgress", "HCard", "HBadge"],
  },
  HBadge: {
    vue: '<HBadge label="Healthy" tone="success" dot />',
    props: { label: "Healthy", tone: "success", dot: true },
    notes: [
      "Pair color with meaningful text; a status dot alone is insufficient.",
      "This is a noninteractive label, not a toggle, filter, or button. It does not automatically create a live region.",
    ],
    related: ["HAlert", "HProgress", "HAppCard"],
  },
  HAlert: {
    vue: '<HAlert v-if="visible" title="Preferences saved" description="Your workspace is ready." tone="success" dismissible @dismiss="visible = false" />',
    script: "const visible = ref(true);",
    props: {
      title: "Preferences saved",
      description: "Your workspace is ready.",
      tone: "success",
      dismissible: true,
    },
    js: "element.addEventListener('dismiss', () => element.remove());",
    notes: [
      "Danger uses role=alert; other tones use role=status. Avoid stacking repeated live announcements for routine updates.",
      "dismiss only requests dismissal. Remove/hide the component in your handler; it does not own notification storage.",
    ],
    related: ["HBadge", "HDialog", "HEmptyState"],
  },
  HEmptyState: {
    vue: '<HEmptyState title="Your trail starts here." description="Add an application to build your dashboard." icon="apps">\n  <HButton variant="primary" @click="add">Add application</HButton>\n</HEmptyState>',
    imports: ["HButton"],
    script: "function add() { /* Open your creation flow. */ }",
    props: {
      title: "Your trail starts here.",
      description: "Add an application to build your dashboard.",
      icon: "apps",
    },
    children:
      '<hearth-button variant="primary">Add application</hearth-button>',
    notes: [
      "Use for first-run or no-results states, with one useful next action in the default slot.",
      "Use HSkeleton for content that is still loading, and HAlert for a problem that requires attention.",
    ],
    related: ["HSkeleton", "HAlert", "HButton"],
  },
  HDialog: {
    vue: '<HButton @click="open = true">Edit workspace</HButton>\n<HDialog :open="open" title="Workspace details" @close="open = false">\n  <HInput label="Workspace name" />\n  <template #footer><HButton @click="open = false">Done</HButton></template>\n</HDialog>',
    imports: ["HButton", "HInput"],
    script: "const open = ref(false);",
    props: { title: "Workspace details" },
    children: '<hearth-input label="Workspace name"></hearth-input>',
    js: "element.addEventListener('close', () => { element.open = false; });\nconst trigger = document.createElement('button');\ntrigger.textContent = 'Edit workspace';\ntrigger.addEventListener('click', () => { element.open = true; });\nmount.before(trigger);",
    notes: [
      "Use the open prop/property; do not set a native open attribute on an inner dialog or call showModal() yourself.",
      "Handle close() by setting open=false. Native dialog supplies modal focus behavior, Escape dismissal, and focus return.",
      "Keep the component inside its theme island. The native top layer removes the need to teleport the component away from inherited tokens.",
    ],
    related: ["HButtonBar", "HInput", "HAlert"],
  },
  HProgress: {
    vue: '<HProgress label="Discovery scan" :value="35" :max="100" />\n<HProgress label="Connecting" indeterminate />',
    props: { label: "Discovery scan", value: 35, max: 100 },
    notes: [
      "value/max describe completed work. Omitting value, or setting indeterminate, creates an indeterminate progress indicator.",
      "The native progress element supplies progressbar semantics; do not add conflicting roles or fake percentages for unknown progress.",
      "Use HStatCard for a static metric and HSkeleton for loading content shapes.",
    ],
    related: ["HSkeleton", "HStatCard", "HAlert"],
  },
  HSkeleton: {
    vue: '<HSkeleton variant="text" :lines="3" label="Loading applications" />',
    props: { variant: "text", lines: 3, label: "Loading applications" },
    notes: [
      "Shapes are text, rectangle, and circle. Text lines are bounded to 1–20. width/height are CSS strings.",
      'The label creates a loading status. Use label="" for decorative instances when another loading announcement already exists.',
      "Animation respects prefers-reduced-motion. Replace skeletons with actual content when ready.",
    ],
    related: ["HProgress", "HEmptyState", "HAvatar"],
  },
  HAvatar: {
    vue: '<HAvatar name="Sami Mishal" :size="40" tone="accent" />',
    props: { name: "Sami Mishal", size: 40, tone: "accent" },
    notes: [
      "name supplies the accessible name and initials fallback. src is optional; failed images fall back to initials.",
      "Use decorative when a nearby visible name already labels the person. This is not an interactive profile menu.",
    ],
    related: ["HBrand", "HNavigationMenu", "HSkeleton"],
  },
  HSeparator: {
    vue: '<HSeparator label="Advanced settings" />',
    props: { label: "Advanced settings" },
    notes: [
      "Decorative by default. Set decorative=false when separator semantics are meaningful to assistive technology.",
      "Horizontal is the default. Vertical separators are intended for a flex/grid layout with meaningful surrounding height.",
    ],
    related: ["HCard", "HButtonBar"],
  },
  HPageHeader: {
    vue: '<HPageHeader title="Your apps." accent="Right where you left them." description="A home for everything you host." eyebrow="Your workspace" variant="hero">\n  <HButton variant="primary">Add application</HButton>\n</HPageHeader>',
    imports: ["HButton"],
    props: {
      title: "Your apps.",
      accent: "Right where you left them.",
      description: "A home for everything you host.",
      eyebrow: "Your workspace",
      variant: "hero",
    },
    children:
      '<hearth-button variant="primary">Add application</hearth-button>',
    notes: [
      "Use plain for a regular introduction and hero for the atmospheric panel. decoration=false removes the default hero art.",
      "The component renders h1 by default. Manage the page heading hierarchy when composing multiple headers; the title slot permits deliberate replacement.",
      "The default slot is the action area. aside adds supporting content.",
    ],
    related: ["HDashboardShell", "HPublicShell", "HButtonBar"],
  },
  HPublicShell: {
    vue: '<HPublicShell brand="homestead" :items="items">\n  <template #actions><HButton href="/login">Sign in</HButton></template>\n  <HPageHeader title="A home for what we host." />\n</HPublicShell>',
    imports: ["HButton", "HPageHeader"],
    script: "const items = [{ id: 'guide', label: 'Guide', href: '/guide' }];",
    props: {
      brand: "homestead",
      items: [{ id: "guide", label: "Guide", href: "/guide" }],
    },
    children:
      '<hearth-button slot="actions" href="/login">Sign in</hearth-button>\n<hearth-page-header title="A home for what we host."></hearth-page-header>',
    notes: [
      "Use for a landing page, guide, or public listing. It does not make underlying data public or grant access to linked applications.",
      "The default slot is page content. actions holds account/primary actions; navigation and footer can be replaced.",
      "Provide real URLs or handle navigate(id) with your application router.",
    ],
    related: ["HAuthPage", "HDashboardShell", "HNavigationMenu"],
  },
  HDashboardShell: {
    vue: '<HDashboardShell brand="homestead" :items="items" :active="active" page-title="Overview" username="Owner" @navigate="active = $event" @logout="signOut">\n  <HPageHeader title="Your workspace." />\n</HDashboardShell>',
    imports: ["HPageHeader"],
    script:
      "const active = ref('overview');\nconst items = [{ id: 'overview', label: 'Overview', icon: 'home' }, { id: 'apps', label: 'Applications', icon: 'apps' }];\nfunction signOut() { /* Revoke the application session. */ }",
    props: {
      brand: "homestead",
      active: "overview",
      pageTitle: "Overview",
      username: "Owner",
      items: [
        { id: "overview", label: "Overview", icon: "home" },
        { id: "apps", label: "Applications", icon: "apps" },
      ],
    },
    children:
      '<hearth-page-header title="Your workspace."></hearth-page-header>',
    js: "element.addEventListener('navigate', event => { element.active = event.detail[0]; });\nelement.addEventListener('logout', () => { /* Revoke the application session. */ });",
    notes: [
      "Use as the authenticated workspace frame. It supplies desktop/sidebar and mobile-drawer presentation, not authentication or authorization.",
      "The desktop navigation slot can replace the default list, but the mobile drawer uses items. Keep items populated even when customizing desktop navigation.",
      "header-actions, sidebar-footer, brand, and footer support application composition. The default slot is the content region.",
    ],
    related: ["HPublicShell", "HAuthPage", "HSidebar"],
  },
  HAuthPage: {
    vue: '<HAuthPage brand="homestead" :loading="loading" :error="error" @submit="signIn" />',
    script:
      "const loading = ref(false);\nconst error = ref('');\nasync function signIn(credentials: { username: string; password: string }) {\n  // Call your auth API, manage loading/error, and navigate after success.\n  // Do not persist or log credentials.\n}",
    props: { brand: "homestead" },
    js: "element.addEventListener('submit', async event => {\n  const [{ username, password }] = event.detail;\n  // Call your auth API and set element.loading / element.error.\n  // Do not persist or log credentials.\n});",
    notes: [
      "This is a complete presentation template, not an authentication service. Enforce sessions, authorization, and private API access in application code.",
      "submit emits {username, password}. Bind loading and error to application state; the component does not fetch or store credentials.",
      "Copy, brand/logo, story, submit label, identifier type, and note are configurable. For OAuth or other fields, replace the entire form slot and own its submission.",
      "Do not place fields in unrelated slots and expect them to join the internal form across shadow boundaries.",
    ],
    related: ["HTheme", "HPublicShell", "HDashboardShell"],
  },
};
