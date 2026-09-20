export const catalog = [
  {
    name: "HThemeSwitcher",
    tag: "hearth-theme-switcher",
    category: "Controls",
    description:
      "A light, dark, and system preference selector. Bind its value to HTheme mode.",
    props: "modelValue, value: Mode · label, name: string · disabled: boolean",
    events: "update:modelValue(Mode), change(Mode)",
    slots: "None",
    parts: "base, label, option, control",
  },
  {
    name: "HNumberInput",
    tag: "hearth-number-input",
    category: "Controls",
    description:
      "A numeric field and counter with native stepping, bounds, validation, and an explicit empty value.",
    props:
      "modelValue, value: number | null · label, name, hint, error: string · min, max, step: number · required, disabled, readonly: boolean",
    events: "update:modelValue(number | null), change(number | null)",
    slots: "None",
    parts: "base, label, control, increment, decrement, hint",
  },
  {
    name: "HTimePicker",
    tag: "hearth-time-picker",
    category: "Controls",
    description:
      "Time entry with a Hearth hour/minute/second popover, bounds, and configurable steps.",
    props:
      "modelValue, value, label, name, min, max, hint, error: string · step: number · required, disabled, readonly: boolean",
    events: "update:modelValue(string), change(string)",
    slots: "None",
    parts: "base, label, control, hint",
  },
  {
    name: "HCalendar",
    tag: "hearth-calendar",
    category: "Controls",
    description:
      "A keyboard-navigable Gregorian month calendar with date-only values, bounds, and unavailable days.",
    props:
      "modelValue, value, month, label, locale, min, max, today: string · weekStartsOn: 0 | 1 · disabledDates: string[] · disabled: boolean",
    events: "update:modelValue(string), change(string), update:month(string)",
    slots: "None",
    parts: "base, previous, month, next, grid, day",
  },
  {
    name: "HDatePicker",
    tag: "hearth-date-picker",
    category: "Controls",
    description:
      "Date text entry with a Hearth calendar popover and form validation.",
    props:
      "modelValue, value, label, name, min, max, locale, hint, error: string · weekStartsOn: 0 | 1 · required, disabled, readonly: boolean",
    events: "update:modelValue(string), change(string)",
    slots: "None",
    parts: "base, label, control, hint, panel, grid, day",
  },
  {
    name: "HDateRangePicker",
    tag: "hearth-date-range-picker",
    category: "Controls",
    description:
      "Two date pickers with start/end constraints and native form validation.",
    props:
      "modelValue, value: DateRange · label, name, min, max, locale, startLabel, endLabel: string · weekStartsOn: 0 | 1 · required, disabled: boolean",
    events: "update:modelValue(DateRange), change(DateRange)",
    slots: "None",
    parts: "base, label, control, panel, grid, day",
  },
  {
    name: "HRangeSlider",
    tag: "hearth-range-slider",
    category: "Controls",
    description:
      "Two native range handles for choosing a bounded numeric interval.",
    props:
      "modelValue, value: NumberRange · label, name, unit, lowerLabel, upperLabel: string · min, max, step: number · disabled: boolean",
    events: "update:modelValue(NumberRange), change(NumberRange)",
    slots: "None",
    parts: "base, label, value, track, lower, upper",
  },
  {
    name: "HStepper",
    tag: "hearth-stepper",
    category: "Layouts",
    description:
      "An ordered workflow indicator with optional step selection and completed or unavailable states.",
    props:
      "items: StepItem[] · modelValue, label: string · interactive: boolean · orientation: horizontal | vertical",
    events: "update:modelValue(string), change(string)",
    slots: "None",
    parts: "base, item, step, marker, title, description",
  },
  {
    name: "HTimeline",
    tag: "hearth-timeline",
    category: "Surfaces",
    description:
      "An ordered activity history for deployments, audit events, and incident updates, with timestamps and per-event detail slots.",
    props:
      "items: TimelineItem[] · label, loadingText, emptyText: string · loading: boolean",
    events: "None",
    slots: "detail:<id>, empty",
    parts: "base, list, item, marker, title, time, detail, loading, empty",
  },
  {
    name: "HPopover",
    tag: "hearth-popover",
    category: "Controls",
    description:
      "A nonmodal top-layer panel anchored to its trigger, with viewport-aware positioning and focus handling.",
    props:
      "open, disabled: boolean · label, title, icon: string · placement: top | bottom | left | right · variant: primary | secondary | ghost",
    events: "update:open(boolean), close()",
    slots: "default",
    parts: "base, panel, title",
  },
  {
    name: "HTooltip",
    tag: "hearth-tooltip",
    category: "Feedback",
    description:
      "Hoverable, keyboard-accessible help text with a configurable delay and Escape dismissal.",
    props:
      "text, label, icon: string · placement: top | bottom | left | right · delay: number · disabled: boolean",
    events: "None",
    slots: "default (focusable trigger; an info button is provided otherwise)",
    parts: "base, trigger, content",
  },
  {
    name: "HDropdownMenu",
    tag: "hearth-dropdown-menu",
    category: "Controls",
    description:
      "A keyboard-operated command menu for edit, copy, refresh, and destructive actions.",
    props:
      "items: MenuAction[] · label, icon: string · open, disabled: boolean · placement: top | bottom | left | right",
    events: "select(id), update:open(boolean)",
    slots: "None",
    parts: "base, menu, item",
  },
  {
    name: "HToast",
    tag: "hearth-toast",
    category: "Feedback",
    description:
      "A dismissible notification with optional action, a timer, and pause-on-hover/focus behavior.",
    props:
      "title, description, actionLabel: string · tone: Tone · duration: milliseconds (0 persists) · dismissible: boolean",
    events: "dismiss(), action()",
    slots: "default",
    parts: "base, title, description, action",
  },
  {
    name: "HToaster",
    tag: "hearth-toaster",
    category: "Feedback",
    description:
      "A controlled, positioned notification stack that composes HToast.",
    props:
      "items: ToastItem[] · position: top-right | top-left | bottom-right | bottom-left · limit: number · label: string",
    events: "dismiss(id), action(id)",
    slots: "default",
    parts: "base",
  },
  {
    name: "HSheet",
    tag: "hearth-sheet",
    category: "Feedback",
    description:
      "A native modal side panel for inspection and editing without leaving the current page.",
    props:
      "open: boolean · title, description, width: string · side: left | right",
    events: "close()",
    slots: "default, footer",
    parts: "panel, header, body, footer",
  },
  {
    name: "HDataTable",
    tag: "hearth-data-table",
    category: "Surfaces",
    description:
      "Semantic data tables with sorting, selection, paging, loading/empty states, and row actions.",
    props:
      "rows: TableRow[] · columns: TableColumn[] · label, caption, emptyText: string · selected, disabledRows: string[] · sort: TableSort · page, pageSize, total: number · selectable, loading, manual, stickyHeader: boolean · actions: MenuAction[]",
    events:
      "update:selected(ids), selection-change(ids), sort-change(sort), update:page(page), page-change(page), row-action({id, action})",
    slots: "Per-cell names from tableCellSlot(rowId, columnKey)",
    parts: "base, viewport, header-cell, row, cell, footer",
  },
  {
    name: "HDescriptionList",
    tag: "hearth-description-list",
    category: "Surfaces",
    description:
      "Responsive native key/value metadata with links and per-value slots.",
    props: "items: DescriptionItem[] · columns: 1 | 2 | 3",
    events: "None",
    slots: "value:<item.key>",
    parts: "base, item, label, value",
  },
  {
    name: "HList",
    tag: "hearth-list",
    category: "Surfaces",
    description:
      "A semantic list container for integrations, activity, and settings rows.",
    props: "label: string · divided: boolean",
    events: "None",
    slots: "default",
    parts: "base",
  },
  {
    name: "HListItem",
    tag: "hearth-list-item",
    category: "Surfaces",
    description:
      "A readable row with icon, description, badge, and separate action content.",
    props:
      "title, description, icon, badge, href: string · tone: Tone · interactive, disabled, selected: boolean",
    events: "activate()",
    slots: "leading, trailing, actions",
    parts: "base, content, title, description",
  },
  {
    name: "HChip",
    tag: "hearth-chip",
    category: "Controls",
    description:
      "A compact selectable or removable label with distinct toggle and remove actions.",
    props:
      "label, value: string · selected, selectable, removable, disabled: boolean · tone: Tone",
    events: "select(value), remove(value)",
    slots: "None",
    parts: "base, label, remove",
  },
  {
    name: "HChipGroup",
    tag: "hearth-chip-group",
    category: "Controls",
    description:
      "An array-valued filter group or removable set of selected tags.",
    props:
      "options: SelectOption[] · modelValue: string[] · label: string · removable, disabled: boolean",
    events: "update:modelValue(values), change(values), remove(value)",
    slots: "default",
    parts: "base",
  },
  {
    name: "HSegmentedControl",
    tag: "hearth-segmented-control",
    category: "Controls",
    description:
      "A compact exclusive-value selector backed by the shared native radio-group engine.",
    props:
      "modelValue, value, label, name: string · options: ChoiceOption[] · required, disabled: boolean",
    events: "update:modelValue(value), change(value)",
    slots: "None",
    parts: "base, label, option, control",
  },
  {
    name: "HFileUpload",
    tag: "hearth-file-upload",
    category: "Controls",
    description:
      "Native file selection and drag/drop with configurable validation, file lists, and application-owned progress.",
    props:
      "label, name, accept, description, error: string · modelValue: File[] · multiple, required, disabled: boolean · maxSize, maxFiles, resetKey, progress: number",
    events: "update:modelValue(files), change(files), reject(FileRejection[])",
    slots: "None",
    parts: "base, label, dropzone, control, files",
  },
  {
    name: "HCodeBlock",
    tag: "hearth-code-block",
    category: "Surfaces",
    description:
      "Escaped, copyable code or configuration text with optional wrapping and line numbers.",
    props:
      "code, language, title: string · wrap, lineNumbers, copyable: boolean",
    events: "copied(), copy-error(message)",
    slots: "None",
    parts: "base, header, code",
  },
  {
    name: "HCommandPalette",
    tag: "hearth-command-palette",
    category: "Controls",
    description:
      "A searchable keyboard command dialog with grouping, shortcuts, and disabled commands.",
    props:
      "items: CommandItem[] · open, shortcut: boolean · label, placeholder: string",
    events: "update:open(boolean), close(), select(id), search(query)",
    slots: "None",
    parts: "list, option (dialog parts are also exposed)",
  },
  {
    name: "HLogViewer",
    tag: "hearth-log-viewer",
    category: "Surfaces",
    description:
      "A bounded log tail with search, level filtering, pause/follow controls, and copy support.",
    props:
      "entries: LogEntry[] · label: string · follow, wrap: boolean · maxLines: number = 500",
    events:
      "update:follow(boolean), search-change(query), copied(), copy-error(message)",
    slots: "None",
    parts: "base, header, viewport, line",
  },
  {
    name: "HCopyField",
    tag: "hearth-copy-field",
    category: "Controls",
    description:
      "A read-only endpoint, identifier, or secret field with explicit clipboard and reveal actions.",
    props: "label, value: string · secret, disabled: boolean",
    events: "copied(), copy-error(message)",
    slots: "None",
    parts: "base, label, value",
  },
  {
    name: "HConnectionState",
    tag: "hearth-connection-state",
    category: "Feedback",
    description:
      "Connection lifecycle feedback with an optional application-owned retry action.",
    props:
      "state: connecting | connected | reconnecting | failed | offline · label, description: string · retryable: boolean",
    events: "retry()",
    slots: "None",
    parts: "base, title, description",
  },
  {
    name: "HSparkline",
    tag: "hearth-sparkline",
    category: "Surfaces",
    description:
      "A small SVG trend with a textual summary, finite-data handling, and semantic tones.",
    props:
      "values: number[] · label, description: string · tone: Tone · width, height: number · decorative: boolean",
    events: "None",
    slots: "None",
    parts: "base",
  },
  {
    name: "HSettingsPage",
    tag: "hearth-settings-page",
    category: "Layouts",
    description:
      "Grouped settings content with dirty-state feedback and save/reset requests.",
    props:
      "title, description, error, saveLabel: string · dirty, saving: boolean",
    events: "save(), reset()",
    slots: "default, actions",
    parts: "base, content, actions",
  },
  {
    name: "HProviderSetup",
    tag: "hearth-provider-setup",
    category: "Layouts",
    description:
      "A connection setup recipe with required fields, test/save requests, and connection feedback.",
    props:
      "title, description, message, endpointPlaceholder: string · modelValue: ConnectionDraft · testing, saving: boolean · state: connection state",
    events: "update:modelValue(draft), test(draft), save(draft)",
    slots: "footer",
    parts: "base",
  },
  {
    name: "HResourceDetail",
    tag: "hearth-resource-detail",
    category: "Layouts",
    description:
      "A resource introduction with breadcrumbs, state, metadata, and tabbed details.",
    props:
      "title, description, activeTab, status: string · breadcrumbs: NavItem[] · fields: DescriptionItem[] · tabs: TabItem[] · tone: Tone",
    events: "navigate(id), update:activeTab(value)",
    slots: "actions, summary, default or a named slot per tab.value",
    parts: "base",
  },
  {
    name: "HStatusPage",
    tag: "hearth-status-page",
    category: "Layouts",
    description:
      "A public status-page recipe with service groups, derived summary, and incident updates.",
    props:
      "brand, title, description, updatedAt: string · groups: StatusGroup[] · incidents: StatusIncident[]",
    events: "None",
    slots: "actions, default",
    parts: "base (public shell parts are also exposed)",
  },
  {
    name: "HErrorPage",
    tag: "hearth-error-page",
    category: "Layouts",
    description:
      "Not-found, access-denied, and unavailable page treatments with clear recovery actions.",
    props:
      "kind: not-found | forbidden | unavailable · brand, title, description, homeHref: string · retryable: boolean",
    events: "retry()",
    slots: "actions, footer",
    parts: "base, code, title, description",
  },
  {
    name: "HFirstRunSetup",
    tag: "hearth-first-run-setup",
    category: "Layouts",
    description:
      "An application-controlled owner-account, provider, and completion setup recipe.",
    props:
      "step: 0 | 1 | 2 · title, error, connectionMessage: string · busy, allowBack: boolean · passwordMinLength: number · connectionState: connection state",
    events:
      "update:step(number), account(credentials), test-provider(draft), provider(draft), complete()",
    slots: "account, footer",
    parts: "base, steps",
  },
  {
    name: "HMultiSelect",
    tag: "hearth-multi-select",
    category: "Controls",
    description:
      "An array-typed multi-select combobox using the same searchable selection engine as HCombobox.",
    props:
      "Same selection props as HCombobox; modelValue and value are string[]. Multiple selection is always enabled.",
    events: "update:modelValue(values), change(values), search(query)",
    slots: "None",
    parts: "base, label, control, selection, popup, option, hint",
  },
  {
    name: "HCombobox",
    tag: "hearth-combobox",
    category: "Controls",
    description:
      "Searchable single or multi-select with selected chips, disabled options, keyboard navigation, and repeated form values.",
    props:
      "label, name, placeholder, hint, error, emptyText: string · options: {value, label, description?, keywords?, disabled?}[] · modelValue, value: string | string[] · multiple, required, disabled, loading, clearable: boolean",
    events: "update:modelValue(value), change(value), search(query)",
    slots: "None",
    parts: "base, label, control, selection, popup, option, hint",
  },
  {
    name: "HCheckbox",
    tag: "hearth-checkbox",
    category: "Controls",
    description:
      "A native checkbox with a mixed-state option and optional description.",
    props:
      "label, description, name, value: string · modelValue, checked, indeterminate, required, disabled: boolean",
    events:
      "update:modelValue(checked), update:indeterminate(false), change(checked)",
    slots: "None",
    parts: "base, control, label, description",
  },
  {
    name: "HRadioGroup",
    tag: "hearth-radio-group",
    category: "Controls",
    description:
      "One native radio group per component, with descriptions, disabled choices, and arrow/Home/End keyboard control.",
    props:
      "label, name, modelValue, value, description, error: string · options: {value, label, description?, disabled?}[] · required, disabled: boolean · orientation: horizontal | vertical",
    events: "update:modelValue(value), change(value)",
    slots: "None",
    parts: "base, label, option, control",
  },
  {
    name: "HTextarea",
    tag: "hearth-textarea",
    category: "Controls",
    description:
      "A labeled multiline field with native constraints and form reset support.",
    props:
      "label, name, modelValue, value, placeholder, hint, error: string · rows, minlength, maxlength: number · required, disabled, readonly: boolean · resize: vertical | none | both",
    events: "update:modelValue(value), change(value)",
    slots: "None",
    parts: "base, label, control, hint",
  },
  {
    name: "HRange",
    tag: "hearth-range",
    category: "Controls",
    description:
      "A native numeric slider with a visible value and optional unit.",
    props:
      "label, name, unit, hint: string · modelValue, value, min, max, step: number · disabled: boolean",
    events: "update:modelValue(number), change(number)",
    slots: "None",
    parts: "base, label, value, control",
  },
  {
    name: "HButtonBar",
    tag: "hearth-button-bar",
    category: "Controls",
    description:
      "Group actions without changing native button focus or submission behavior.",
    props:
      "label: string · align: start | center | end | between · orientation: horizontal | vertical",
    events: "None (children retain their own events)",
    slots: "default",
    parts: "base",
  },
  {
    name: "HNavigationMenu",
    tag: "hearth-navigation-menu",
    category: "Layouts",
    description:
      "A navigation disclosure menu with native links, nested groups, outside-click dismissal, and Escape support.",
    props:
      "items: (NavItem & {children?: NavItem[]})[] · active, label: string",
    events: "navigate(id)",
    slots: "None",
    parts: "base, trigger, popup, item",
  },
  {
    name: "HSidebar",
    tag: "hearth-sidebar",
    category: "Layouts",
    description:
      "A standalone, collapsible sidebar with grouped navigation and optional custom header/footer.",
    props:
      "brand, logo, active, label: string · items: NavItem[] · sections: {label, items: NavItem[]}[] · collapsed, collapsible: boolean",
    events: "navigate(id), update:collapsed(boolean)",
    slots: "header, default, footer",
    parts: "base, header, navigation, footer",
  },
  {
    name: "HProgress",
    tag: "hearth-progress",
    category: "Feedback",
    description:
      "Native determinate or indeterminate progress, with percentage text and semantic colors.",
    props:
      "label, description: string · value, max: number · indeterminate, showValue: boolean · tone: Tone",
    events: "None",
    slots: "None",
    parts: "base, label, value, track, description",
  },
  {
    name: "HBreadcrumbs",
    tag: "hearth-breadcrumbs",
    category: "Layouts",
    description: "A wrapping breadcrumb trail with an accessible current page.",
    props: "items: NavItem[] · label: string",
    events: "navigate(id)",
    slots: "None",
    parts: "base, item, current",
  },
  {
    name: "HAvatar",
    tag: "hearth-avatar",
    category: "Foundation",
    description:
      "An image avatar with initials fallback and an optional decorative mode.",
    props:
      "name, src: string · size: number = 40 · shape: circle | rounded · tone: Tone · decorative: boolean",
    events: "None",
    slots: "None",
    parts: "base, image, fallback",
  },
  {
    name: "HSeparator",
    tag: "hearth-separator",
    category: "Surfaces",
    description:
      "A structural divider, optionally labeled or exposed as an accessible separator.",
    props:
      "orientation: horizontal | vertical · label: string · decorative: boolean = true",
    events: "None",
    slots: "None",
    parts: "base",
  },
  {
    name: "HSkeleton",
    tag: "hearth-skeleton",
    category: "Feedback",
    description:
      "Text, rectangle, and circular loading placeholders with reduced-motion support.",
    props:
      "variant: text | rectangle | circle · lines: number (1–20) · width, height, label: string · animated: boolean",
    events: "None",
    slots: "None",
    parts: "base, block",
  },
  {
    name: "HAccordion",
    tag: "hearth-accordion",
    category: "Controls",
    description:
      "Native details/summary disclosures with single or multiple expansion.",
    props:
      "items: {id, title, description?, disabled?}[] · modelValue, value: string[] · multiple: boolean",
    events: "update:modelValue(ids), change(ids)",
    slots: "One named slot per item.id",
    parts: "base, item, trigger, panel",
  },
  {
    name: "HPagination",
    tag: "hearth-pagination",
    category: "Controls",
    description:
      "Bounded page navigation with current-page semantics and ellipses for long lists.",
    props: "modelValue, total, pageSize: number · label: string",
    events: "update:modelValue(page), change(page)",
    slots: "None",
    parts: "base, previous, page, next",
  },
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
      "modelValue, value, label, name, placeholder, hint, error, autocomplete, pattern: string · type: text | email | password | url | search | number | tel | date | time | datetime-local · required, disabled, readonly: boolean · minlength, maxlength: number · min, max, step: string | number",
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
    props:
      "items: {value, label, disabled?}[] · modelValue, label: string · orientation: horizontal | vertical · activation: automatic | manual · variant: pill | underline",
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
