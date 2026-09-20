// Component-specific recipes complement the API extracted from source and catalog.
// `props` are assigned before connection, preserving custom-element form reset defaults.
export const examples = {
  HThemeSwitcher: {
    vue: '<HTheme :mode="mode"><HThemeSwitcher v-model="mode" /></HTheme>',
    imports: ["HTheme"],
    script: "const mode = ref<'light'|'dark'|'system'>('system');",
    props: { value: "system" },
    notes: [
      "Added in v0.5.0. Emits light, dark, or system; system is the auto mode. Bind the value to HTheme mode. Applications own persistence and global theme state.",
    ],
    related: ["HTheme", "HSegmentedControl"],
  },
  HNumberInput: {
    vue: '<HNumberInput v-model="replicas" label="Replicas" name="replicas" :min="0" :max="10" />',
    script: "const replicas = ref<number | null>(2);",
    props: { label: "Replicas", name: "replicas", value: 2, min: 0, max: 10 },
    event: "change",
    notes: [
      "Added in v0.5.0. Empty or incomplete numeric input emits null, never NaN. The native number input owns min/max/step validity. Step buttons use native stepUp/stepDown and emit a committed change. Invalid manually entered values remain visible for validation.",
    ],
    related: ["HInput", "HRange", "HRangeSlider"],
  },
  HTimePicker: {
    vue: '<HTimePicker v-model="time" label="Backup time" name="time" :step="900" />',
    script: "const time = ref('09:30');",
    props: { label: "Backup time", name: "time", value: "09:30", step: 900 },
    event: "change",
    notes: [
      "Added in v0.5.0. Uses input type=time; browser and OS determine picker appearance and 12/24-hour presentation. Values are HH:mm or HH:mm:ss, or an empty string. Step is in seconds. No date, time zone conversion, or custom clock face is supplied.",
    ],
    related: ["HDatePicker", "HInput"],
  },
  HCalendar: {
    vue: '<HCalendar v-model="date" month="2026-09" label="Schedule" :disabled-dates="[\'2026-09-22\']" />',
    script: "const date = ref('2026-09-20');",
    props: {
      value: "2026-09-20",
      month: "2026-09",
      label: "Schedule",
      disabledDates: ["2026-09-22"],
    },
    event: "change",
    notes: [
      "Added in v0.5.0. Gregorian date-only values use YYYY-MM-DD, years 0001–9999. month uses YYYY-MM. Locale formats labels; weekStartsOn is 0 (Sunday) or 1 (Monday). Supply month/today for deterministic initial rendering across a UTC midnight boundary.",
      "Arrow keys move by day/week; Home/End move within a week, PageUp/PageDown by month, Shift+PageUp/PageDown by year. Enter/Space selects. Navigation skips unavailable dates with a bounded ten-year search. min/max bound navigation.",
      "This inline calendar is not a form control. Use HDatePicker for form association. Applications own date fetching and disabled-date lists.",
    ],
    related: ["HDatePicker", "HDateRangePicker"],
  },
  HDatePicker: {
    vue: '<HDatePicker v-model="date" label="Maintenance date" name="date" required />',
    script: "const date = ref('2026-09-20');",
    props: {
      label: "Maintenance date",
      name: "date",
      value: "2026-09-20",
      required: true,
    },
    event: "change",
    notes: [
      "Added in v0.5.0. Combines a native date input with HCalendar in a native top-layer popover. Selection returns focus to the field; Escape returns to the popover trigger. Dates are YYYY-MM-DD or empty, without time zones.",
      "min/max and required use native validity. readonly blocks both typing and the calendar trigger. Native browser date controls remain available.",
    ],
    related: ["HCalendar", "HTimePicker", "HDateRangePicker"],
  },
  HDateRangePicker: {
    vue: '<HDateRangePicker v-model="dates" label="Report window" name="dates" required />',
    script: "const dates = ref<[string,string]>(['2026-09-20','2026-09-25']);",
    props: {
      label: "Report window",
      name: "dates",
      value: ["2026-09-20", "2026-09-25"],
      required: true,
    },
    event: "change",
    notes: [
      "Added in v0.5.0. Two date fields with calendar popovers, not a continuous multi-month selection surface. Model is [start,end]; empty values are empty strings.",
      "Native form submission uses the same name twice, in start/end order; use FormData.getAll(name). Crossed dates fail validity rather than being silently swapped. min/max apply to both endpoints; required applies to each.",
    ],
    related: ["HDatePicker", "HCalendar"],
  },
  HRangeSlider: {
    vue: '<HRangeSlider v-model="capacity" label="Capacity" name="capacity" unit="%" />',
    script: "const capacity = ref<[number,number]>([20,80]);",
    props: { label: "Capacity", name: "capacity", value: [20, 80], unit: "%" },
    event: "change",
    notes: [
      "Added in v0.5.0. Two native range controls share a track and retain native keyboard stepping. Handles cannot cross; both remain separately keyboard-focusable at equal values.",
      "Model is [lower,upper]. FormData.getAll(name) returns two values in that order. Supply finite bounds and a positive step. Applications own unit conversion.",
    ],
    related: ["HRange", "HNumberInput"],
  },
  HStepper: {
    vue: '<HStepper v-model="step" :items="steps" interactive />',
    script:
      "const step = ref('configure'); const steps = [{id:'configure',label:'Configure'},{id:'review',label:'Review'},{id:'deploy',label:'Deploy',disabled:true}];",
    props: {
      modelValue: "configure",
      items: [
        { id: "configure", label: "Configure" },
        { id: "review", label: "Review" },
        { id: "deploy", label: "Deploy", disabled: true },
      ],
      interactive: true,
    },
    event: "change",
    notes: [
      "Added in v0.5.0. Ordered workflow indicator, not a form or tab panel controller. Applications own current step, completion, validation, and routing. Interactive mode uses native buttons; static mode adds no tab stops.",
      "Completed steps include a text label as well as a check mark. The current list item has aria-current=step. Disabled buttons cannot request navigation.",
    ],
    related: ["HFirstRunSetup", "HTabs"],
  },
  HTimeline: {
    vue: '<HTimeline :items="activity" label="Deployment history"><template #detail:deployed><p>All three instances passed their health checks.</p></template></HTimeline>',
    script:
      "const activity = [{id:'deployed',title:'Deployment healthy',timestamp:'19 September, 12:04 UTC',dateTime:'2026-09-19T12:04:00Z',tone:'success' as const},{id:'started',title:'Deployment started',description:'Version 1.2.0 queued for rollout.'}];",
    props: {
      label: "Deployment history",
      items: [
        {
          id: "deployed",
          title: "Deployment healthy",
          timestamp: "19 September, 12:04 UTC",
          dateTime: "2026-09-19T12:04:00Z",
          tone: "success",
        },
        {
          id: "started",
          title: "Deployment started",
          description: "Version 1.2.0 queued for rollout.",
        },
      ],
    },
    children:
      '<p slot="detail:deployed">All three instances passed their health checks.</p>',
    notes: [
      "Added in v0.5.0. Earlier release archives do not contain HTimeline.",
      "Items render in supplied order with stable, unique IDs. Your application owns sorting, pagination, and fetching. The list is not virtualized; supply a bounded page of activity for large histories.",
      "timestamp is display text; dateTime is the machine-readable HTML time value. Format dates in the application for deterministic SSR and the intended locale/time zone.",
      "Use descriptive titles and details for status; marker tone is supplementary. Optional safe href values turn titles into native links.",
      "detail:<id> replaces one event's description and works in Vue and web components. The empty slot replaces emptyText. loading retains existing items and shows loadingText instead of the empty state; this history is not a live log announcer.",
    ],
    related: ["HLogViewer", "HStatusPage", "HResourceDetail"],
  },
  HPopover: {
    vue: '<HPopover label="Filters" title="Filter applications"><HInput label="Name contains" /></HPopover>',
    imports: ["HInput"],
    props: { label: "Filters", title: "Filter applications" },
    children: '<hearth-input label="Name contains"></hearth-input>',
    notes: [
      "A nonmodal native popover stays in the top layer, so clipped ancestors do not hide it and theme inheritance remains intact. Current browsers need the Popover API.",
      "Use its built-in trigger, or control open and respond to update:open. Keep interactive content in the default slot. Escape closes and returns focus.",
    ],
    related: ["HDropdownMenu", "HTooltip", "HDialog"],
  },
  HTooltip: {
    vue: '<HTooltip text="Refresh application metadata" label="Refresh help" />',
    props: { text: "Refresh application metadata", label: "Refresh help" },
    notes: [
      "Provide short supplementary help, not essential instructions available only on hover.",
      "The default trigger is focusable. A slotted custom trigger must also be focusable and have its own accessible name.",
      "Hover delay, focus access, hover persistence, and Escape dismissal are supported; interactive content belongs in HPopover.",
    ],
    related: ["HPopover", "HButton"],
  },
  HDropdownMenu: {
    vue: '<HDropdownMenu label="Application actions" :items="actions" @select="act" />',
    script:
      "const actions = [{id:'edit',label:'Edit',icon:'settings'},{id:'remove',label:'Remove',danger:true,separatorBefore:true}];\nfunction act(id: string) { /* Perform the selected application action. */ }",
    props: {
      label: "Application actions",
      items: [
        { id: "edit", label: "Edit", icon: "settings" },
        { id: "remove", label: "Remove", danger: true, separatorBefore: true },
      ],
    },
    event: "select",
    notes: [
      "This is a command menu with menuitem roles; use HNavigationMenu for route navigation.",
      "Arrow keys, Home/End, typeahead, Escape, and Tab work with disabled commands excluded from focus navigation. select(id) requests an application action.",
    ],
    related: ["HNavigationMenu", "HPopover", "HDataTable"],
  },
  HToast: {
    vue: '<HToast v-if="visible" title="Preferences saved" tone="success" :duration="5000" @dismiss="visible=false" />',
    script: "const visible = ref(true);",
    props: { title: "Preferences saved", tone: "success", duration: 5000 },
    js: "element.addEventListener('dismiss', () => element.remove());",
    notes: [
      "The timer pauses while hovered, focused, or the document is hidden. duration=0 persists until dismissed.",
      "dismiss requests removal; remove the toast in the consuming app. Use an appropriate lifetime for important errors.",
      "action requests the supplied action; application code handles it.",
    ],
    related: ["HToaster", "HAlert"],
  },
  HToaster: {
    vue: '<HToaster :items="messages" @dismiss="dismiss" />',
    script:
      "const messages = ref([{id:'saved',title:'Preferences saved',tone:'success' as const}]);\nfunction dismiss(id: string) { messages.value = messages.value.filter(item => item.id !== id); }",
    props: {
      items: [
        {
          id: "saved",
          title: "Preferences saved",
          tone: "success",
          duration: 0,
        },
      ],
    },
    js: "element.addEventListener('dismiss', event => { element.items = element.items.filter(item => item.id !== event.detail[0]); });",
    notes: [
      "The items array is consumer-owned. Remove dismissed IDs and supply unique stable IDs for notifications.",
      "The stack is a fixed-position region. Place it inside an active modal context when notifications must be available to that modal. It does not install a global notification service.",
    ],
    related: ["HToast", "HAlert", "HDialog"],
  },
  HSheet: {
    vue: '<HButton @click="open=true">Inspect provider</HButton>\n<HSheet :open="open" title="Provider details" @close="open=false"><p>Your editor goes here.</p></HSheet>',
    imports: ["HButton"],
    script: "const open = ref(false);",
    props: { title: "Provider details" },
    children: "<p>Your editor goes here.</p>",
    js: "element.addEventListener('close', () => { element.open = false; });\nconst trigger = document.createElement('button'); trigger.textContent = 'Inspect provider'; trigger.addEventListener('click', () => { element.open = true; }); mount.before(trigger);",
    notes: [
      "A modal native dialog styled as a left/right sheet. Handle close by setting open=false.",
      "Keep it inside a theme island. Default and footer slots are application-owned; the component does not persist edits.",
    ],
    related: ["HDialog", "HResourceDetail", "HDescriptionList"],
  },
  HDataTable: {
    vue: '<HDataTable :rows="rows" :columns="columns" label="Applications" selectable v-model:selected="selected" :page-size="10" />',
    script:
      "const selected = ref<string[]>([]);\nconst rows = [{id:'photos',name:'Photos',port:2283},{id:'media',name:'Media',port:8096}];\nconst columns = [{key:'name',label:'Name',sortable:true},{key:'port',label:'Port',sortable:true}];",
    props: {
      label: "Applications",
      selectable: true,
      rows: [
        { id: "photos", name: "Photos", port: 2283 },
        { id: "media", name: "Media", port: 8096 },
      ],
      columns: [
        { key: "name", label: "Name", sortable: true },
        { key: "port", label: "Port", sortable: true },
      ],
      pageSize: 10,
    },
    event: "selection-change",
    notes: [
      "Supply unique string row IDs and column keys. Default rendering escapes cell text and handles flat primitive values.",
      "tableCellSlot(rowId, columnKey) returns a stable per-cell slot name usable in Vue and native slots. Scoped slots are not required.",
      "Client mode sorts and paginates supplied rows. manual mode leaves data processing to the app; total controls the page count. Handle sort-change/page-change for server queries.",
      "Selection on the header applies to enabled rows on the current page. selected/disabledRows are ID arrays. The table uses semantic table markup, not spreadsheet-grid keyboard behavior.",
    ],
    related: ["HPagination", "HDropdownMenu", "HCheckbox"],
  },
  HDescriptionList: {
    vue: '<HDescriptionList :items="fields" :columns="2" />',
    script:
      "const fields = [{key:'version',label:'Version',value:'1.0.0'},{key:'endpoint',label:'Endpoint',value:'https://example.com',href:'https://example.com'}];",
    props: {
      columns: 2,
      items: [
        { key: "version", label: "Version", value: "1.0.0" },
        {
          key: "endpoint",
          label: "Endpoint",
          value: "https://example.com",
          href: "https://example.com",
        },
      ],
    },
    notes: [
      "Native dl/dt/dd semantics suit resource metadata and provenance. Values are escaped primitive text by default.",
      "Override a value through a slot named value:<item.key>. Use HDataTable for comparable records with columns.",
    ],
    related: ["HResourceDetail", "HCopyField", "HDataTable"],
  },
  HList: {
    vue: '<HList label="Integrations"><HListItem title="Docker" description="Local infrastructure" icon="server" badge="Connected" tone="success" /></HList>',
    imports: ["HListItem"],
    props: { label: "Integrations" },
    children:
      '<hearth-list-item title="Docker" description="Local infrastructure" icon="server" badge="Connected" tone="success"></hearth-list-item>',
    notes: [
      "Use HListItem children. The container supplies native list semantics and the divider token.",
      "The default slot accepts app-owned rows; use descriptive labels when there are several lists.",
    ],
    related: ["HListItem", "HDataTable", "HCard"],
  },
  HListItem: {
    vue: '<HList label="Integrations"><HListItem title="Docker" description="Local infrastructure" icon="server" interactive @activate="open" /></HList>',
    imports: ["HList"],
    script: "function open() { /* Open integration details. */ }",
    mountTag: "ul",
    props: {
      title: "Docker",
      description: "Local infrastructure",
      icon: "server",
      interactive: true,
    },
    event: "activate",
    notes: [
      "Place in HList or a native list. interactive creates a button; href creates a safe link.",
      "Use the actions slot for separate interactive controls. Keep leading/trailing slots noninteractive when the main row is a button or link.",
    ],
    related: ["HList", "HAvatar", "HDropdownMenu"],
  },
  HChip: {
    vue: '<HChip label="Media" value="media" :selected="selected" selectable @select="selected=!selected" />',
    script: "const selected = ref(false);",
    props: {
      label: "Media",
      value: "media",
      selected: false,
      selectable: true,
    },
    js: "element.addEventListener('select', () => { element.selected = !element.selected; });",
    notes: [
      "selected is consumer-owned. select(value) toggles application selection; remove(value) requests removal.",
      "Selectable and remove controls are separate buttons. Use HBadge for a purely informational state label.",
    ],
    related: ["HChipGroup", "HBadge", "HMultiSelect"],
  },
  HChipGroup: {
    vue: '<HChipGroup v-model="filters" label="Application filters" :options="options" />',
    script:
      "const filters = ref<string[]>(['media']);\nconst options = [{value:'media',label:'Media'},{value:'home',label:'Home'}];",
    props: {
      label: "Application filters",
      modelValue: ["media"],
      options: [
        { value: "media", label: "Media" },
        { value: "home", label: "Home" },
      ],
    },
    event: "change",
    notes: [
      "The model is an array of selected values. Default mode shows all options as toggles; removable mode shows only selected options with remove actions.",
      "This is filter/application state, not a form-associated field. Use HMultiSelect when repeated form submission values are needed.",
    ],
    related: ["HChip", "HMultiSelect", "HSegmentedControl"],
  },
  HSegmentedControl: {
    vue: '<HSegmentedControl v-model="view" label="View mode" name="view" :options="options" />',
    script:
      "const view = ref('grid');\nconst options = [{value:'grid',label:'Grid'},{value:'list',label:'List'}];",
    props: {
      label: "View mode",
      name: "view",
      value: "grid",
      options: [
        { value: "grid", label: "Grid" },
        { value: "list", label: "List" },
      ],
    },
    event: "change",
    notes: [
      "Use for selecting one short value such as Grid/List. Native radios provide exclusive selection and form semantics.",
      "Use HTabs when selecting a value reveals associated panels. HButtonBar groups commands without a selection model.",
    ],
    related: ["HRadioGroup", "HTabs", "HButtonBar"],
  },
  HFileUpload: {
    vue: '<HFileUpload v-model="files" label="Import configuration" name="config" accept=".json" :max-size="1048576" required />',
    script: "const files = ref<File[]>([]);",
    props: {
      label: "Import configuration",
      name: "config",
      accept: ".json",
      maxSize: 1048576,
      required: true,
    },
    event: "change",
    notes: [
      "Files stay in the browser until the app uploads them. progress is application-owned; this component sends no requests.",
      "Client accept/size/count checks are usability checks, not server-side validation. An invalid selection is rejected as a batch.",
      "File fields reset to empty; selected files are not restored automatically. Increment resetKey to clear from application code.",
      "modelValue/change use File[], and form submission includes actual File values. Do not serialize files as JSON attributes.",
    ],
    related: ["HProgress", "HButtonBar", "HAlert"],
  },
  HCodeBlock: {
    vue: '<HCodeBlock :code="command" title="Start your service" language="sh" line-numbers />',
    script: "const command = 'docker compose up -d';",
    props: {
      code: "docker compose up -d",
      title: "Start your service",
      language: "sh",
      lineNumbers: true,
    },
    notes: [
      "Code is rendered as escaped plain text. language is a label, not a promise of syntax highlighting.",
      "Clipboard actions require browser clipboard access. Handle copy-error or let the visible error guide manual copying. Raw code, not rendered line numbers, is copied.",
    ],
    related: ["HCopyField", "HLogViewer"],
  },
  HCommandPalette: {
    vue: '<HButton @click="open=true">Find an action</HButton>\n<HCommandPalette v-model:open="open" :items="commands" @select="run" />',
    imports: ["HButton"],
    script:
      "const open = ref(false);\nconst commands = [{id:'apps',label:'Open applications',group:'Navigate',icon:'apps'},{id:'settings',label:'Open settings',group:'Navigate',icon:'settings'}];\nfunction run(id: string) { /* Route or execute the selected command. */ }",
    props: {
      items: [
        {
          id: "apps",
          label: "Open applications",
          group: "Navigate",
          icon: "apps",
        },
        {
          id: "settings",
          label: "Open settings",
          group: "Navigate",
          icon: "settings",
        },
      ],
    },
    js: "element.addEventListener('update:open', event => { element.open = event.detail[0]; });\nconst trigger = document.createElement('button'); trigger.textContent = 'Find an action'; trigger.addEventListener('click', () => { element.open = true; }); mount.before(trigger);",
    notes: [
      "Search includes labels, descriptions, groups, and keywords. Disabled commands cannot execute.",
      "Global Ctrl/Cmd+K binding is opt-in with shortcut=true; enable it on only the intended palette. The component requests actions and never owns the router.",
    ],
    related: ["HDialog", "HCombobox", "HDropdownMenu"],
  },
  HLogViewer: {
    vue: '<HLogViewer :entries="entries" label="Provider logs" :max-lines="500" wrap />',
    script:
      "const entries = [{id:'1',timestamp:'12:00:00',level:'info' as const,message:'Provider connected.'},{id:'2',timestamp:'12:00:01',level:'warning' as const,message:'One route is unresolved.'}];",
    props: {
      label: "Provider logs",
      maxLines: 500,
      wrap: true,
      entries: [
        {
          id: "1",
          timestamp: "12:00:00",
          level: "info",
          message: "Provider connected.",
        },
      ],
    },
    notes: [
      "The component renders a bounded tail (500 entries by default), filters that tail, and follows new entries while follow is enabled. It does not fetch or stream logs.",
      "Scrolling away from the bottom pauses following. Log content is escaped and not continuously announced as a live region.",
      "Use server-paged/virtualized history for large archives. Copy includes only currently visible/filtered entries.",
    ],
    related: ["HCodeBlock", "HConnectionState", "HDataTable"],
  },
  HCopyField: {
    vue: '<HCopyField label="Service endpoint" value="https://photos.example.com" />',
    props: { label: "Service endpoint", value: "https://photos.example.com" },
    notes: [
      "This is a read-only display/copy field, not an editable form field.",
      "secret masks the display and offers explicit reveal; masking does not protect the value from the consuming application or browser tools.",
      "Clipboard failures are visible and emitted. The user can select/copy manually; successful copying emits no secret value.",
    ],
    related: ["HInput", "HCodeBlock", "HDescriptionList"],
  },
  HConnectionState: {
    vue: '<HConnectionState state="failed" label="Docker provider" description="The endpoint is unreachable." @retry="retry" />',
    script:
      "function retry() { /* Retry through the application connection service. */ }",
    props: {
      state: "failed",
      label: "Docker provider",
      description: "The endpoint is unreachable.",
    },
    event: "retry",
    notes: [
      "The app supplies connection state and performs retry. This component does not monitor connectivity or create timers.",
      "State text accompanies semantic color. Retry is offered for failed/offline states when retryable is enabled.",
    ],
    related: ["HProviderSetup", "HAlert", "HBadge"],
  },
  HSparkline: {
    vue: '<HSparkline :values="[3,5,4,8,6,9]" label="Requests over six samples" tone="info" />',
    props: {
      values: [3, 5, 4, 8, 6, 9],
      label: "Requests over six samples",
      tone: "info",
    },
    notes: [
      "A small trend, not a full charting/analytics engine. Supply a short, aggregated numeric series and a meaningful label or description.",
      "Non-finite values are ignored; flat, single-value, and empty series have explicit rendering behavior. Set decorative only when adjacent content supplies equivalent information.",
    ],
    related: ["HStatCard", "HProgress"],
  },
  HSettingsPage: {
    vue: '<HSettingsPage :dirty="dirty" @save="save" @reset="reset"><HCard title="Workspace"><HInput v-model="name" label="Workspace name" @update:model-value="dirty=true" /></HCard></HSettingsPage>',
    imports: ["HCard", "HInput"],
    script:
      "const name = ref('Homestead');\nconst dirty = ref(false);\nfunction save() { /* Validate and persist, then clear dirty on success. */ }\nfunction reset() { name.value='Homestead'; dirty.value=false; }",
    props: { dirty: true },
    children:
      '<hearth-card title="Workspace"><hearth-input label="Workspace name" value="Homestead"></hearth-input></hearth-card>',
    notes: [
      "This recipe owns presentation and dirty/saving feedback. save/reset are requests; validation and persistence belong to the application.",
      "It does not wrap slots in an internal form. Put your own native form in the appropriate DOM tree when collecting slotted custom-element values.",
    ],
    related: ["HDashboardShell", "HCard", "HButtonBar"],
  },
  HProviderSetup: {
    vue: '<HProviderSetup v-model="draft" @test="testConnection" @save="saveProvider" />',
    script:
      "const draft = ref({name:'Local provider',endpoint:'https://service.example.com'});\nfunction testConnection(value: {name:string;endpoint:string}) { /* Test using your API and update state/message. */ }\nfunction saveProvider(value: {name:string;endpoint:string}) { /* Persist after application validation. */ }",
    props: {
      modelValue: {
        name: "Local provider",
        endpoint: "https://service.example.com",
      },
    },
    event: "test",
    notes: [
      "The built-in form collects a provider name and endpoint. Endpoints are text so your app can support HTTPS, Unix sockets, or another scheme.",
      "test/save emit a draft. testing/saving/state/message are controlled by the app. No connectivity or persistence is performed by the recipe.",
    ],
    related: ["HConnectionState", "HFirstRunSetup", "HInput"],
  },
  HResourceDetail: {
    vue: '<HResourceDetail title="Photo library" :fields="fields" :tabs="tabs" status="Healthy" tone="success"><template #overview><p>Application details go here.</p></template></HResourceDetail>',
    script:
      "const fields = [{key:'version',label:'Version',value:'1.0.0'}];\nconst tabs = [{value:'overview',label:'Overview'}];",
    props: {
      title: "Photo library",
      status: "Healthy",
      tone: "success",
      fields: [{ key: "version", label: "Version", value: "1.0.0" }],
      tabs: [{ value: "overview", label: "Overview" }],
    },
    children: '<p slot="overview">Application details go here.</p>',
    notes: [
      "Supply data, actions, and one named slot per tab value. Without tabs, the default slot is used.",
      "Breadcrumb navigate(id) and active-tab changes are requests to the host app. The recipe does not fetch the resource.",
    ],
    related: ["HDescriptionList", "HTabs", "HSheet"],
  },
  HStatusPage: {
    vue: '<HStatusPage brand="homestead" :groups="groups" updated-at="2026-09-19 12:00 UTC" />',
    script:
      "const groups = [{id:'apps',label:'Applications',services:[{id:'photos',name:'Photos',status:'operational' as const}]}];",
    props: {
      brand: "homestead",
      updatedAt: "2026-09-19 12:00 UTC",
      groups: [
        {
          id: "apps",
          label: "Applications",
          services: [{ id: "photos", name: "Photos", status: "operational" }],
        },
      ],
    },
    notes: [
      "This recipe includes a public shell. Feed it only data that is appropriate for anonymous visitors; publication permissions are an application concern.",
      "The summary derives from the supplied service states and remains unknown when status is missing. It does not perform health checks.",
      "Timestamps are supplied display strings; the recipe does not invent update times or incident history.",
    ],
    related: ["HPublicShell", "HList", "HConnectionState"],
  },
  HErrorPage: {
    vue: '<HErrorPage kind="unavailable" brand="homestead" home-href="/" retryable @retry="retry" />',
    script:
      "function retry() { /* Retry or reload through your application. */ }",
    props: {
      kind: "unavailable",
      brand: "homestead",
      homeHref: "/",
      retryable: true,
    },
    event: "retry",
    notes: [
      "Choose not-found, forbidden, or unavailable and optionally override copy. It renders a full-page recovery view.",
      "This changes presentation, not the HTTP response status or route authorization. Set those in the server/router.",
    ],
    related: ["HPublicShell", "HEmptyState", "HAlert"],
  },
  HFirstRunSetup: {
    vue: '<HFirstRunSetup v-model:step="step" @account="createAccount" @provider="saveProvider" @complete="finish" />',
    script:
      "const step = ref(0);\nfunction createAccount(credentials: {username:string;password:string}) { /* Persist securely; set step=1 only after success. */ }\nfunction saveProvider(draft: {name:string;endpoint:string}) { /* Save through your API; then set step=2. */ }\nfunction finish() { /* Open the workspace. */ }",
    props: { step: 0 },
    notes: [
      "Steps are 0=account, 1=provider, 2=completion. Application code advances only after its operations succeed.",
      "busy/error describe application work. Account credentials are emitted but never logged, stored, or sent by the recipe.",
      "The account slot replaces the default account form; own that replacement form and its submission.",
    ],
    related: ["HAuthPage", "HProviderSetup", "HDashboardShell"],
  },
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
