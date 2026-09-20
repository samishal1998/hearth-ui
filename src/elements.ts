import {
  defineCustomElement,
  type ComponentPublicInstance,
  type VueElementConstructor,
} from "vue";
import {
  HTheme,
  HIcon,
  HBrand,
  HButton,
  HBadge,
  HInput,
  HSelect,
  HSwitch,
  HCard,
  HAppCard,
  HStatCard,
  HAlert,
  HEmptyState,
  HTabs,
  HDialog,
  HPageHeader,
  HPublicShell,
  HDashboardShell,
  HAuthPage,
  HCombobox,
  HMultiSelect,
  HCheckbox,
  HRadioGroup,
  HTextarea,
  HRange,
  HButtonBar,
  HNavigationMenu,
  HSidebar,
  HProgress,
  HBreadcrumbs,
  HAvatar,
  HSeparator,
  HSkeleton,
  HAccordion,
  HPagination,
  HPopover,
  HTimeline,
  HThemeSwitcher,
  HNumberInput,
  HTimePicker,
  HCalendar,
  HDatePicker,
  HDateRangePicker,
  HRangeSlider,
  HStepper,
  HTooltip,
  HDropdownMenu,
  HToast,
  HToaster,
  HSheet,
  HDataTable,
  HDescriptionList,
  HList,
  HListItem,
  HChip,
  HChipGroup,
  HSegmentedControl,
  HFileUpload,
  HCodeBlock,
  HCommandPalette,
  HLogViewer,
  HCopyField,
  HConnectionState,
  HSparkline,
  HSettingsPage,
  HProviderSetup,
  HResourceDetail,
  HStatusPage,
  HErrorPage,
  HFirstRunSetup,
} from "./index";
export * from "./themes";

type NativeControl =
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLButtonElement
  | HTMLTextAreaElement;
type FormKind = "field" | "button" | "compound" | "file";
type SFC = {
  new (...args: any[]): ComponentPublicInstance<any>;
  styles?: string[];
};
type ElementProps<T extends SFC> = {
  -readonly [
    K in keyof InstanceType<T>["$props"]
  ]: InstanceType<T>["$props"][K];
};
export interface FormControlAPI {
  readonly form: HTMLFormElement | null;
  readonly validity: ValidityState;
  readonly validationMessage: string;
  readonly willValidate: boolean;
  checkValidity(): boolean;
  reportValidity(): boolean;
}

function element<T extends SFC>(
  component: T,
  inline?: boolean,
): VueElementConstructor<ElementProps<T>>;
function element<T extends SFC>(
  component: T,
  inline: boolean,
  formKind: FormKind,
): VueElementConstructor<ElementProps<T> & FormControlAPI>;
function element(
  component: SFC,
  inline = false,
  formKind?: FormKind,
): VueElementConstructor<unknown> {
  const Base: VueElementConstructor<unknown> = defineCustomElement(component, {
    styles: [
      `:host{display:${inline ? "inline-block" : "block"};min-width:0;font-family:var(--h-font,system-ui);font-size:var(--h-font-size,14px);color:var(--h-text,#f7f8fb)}:host([hidden]){display:none!important}`,
      ...(component.styles || []),
    ],
  });
  // React and other hosts check property presence before connecting an element.
  // Queue only explicitly assigned values; Vue upgrades these own properties on mount.
  const declared = (
    component as SFC & { props?: string[] | Record<string, unknown> }
  ).props;
  for (const key of Array.isArray(declared)
    ? declared
    : Object.keys(declared || {})) {
    if (key in Base.prototype) continue;
    Object.defineProperty(Base.prototype, key, {
      configurable: true,
      get() {
        return undefined;
      },
      set(value: unknown) {
        Object.defineProperty(this, key, {
          value,
          writable: true,
          enumerable: true,
          configurable: true,
        });
      },
    });
  }
  if (!formKind) return Base;
  return class extends Base {
    static formAssociated = true;
    private internals: ElementInternals;
    private initially:
      { value: string; checked: boolean; values: string[] } | undefined;
    private fieldsetDisabled = false;
    constructor(props?: Record<string, unknown>) {
      super(props);
      this.internals = this.attachInternals();
      this.addEventListener("control-sync", () => this.sync());
      this.shadowRoot?.addEventListener("input", () => this.sync(), true);
      this.shadowRoot?.addEventListener("change", () => this.sync(), true);
      this.shadowRoot?.addEventListener("keydown", (e) => {
        const event = e as KeyboardEvent;
        if (
          formKind !== "button" &&
          event.key === "Enter" &&
          !event.isComposing &&
          !event.defaultPrevented &&
          event.target instanceof HTMLInputElement &&
          !["checkbox", "radio", "file"].includes(event.target.type)
        ) {
          event.preventDefault();
          this.internals.form?.requestSubmit();
        }
      });
      this.addEventListener("click", () => {
        const c = this.control();
        if (formKind !== "button" || !c || c.disabled) return;
        if (c.type === "submit") this.internals.form?.requestSubmit();
        if (c.type === "reset") this.internals.form?.reset();
      });
    }
    private control(): NativeControl | null {
      return (
        this.shadowRoot?.querySelector<NativeControl>(
          "[data-h-form-control]:not(:disabled),input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled)",
        ) ||
        this.shadowRoot?.querySelector<NativeControl>(
          "input:not([type=hidden]),select,textarea,button",
        ) ||
        null
      );
    }
    private selectedFields() {
      return [
        ...(this.shadowRoot?.querySelectorAll<HTMLInputElement>(
          "input[data-h-form-value]",
        ) || []),
      ].filter((c) => !["checkbox", "radio"].includes(c.type) || c.checked);
    }
    private sync() {
      const c = this.control();
      if (!c) return;
      if (
        !this.initially &&
        (!(c instanceof HTMLSelectElement) || c.options.length > 0)
      )
        this.initially = {
          value: c.value,
          checked: c instanceof HTMLInputElement && c.checked,
          values: this.selectedFields().map((c) => c.value),
        };
      if (formKind === "button") {
        c.disabled =
          this.fieldsetDisabled ||
          this.hasAttribute("disabled") ||
          this.hasAttribute("loading");
        return;
      }
      if (formKind === "compound") {
        const fields = this.selectedFields();
        const data = new FormData();
        const name = this.getAttribute("name");
        if (name)
          for (const field of fields)
            if (!field.matches(":disabled")) data.append(name, field.value);
        const disabled = this.fieldsetDisabled || this.hasAttribute("disabled");
        this.internals.setFormValue(
          disabled ? null : data,
          JSON.stringify(fields.map((f) => f.value)),
        );
        const invalid =
          fields.find(
            (field) => !field.matches(":disabled") && !field.validity.valid,
          ) || c;
        this.internals.setValidity(
          disabled ? {} : invalid.validity,
          disabled ? "" : invalid.validationMessage,
          invalid,
        );
        return;
      }
      c.disabled = this.fieldsetDisabled || this.hasAttribute("disabled");
      if (formKind === "file" && c instanceof HTMLInputElement) {
        const data = new FormData();
        const name = this.getAttribute("name");
        if (name)
          for (const file of Array.from(c.files || []))
            data.append(name, file, file.name);
        this.internals.setFormValue(c.disabled ? null : data);
        this.internals.setValidity(
          c.disabled ? {} : c.validity,
          c.disabled ? "" : c.validationMessage,
          c,
        );
        return;
      }
      const value =
        c instanceof HTMLInputElement && c.type === "checkbox"
          ? c.checked
            ? c.value
            : null
          : c.value;
      this.internals.setFormValue(
        c.disabled ? null : value,
        c instanceof HTMLInputElement && c.type === "checkbox"
          ? c.checked
            ? "checked"
            : "unchecked"
          : c.value,
      );
      this.internals.setValidity(
        c.disabled ? {} : c.validity,
        c.disabled ? "" : c.validationMessage,
        c,
      );
    }
    formDisabledCallback(disabled: boolean) {
      this.fieldsetDisabled = disabled;
      Object.assign(this, { formDisabled: disabled });
      this.sync();
    }
    formResetCallback() {
      if (formKind === "file") {
        const c = this.control();
        if (c instanceof HTMLInputElement) c.value = "";
        Object.assign(this, {
          modelValue: [],
          resetKey: Number(this.getAttribute("reset-key") || 0) + 1,
        });
        this.sync();
        return;
      }
      if (!this.initially || formKind === "button") return;
      if (formKind === "compound") {
        Object.assign(this, {
          modelValue: this.control()?.hasAttribute("data-h-multiple")
            ? this.control()?.hasAttribute("data-h-number")
              ? this.initially.values.map(Number)
              : [...this.initially.values]
            : this.initially.values[0] || "",
        });
        queueMicrotask(() => this.sync());
        return;
      }
      const c = this.control();
      const isCheck = c instanceof HTMLInputElement && c.type === "checkbox";
      Object.assign(this, {
        modelValue: isCheck
          ? this.initially.checked
          : c?.hasAttribute("data-h-number")
            ? c?.hasAttribute("data-h-nullable") && this.initially.value === ""
              ? null
              : Number(this.initially.value)
            : this.initially.value,
      });
      if (c) {
        c.value = this.initially.value;
        if (isCheck) (c as HTMLInputElement).checked = this.initially.checked;
      }
      this.sync();
    }
    formStateRestoreCallback(state: string | File | FormData | null) {
      if (formKind === "file") {
        this.formResetCallback();
        return;
      }
      if (typeof state !== "string") return;
      if (formKind === "compound") {
        try {
          const values: unknown = JSON.parse(state);
          if (
            !Array.isArray(values) ||
            !values.every((v) => typeof v === "string")
          )
            return;
          Object.assign(this, {
            modelValue: this.control()?.hasAttribute("data-h-multiple")
              ? this.control()?.hasAttribute("data-h-number")
                ? values.map(Number)
                : values
              : values[0] || "",
          });
          queueMicrotask(() => this.sync());
        } catch {}
        return;
      }
      const c = this.control();
      Object.assign(this, {
        modelValue:
          c instanceof HTMLInputElement && c.type === "checkbox"
            ? state === "checked"
            : c?.hasAttribute("data-h-number")
              ? c?.hasAttribute("data-h-nullable") && state === ""
                ? null
                : Number(state)
              : state,
      });
      queueMicrotask(() => this.sync());
    }
    get form() {
      return this.internals.form;
    }
    get validity() {
      return this.internals.validity;
    }
    get validationMessage() {
      return this.internals.validationMessage;
    }
    get willValidate() {
      return this.internals.willValidate;
    }
    checkValidity() {
      this.sync();
      return this.internals.checkValidity();
    }
    reportValidity() {
      this.sync();
      return this.internals.reportValidity();
    }
    focus(options?: FocusOptions) {
      this.shadowRoot
        ?.querySelector<HTMLElement>(
          "input:not([type=hidden]),select,textarea,button,a",
        )
        ?.focus(options);
    }
  };
}

type Constructor<T extends SFC> = VueElementConstructor<ElementProps<T>>;
type FormConstructor<T extends SFC> = VueElementConstructor<
  ElementProps<T> & FormControlAPI
>;

export const HearthThemeElement: Constructor<typeof HTheme> = element(HTheme);
// ponytail: one bundled runtime for the collection; add per-component build entries if selective bundle size becomes a bottleneck.
export const HearthIconElement: Constructor<typeof HIcon> = element(
  HIcon,
  true,
);
export const HearthBrandElement: Constructor<typeof HBrand> = element(
  HBrand,
  true,
);
export const HearthButtonElement: FormConstructor<typeof HButton> = element(
  HButton,
  true,
  "button",
);
export const HearthBadgeElement: Constructor<typeof HBadge> = element(
  HBadge,
  true,
);
export const HearthInputElement: FormConstructor<typeof HInput> = element(
  HInput,
  false,
  "field",
);
export const HearthSelectElement: FormConstructor<typeof HSelect> = element(
  HSelect,
  false,
  "field",
);
export const HearthSwitchElement: FormConstructor<typeof HSwitch> = element(
  HSwitch,
  false,
  "field",
);
export const HearthCardElement: Constructor<typeof HCard> = element(HCard);
export const HearthAppCardElement: Constructor<typeof HAppCard> =
  element(HAppCard);
export const HearthStatCardElement: Constructor<typeof HStatCard> =
  element(HStatCard);
export const HearthAlertElement: Constructor<typeof HAlert> = element(HAlert);
export const HearthEmptyStateElement: Constructor<typeof HEmptyState> =
  element(HEmptyState);
export const HearthTabsElement: Constructor<typeof HTabs> = element(HTabs);
export const HearthDialogElement: Constructor<typeof HDialog> =
  element(HDialog);
export const HearthPageHeaderElement: Constructor<typeof HPageHeader> =
  element(HPageHeader);
export const HearthPublicShellElement: Constructor<typeof HPublicShell> =
  element(HPublicShell);
export const HearthDashboardShellElement: Constructor<typeof HDashboardShell> =
  element(HDashboardShell);
export const HearthAuthPageElement: Constructor<typeof HAuthPage> =
  element(HAuthPage);
export const HearthComboboxElement: FormConstructor<typeof HCombobox> = element(
  HCombobox,
  false,
  "compound",
);
export const HearthMultiSelectElement: FormConstructor<typeof HMultiSelect> =
  element(HMultiSelect, false, "compound");
export const HearthCheckboxElement: FormConstructor<typeof HCheckbox> = element(
  HCheckbox,
  false,
  "field",
);
export const HearthRadioGroupElement: FormConstructor<typeof HRadioGroup> =
  element(HRadioGroup, false, "compound");
export const HearthTextareaElement: FormConstructor<typeof HTextarea> = element(
  HTextarea,
  false,
  "field",
);
export const HearthRangeElement: FormConstructor<typeof HRange> = element(
  HRange,
  false,
  "field",
);
export const HearthButtonBarElement: Constructor<typeof HButtonBar> =
  element(HButtonBar);
export const HearthNavigationMenuElement: Constructor<typeof HNavigationMenu> =
  element(HNavigationMenu);
export const HearthSidebarElement: Constructor<typeof HSidebar> =
  element(HSidebar);
export const HearthProgressElement: Constructor<typeof HProgress> =
  element(HProgress);
export const HearthBreadcrumbsElement: Constructor<typeof HBreadcrumbs> =
  element(HBreadcrumbs);
export const HearthAvatarElement: Constructor<typeof HAvatar> = element(
  HAvatar,
  true,
);
export const HearthSeparatorElement: Constructor<typeof HSeparator> =
  element(HSeparator);
export const HearthSkeletonElement: Constructor<typeof HSkeleton> =
  element(HSkeleton);
export const HearthAccordionElement: Constructor<typeof HAccordion> =
  element(HAccordion);
export const HearthPaginationElement: Constructor<typeof HPagination> =
  element(HPagination);
export const HearthThemeSwitcherElement: FormConstructor<
  typeof HThemeSwitcher
> = element(HThemeSwitcher, false, "compound");
export const HearthNumberInputElement: FormConstructor<typeof HNumberInput> =
  element(HNumberInput, false, "field");
export const HearthTimePickerElement: FormConstructor<typeof HTimePicker> =
  element(HTimePicker, false, "field");
export const HearthCalendarElement: Constructor<typeof HCalendar> =
  element(HCalendar);
export const HearthDatePickerElement: FormConstructor<typeof HDatePicker> =
  element(HDatePicker, false, "field");
export const HearthDateRangePickerElement: FormConstructor<
  typeof HDateRangePicker
> = element(HDateRangePicker, false, "compound");
export const HearthRangeSliderElement: FormConstructor<typeof HRangeSlider> =
  element(HRangeSlider, false, "compound");
export const HearthStepperElement: Constructor<typeof HStepper> =
  element(HStepper);
export const HearthTimelineElement: Constructor<typeof HTimeline> =
  element(HTimeline);
export const HearthPopoverElement: Constructor<typeof HPopover> = element(
  HPopover,
  true,
);
export const HearthTooltipElement: Constructor<typeof HTooltip> = element(
  HTooltip,
  true,
);
export const HearthDropdownMenuElement: Constructor<typeof HDropdownMenu> =
  element(HDropdownMenu, true);
export const HearthToastElement: Constructor<typeof HToast> = element(HToast);
export const HearthToasterElement: Constructor<typeof HToaster> =
  element(HToaster);
export const HearthSheetElement: Constructor<typeof HSheet> = element(HSheet);
export const HearthDataTableElement: Constructor<typeof HDataTable> =
  element(HDataTable);
export const HearthDescriptionListElement: Constructor<
  typeof HDescriptionList
> = element(HDescriptionList);
export const HearthListElement: Constructor<typeof HList> = element(HList);
export const HearthListItemElement: Constructor<typeof HListItem> =
  element(HListItem);
export const HearthChipElement: Constructor<typeof HChip> = element(
  HChip,
  true,
);
export const HearthChipGroupElement: Constructor<typeof HChipGroup> =
  element(HChipGroup);
export const HearthSegmentedControlElement: FormConstructor<
  typeof HSegmentedControl
> = element(HSegmentedControl, false, "compound");
export const HearthFileUploadElement: FormConstructor<typeof HFileUpload> =
  element(HFileUpload, false, "file");
export const HearthCodeBlockElement: Constructor<typeof HCodeBlock> =
  element(HCodeBlock);
export const HearthCommandPaletteElement: Constructor<typeof HCommandPalette> =
  element(HCommandPalette);
export const HearthLogViewerElement: Constructor<typeof HLogViewer> =
  element(HLogViewer);
export const HearthCopyFieldElement: Constructor<typeof HCopyField> =
  element(HCopyField);
export const HearthConnectionStateElement: Constructor<
  typeof HConnectionState
> = element(HConnectionState);
export const HearthSparklineElement: Constructor<typeof HSparkline> =
  element(HSparkline);
export const HearthSettingsPageElement: Constructor<typeof HSettingsPage> =
  element(HSettingsPage);
export const HearthProviderSetupElement: Constructor<typeof HProviderSetup> =
  element(HProviderSetup);
export const HearthResourceDetailElement: Constructor<typeof HResourceDetail> =
  element(HResourceDetail);
export const HearthStatusPageElement: Constructor<typeof HStatusPage> =
  element(HStatusPage);
export const HearthErrorPageElement: Constructor<typeof HErrorPage> =
  element(HErrorPage);
export const HearthFirstRunSetupElement: Constructor<typeof HFirstRunSetup> =
  element(HFirstRunSetup);

const elements: Record<string, VueElementConstructor<unknown>> = {
  theme: HearthThemeElement,
  icon: HearthIconElement,
  brand: HearthBrandElement,
  button: HearthButtonElement,
  badge: HearthBadgeElement,
  input: HearthInputElement,
  select: HearthSelectElement,
  switch: HearthSwitchElement,
  card: HearthCardElement,
  "app-card": HearthAppCardElement,
  "stat-card": HearthStatCardElement,
  alert: HearthAlertElement,
  "empty-state": HearthEmptyStateElement,
  tabs: HearthTabsElement,
  dialog: HearthDialogElement,
  "page-header": HearthPageHeaderElement,
  "public-shell": HearthPublicShellElement,
  "dashboard-shell": HearthDashboardShellElement,
  "auth-page": HearthAuthPageElement,
  combobox: HearthComboboxElement,
  "multi-select": HearthMultiSelectElement,
  checkbox: HearthCheckboxElement,
  "radio-group": HearthRadioGroupElement,
  textarea: HearthTextareaElement,
  range: HearthRangeElement,
  "button-bar": HearthButtonBarElement,
  "navigation-menu": HearthNavigationMenuElement,
  sidebar: HearthSidebarElement,
  progress: HearthProgressElement,
  breadcrumbs: HearthBreadcrumbsElement,
  avatar: HearthAvatarElement,
  separator: HearthSeparatorElement,
  skeleton: HearthSkeletonElement,
  accordion: HearthAccordionElement,
  pagination: HearthPaginationElement,
  popover: HearthPopoverElement,
  timeline: HearthTimelineElement,
  "theme-switcher": HearthThemeSwitcherElement,
  "number-input": HearthNumberInputElement,
  "time-picker": HearthTimePickerElement,
  calendar: HearthCalendarElement,
  "date-picker": HearthDatePickerElement,
  "date-range-picker": HearthDateRangePickerElement,
  "range-slider": HearthRangeSliderElement,
  stepper: HearthStepperElement,
  tooltip: HearthTooltipElement,
  "dropdown-menu": HearthDropdownMenuElement,
  toast: HearthToastElement,
  toaster: HearthToasterElement,
  sheet: HearthSheetElement,
  "data-table": HearthDataTableElement,
  "description-list": HearthDescriptionListElement,
  list: HearthListElement,
  "list-item": HearthListItemElement,
  chip: HearthChipElement,
  "chip-group": HearthChipGroupElement,
  "segmented-control": HearthSegmentedControlElement,
  "file-upload": HearthFileUploadElement,
  "code-block": HearthCodeBlockElement,
  "command-palette": HearthCommandPaletteElement,
  "log-viewer": HearthLogViewerElement,
  "copy-field": HearthCopyFieldElement,
  "connection-state": HearthConnectionStateElement,
  sparkline: HearthSparklineElement,
  "settings-page": HearthSettingsPageElement,
  "provider-setup": HearthProviderSetupElement,
  "resource-detail": HearthResourceDetailElement,
  "status-page": HearthStatusPageElement,
  "error-page": HearthErrorPageElement,
  "first-run-setup": HearthFirstRunSetupElement,
};

/** Register once, or use a different prefix to coexist with another design system. */
export function registerElements(prefix = "hearth") {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(prefix))
    throw new Error("Use a lowercase, hyphen-separated custom-element prefix.");
  if (typeof customElements === "undefined") return;
  for (const [name, Base] of Object.entries(elements)) {
    const tag = `${prefix}-${name}`;
    const existing = customElements.get(tag);
    if (existing) {
      if (existing !== Base && !(existing.prototype instanceof Base))
        throw new Error(
          `${tag} is already registered by another component library.`,
        );
      continue;
    }
    const Constructor: VueElementConstructor<unknown> = Base;
    customElements.define(tag, class extends Constructor {});
  }
}
