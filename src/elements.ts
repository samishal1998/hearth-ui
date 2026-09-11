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
} from "./index";

type NativeControl = HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
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
  formKind: "field" | "button",
): VueElementConstructor<ElementProps<T> & FormControlAPI>;
function element(
  component: SFC,
  inline = false,
  formKind?: "field" | "button",
): VueElementConstructor<unknown> {
  const Base: VueElementConstructor<unknown> = defineCustomElement(component, {
    styles: [
      `:host{display:${inline ? "inline-block" : "block"};min-width:0;font-family:var(--h-font,system-ui);font-size:var(--h-font-size,14px);color:var(--h-text,#f7f8fb)}:host([hidden]){display:none!important}`,
      ...(component.styles || []),
    ],
  });
  if (!formKind) return Base;
  return class extends Base {
    static formAssociated = true;
    private internals: ElementInternals;
    private initially: { value: string; checked: boolean } | undefined;
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
          formKind === "field" &&
          event.key === "Enter" &&
          !event.isComposing &&
          event.target instanceof HTMLInputElement &&
          event.target.type !== "checkbox"
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
        this.shadowRoot?.querySelector<NativeControl>("input,select,button") ||
        null
      );
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
        };
      if (formKind === "button") {
        c.disabled =
          this.fieldsetDisabled ||
          this.hasAttribute("disabled") ||
          this.hasAttribute("loading");
        return;
      }
      c.disabled = this.fieldsetDisabled || this.hasAttribute("disabled");
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
      this.sync();
    }
    formResetCallback() {
      if (!this.initially || formKind !== "field") return;
      const c = this.control();
      const isCheck = c instanceof HTMLInputElement && c.type === "checkbox";
      Object.assign(this, {
        modelValue: isCheck ? this.initially.checked : this.initially.value,
      });
      if (c) {
        c.value = this.initially.value;
        if (isCheck) (c as HTMLInputElement).checked = this.initially.checked;
      }
      this.sync();
    }
    formStateRestoreCallback(state: string | File | FormData | null) {
      if (typeof state !== "string") return;
      const c = this.control();
      Object.assign(this, {
        modelValue:
          c instanceof HTMLInputElement && c.type === "checkbox"
            ? state === "checked"
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
        ?.querySelector<HTMLElement>("input,select,button,a")
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
