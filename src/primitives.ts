export interface CollectionEntry {
  id: string;
  textValue?: string;
  disabled?: boolean;
}
export type FormControlValue = string | File | FormData | null;
export interface FormControlOptions {
  getValue: () => FormControlValue;
  getState?: () => FormControlValue;
  getValidity?: () => {
    flags: ValidityStateFlags;
    message?: string;
    anchor?: HTMLElement;
  };
  onDisabled?: (disabled: boolean) => void;
  onReset?: () => void;
  onRestore?: (
    state: FormControlValue,
    mode?: "restore" | "autocomplete",
  ) => void;
}
/** The consumer class must declare static formAssociated=true and own attachInternals(). */
export function createFormControlController(
  internals: ElementInternals,
  options: FormControlOptions,
) {
  let disabled = false,
    externalError = "",
    disposed = false;
  function sync() {
    if (disposed) return;
    const value = disabled ? null : options.getValue();
    internals.setFormValue(value, options.getState?.() ?? value);
    const validity: {
      flags: ValidityStateFlags;
      message?: string;
      anchor?: HTMLElement;
    } = options.getValidity?.() ?? { flags: {} };
    const flags: ValidityStateFlags = disabled
      ? {}
      : Object.fromEntries(
          (
            [
              "badInput",
              "customError",
              "patternMismatch",
              "rangeOverflow",
              "rangeUnderflow",
              "stepMismatch",
              "tooLong",
              "tooShort",
              "typeMismatch",
              "valueMissing",
            ] as const
          ).map((key) => [
            key,
            key === "customError" && externalError
              ? true
              : !!validity.flags[key],
          ]),
        );
    const message = disabled
      ? ""
      : externalError || validity.message || "Invalid value.";
    internals.setValidity(flags, message, validity.anchor);
  }
  return {
    sync,
    get validity() {
      return internals.validity;
    },
    get validationMessage() {
      return internals.validationMessage;
    },
    setCustomValidity(message: string) {
      if (disposed) return;
      externalError = message;
      sync();
    },
    setDisabled(value: boolean) {
      if (disposed) return;
      disabled = value;
      options.onDisabled?.(value);
      sync();
    },
    reset() {
      if (disposed) return;
      externalError = "";
      options.onReset?.();
      sync();
    },
    restore(state: FormControlValue, mode?: "restore" | "autocomplete") {
      if (disposed) return;
      options.onRestore?.(state, mode);
      sync();
    },
    checkValidity() {
      sync();
      return internals.checkValidity();
    },
    reportValidity() {
      sync();
      return internals.reportValidity();
    },
    dispose() {
      disposed = true;
    },
  };
}
export interface PopupPositionOptions {
  side?: "top" | "bottom" | "left" | "right";
  align?: "start" | "center" | "end";
  gap?: number;
  padding?: number;
}
export function positionPopup(
  anchor: HTMLElement | (() => DOMRect),
  panel: HTMLElement,
  options: PopupPositionOptions = {},
): void {
  const view = panel.ownerDocument.defaultView;
  if (!view || !panel.getClientRects().length) return;
  const rect =
      typeof anchor === "function" ? anchor() : anchor.getBoundingClientRect(),
    box = panel.getBoundingClientRect(),
    viewport = view.visualViewport;
  const left = viewport?.offsetLeft ?? 0,
    top = viewport?.offsetTop ?? 0,
    right =
      left +
      (viewport?.width ?? panel.ownerDocument.documentElement.clientWidth),
    bottom = top + (viewport?.height ?? view.innerHeight),
    gap = options.gap ?? 8,
    padding = options.padding ?? 12;
  let side = options.side || "bottom";
  if (
    side === "bottom" &&
    rect.bottom + gap + box.height > bottom - padding &&
    rect.top - top > box.height + gap
  )
    side = "top";
  else if (
    side === "top" &&
    rect.top - gap - box.height < top + padding &&
    bottom - rect.bottom > box.height + gap
  )
    side = "bottom";
  else if (side === "left" && rect.left - gap - box.width < left + padding)
    side = "right";
  else if (side === "right" && rect.right + gap + box.width > right - padding)
    side = "left";
  const horizontal = side === "top" || side === "bottom",
    align = options.align || "start";
  let x = horizontal
    ? align === "center"
      ? rect.left + (rect.width - box.width) / 2
      : align === "end"
        ? rect.right - box.width
        : rect.left
    : side === "left"
      ? rect.left - box.width - gap
      : rect.right + gap;
  let y = horizontal
    ? side === "top"
      ? rect.top - box.height - gap
      : rect.bottom + gap
    : align === "center"
      ? rect.top + (rect.height - box.height) / 2
      : align === "end"
        ? rect.bottom - box.height
        : rect.top;
  x = Math.max(left + padding, Math.min(x, right - box.width - padding));
  y = Math.max(top + padding, Math.min(y, bottom - box.height - padding));
  panel.style.left = `${Math.round(x)}px`;
  panel.style.top = `${Math.round(y)}px`;
}
export function observePopup(
  anchor: HTMLElement | (() => DOMRect),
  panel: HTMLElement,
  options: () => PopupPositionOptions = () => ({}),
) {
  const view = panel.ownerDocument.defaultView;
  if (!view) return { update() {}, dispose() {} };
  let frame = 0;
  const update = () => positionPopup(anchor, panel, options()),
    schedule = () => {
      view.cancelAnimationFrame(frame);
      frame = view.requestAnimationFrame(update);
    };
  const observer = new ResizeObserver(schedule);
  observer.observe(panel);
  if (typeof anchor !== "function") observer.observe(anchor);
  view.addEventListener("resize", schedule);
  view.addEventListener("scroll", schedule, true);
  view.visualViewport?.addEventListener("resize", schedule);
  view.visualViewport?.addEventListener("scroll", schedule);
  update();
  return {
    update,
    dispose() {
      observer.disconnect();
      view.cancelAnimationFrame(frame);
      view.removeEventListener("resize", schedule);
      view.removeEventListener("scroll", schedule, true);
      view.visualViewport?.removeEventListener("resize", schedule);
      view.visualViewport?.removeEventListener("scroll", schedule);
    },
  };
}
export function nextCollectionId(
  items: readonly CollectionEntry[],
  current: string | undefined,
  key: string,
  options: {
    orientation?: "horizontal" | "vertical";
    direction?: "ltr" | "rtl";
    wrap?: boolean;
  } = {},
): string | undefined {
  const enabled = items.filter((item) => !item.disabled);
  if (!enabled.length) return;
  if (key === "Home") return enabled[0].id;
  if (key === "End") return enabled.at(-1)!.id;
  const step =
    options.orientation === "horizontal"
      ? (key === "ArrowRight" ? 1 : key === "ArrowLeft" ? -1 : 0) *
        (options.direction === "rtl" ? -1 : 1)
      : key === "ArrowDown"
        ? 1
        : key === "ArrowUp"
          ? -1
          : 0;
  if (!step) return current;
  const index = enabled.findIndex((item) => item.id === current);
  let next = index < 0 ? (step > 0 ? 0 : enabled.length - 1) : index + step;
  next = options.wrap
    ? (next + enabled.length) % enabled.length
    : Math.max(0, Math.min(enabled.length - 1, next));
  return enabled[next].id;
}
export function toggleSelection(
  values: readonly string[],
  id: string,
  multiple = false,
): string[] {
  return values.includes(id)
    ? values.filter((value) => value !== id)
    : multiple
      ? [...values, id]
      : [id];
}
export function createTypeahead(timeout = 700) {
  let query = "",
    last = 0;
  return {
    reset() {
      query = "";
      last = 0;
    },
    search(
      items: readonly CollectionEntry[],
      key: string,
      current?: string,
      now = Date.now(),
    ) {
      if (key.length !== 1 || /\s/.test(key)) return;
      query =
        now - last < timeout
          ? query + key.toLocaleLowerCase()
          : key.toLocaleLowerCase();
      last = now;
      const needle = /^(.)\1+$/.test(query) ? key : query;
      const enabled = items.filter((item) => !item.disabled),
        at = enabled.findIndex((item) => item.id === current);
      const ordered = [...enabled.slice(at + 1), ...enabled.slice(0, at + 1)];
      return ordered.find((item) =>
        (item.textValue || item.id)
          .toLocaleLowerCase()
          .startsWith(needle.toLocaleLowerCase()),
      )?.id;
    },
  };
}
export function focusComposed(root: HTMLElement): HTMLElement {
  function find(node: Node): HTMLElement | undefined {
    if (
      node instanceof HTMLElement &&
      node.matches(
        'button:not(:disabled),input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]',
      ) &&
      !node.closest("[inert]") &&
      node.getClientRects().length
    )
      return node;
    const children =
      node instanceof HTMLSlotElement
        ? node.assignedNodes({ flatten: true }).length
          ? node.assignedNodes({ flatten: true })
          : [...node.childNodes]
        : node instanceof HTMLElement && node.shadowRoot
          ? [...node.shadowRoot.childNodes]
          : [...node.childNodes];
    for (const child of children) {
      const found = find(child);
      if (found) return found;
    }
  }
  const element = find(root) || root;
  element.focus({ preventScroll: true });
  return element;
}
export function createOverlayController(
  element: HTMLDialogElement | HTMLElement,
  options: {
    modal?: boolean;
    initialFocus?: () => HTMLElement | undefined;
    returnFocus?: () => HTMLElement | undefined;
    onClose?: (reason: string) => void;
  } = {},
) {
  let invoker: HTMLElement | undefined,
    reason = "dismiss",
    disposed = false;
  const isDialog = element instanceof HTMLDialogElement;
  const closed = () => {
    const open = isDialog
      ? (element as HTMLDialogElement).open
      : element.matches(":popover-open");
    if (open) return;
    options.onClose?.(reason);
    if (disposed || reason === "outside") return;
    const target = options.returnFocus?.() || invoker;
    if (target?.isConnected) target.focus({ preventScroll: true });
  };
  element.addEventListener(isDialog ? "close" : "toggle", closed);
  const outside = (event: PointerEvent) => {
    if (
      !isDialog &&
      element.matches(":popover-open") &&
      !event.composedPath().includes(element)
    )
      reason = "outside";
  };
  const escape = (event: Event) => {
    const key = event as KeyboardEvent;
    if (key.key === "Escape" && !key.isComposing) reason = "escape";
  };
  const cancel = () => {
    reason = "escape";
  };
  element.ownerDocument.addEventListener("pointerdown", outside, true);
  element.addEventListener("keydown", escape);
  if (isDialog) element.addEventListener("cancel", cancel);
  return {
    open() {
      if (
        disposed ||
        (isDialog
          ? (element as HTMLDialogElement).open
          : element.matches(":popover-open"))
      )
        return;
      let active = element.ownerDocument.activeElement;
      while (active instanceof HTMLElement && active.shadowRoot?.activeElement)
        active = active.shadowRoot.activeElement;
      invoker = active instanceof HTMLElement ? active : undefined;
      reason = "dismiss";
      if (isDialog) {
        if (!(element as HTMLDialogElement).open)
          options.modal === false
            ? (element as HTMLDialogElement).show()
            : (element as HTMLDialogElement).showModal();
      } else {
        element.setAttribute(
          "popover",
          element.getAttribute("popover") || "auto",
        );
        if (!element.matches(":popover-open")) element.showPopover();
      }
      const target = options.initialFocus?.();
      if (target) target.focus({ preventScroll: true });
      else focusComposed(element);
    },
    close(value = "programmatic") {
      if (disposed) return;
      reason = value;
      if (isDialog) (element as HTMLDialogElement).close();
      else if (element.matches(":popover-open")) element.hidePopover();
    },
    dispose() {
      disposed = true;
      element.ownerDocument.removeEventListener("pointerdown", outside, true);
      element.removeEventListener("keydown", escape);
      if (isDialog) element.removeEventListener("cancel", cancel);
      element.removeEventListener(isDialog ? "close" : "toggle", closed);
      if (isDialog) (element as HTMLDialogElement).close();
      else if (element.matches(":popover-open")) element.hidePopover();
    },
  };
}
export function bindField(
  control: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
  options: {
    label: HTMLLabelElement;
    descriptions?: HTMLElement[];
    validationMessage?: string;
    invalid?: boolean;
  },
) {
  const root = control.getRootNode();
  if (
    options.label.getRootNode() !== root ||
    options.descriptions?.some((element) => element.getRootNode() !== root)
  )
    throw new Error(
      "Field labels and descriptions must share the control DOM root.",
    );
  const original = {
    id: control.id,
    for: options.label.htmlFor,
    described: control.getAttribute("aria-describedby"),
    invalid: control.getAttribute("aria-invalid"),
    validity: control.validity.customError ? control.validationMessage : "",
  };
  if (!control.id) {
    let index = 1;
    do {
      control.id = `hearth-field-${index++}`;
    } while (
      (root as Document | ShadowRoot).querySelectorAll(`[id="${control.id}"]`)
        .length > 1
    );
  }
  options.label.htmlFor = control.id;
  const assigned: HTMLElement[] = [];
  const ids = (options.descriptions || []).map((element, index) => {
    if (!element.id) {
      element.id = `${control.id}-description-${index}`;
      assigned.push(element);
    }
    return element.id;
  });
  control.setAttribute(
    "aria-describedby",
    [...new Set([...(original.described?.split(/\s+/) || []), ...ids])]
      .filter(Boolean)
      .join(" "),
  );
  const update = (value: { validationMessage?: string; invalid?: boolean }) => {
    if (value.validationMessage !== undefined)
      control.setCustomValidity(value.validationMessage);
    if (value.invalid !== undefined)
      control.setAttribute("aria-invalid", String(value.invalid));
  };
  update(options);
  return {
    update,
    dispose() {
      control.id = original.id;
      options.label.htmlFor = original.for;
      for (const element of assigned) element.removeAttribute("id");
      for (const [name, value] of [
        ["aria-describedby", original.described],
        ["aria-invalid", original.invalid],
      ] as const) {
        if (value === null) control.removeAttribute(name);
        else control.setAttribute(name, value);
      }
      control.setCustomValidity(original.validity);
    },
  };
}
