import { test, expect } from "@playwright/test";

test("nonmodal controller light-dismiss does not steal focus from an outside control", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(async () => {
    const { createOverlayController } =
      await import("/primitives-demo.ts");
    const section = document.createElement("section");
    section.id = "consumer-popup-section";
    section.innerHTML =
      '<button type="button" id="consumer-popup-trigger">Open consumer popup</button><div id="consumer-popup" popover="auto" style="position:fixed;inset:100px auto auto 20px;margin:0"><input aria-label="Consumer popup input"></div><button type="button" id="consumer-popup-outside">Outside consumer control</button>';
    document.body.append(section);
    const content = section.querySelector<HTMLElement>("#consumer-popup")!;
    const controller = createOverlayController(content, {
      onClose: (reason) => (section.dataset.reason = reason),
    });
    section
      .querySelector("#consumer-popup-trigger")!
      .addEventListener("click", () => controller.open());
  });
  await page.getByRole("button", { name: "Open consumer popup" }).click();
  await expect(
    page.getByRole("textbox", { name: "Consumer popup input" }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Outside consumer control" }).click();
  await expect(
    page.getByRole("textbox", { name: "Consumer popup input" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Outside consumer control" }),
  ).toBeFocused();
  await expect(page.locator("#consumer-popup-section")).toHaveAttribute(
    "data-reason",
    "outside",
  );
});

test("consumer-defined form controls use public internals bindings for reset, disabled fieldsets, and server validity", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(async () => {
    const { createFormControlController } =
      await import("/primitives-demo.ts");
    class CustomField extends HTMLElement {
      static formAssociated = true;
      field: HTMLInputElement;
      binding: ReturnType<typeof createFormControlController>;
      constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML =
          '<label>Custom native value <input required value="seed"></label>';
        this.field = root.querySelector("input")!;
        const internals = this.attachInternals();
        this.binding = createFormControlController(internals, {
          getValue: () => this.field.value,
          getValidity: () => ({
            flags: this.field.validity,
            message: this.field.validationMessage,
            anchor: this.field,
          }),
          onDisabled: (value) => (this.field.disabled = value),
          onReset: () => (this.field.value = "seed"),
          onRestore: (state) => {
            if (typeof state === "string") this.field.value = state;
          },
        });
        this.field.addEventListener("input", () => this.binding.sync());
      }
      connectedCallback() {
        this.binding.sync();
      }
      formResetCallback() {
        this.binding.reset();
      }
      formDisabledCallback(disabled: boolean) {
        this.binding.setDisabled(disabled);
      }
      formStateRestoreCallback(state: string) {
        this.binding.restore(state);
      }
    }
    customElements.define("test-public-field", CustomField);
    const form = document.createElement("form");
    form.id = "public-face-form";
    form.innerHTML =
      '<fieldset id="public-face-fields"><test-public-field name="value"></test-public-field></fieldset>';
    document.body.append(form);
  });
  const form = page.locator("#public-face-form"),
    field = page.getByRole("textbox", { name: "Custom native value" });
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("value"),
    ),
  ).toBe("seed");
  await field.fill("");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await field.fill("new");
  await page
    .locator("test-public-field")
    .evaluate((el: any) =>
      el.binding.setCustomValidity("Server rejected this value."),
    );
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await form.evaluate((el) => (el as HTMLFormElement).reset());
  await expect(field).toHaveValue("seed");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(true);
  await page
    .locator("#public-face-fields")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = true));
  await expect(field).toBeDisabled();
  expect(
    await form.evaluate((el) => [...new FormData(el as HTMLFormElement)]),
  ).toEqual([]);
  await page
    .locator("#public-face-fields")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = false));
  await page
    .locator("test-public-field")
    .evaluate((el: any) => el.formStateRestoreCallback("restored"));
  await expect(field).toHaveValue("restored");
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).get("value"),
    ),
  ).toBe("restored");
});

test("web-component panes, table card slots and disabled-action explanations work without scoped slots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1100, height: 900 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const theme = document.querySelector("hearth-theme")!;
    const pane = document.createElement("hearth-pane");
    pane.id = "web-inspector";
    Object.assign(pane, {
      open: true,
      title: "Web inspector",
      mobileBreakpoint: 640,
    });
    pane.innerHTML =
      '<hearth-input label="Web draft" value="initial"></hearth-input><hearth-button slot="footer">Inspector footer</hearth-button>';
    pane.addEventListener("update:open", (event) =>
      Object.assign(pane, { open: (event as CustomEvent).detail[0] }),
    );
    theme.append(pane);
    const table = document.createElement("hearth-data-table");
    table.id = "web-responsive";
    Object.assign(table, {
      label: "Web records",
      selectable: true,
      rows: [
        { id: "a", name: "Alpha", status: "Healthy" },
        { id: "b", name: "Beta", status: "Offline" },
      ],
      columns: [
        { key: "name", label: "Name", minWidth: "180px" },
        { key: "status", label: "State" },
      ],
      rowActions: {
        a: [{ id: "edit", label: "Edit Alpha" }],
        b: [{ id: "remove", label: "Remove Beta", disabled: true }],
      },
      rowActivatable: true,
    });
    table.innerHTML =
      '<strong slot="cell:a:status">Custom healthy status</strong>';
    table.addEventListener(
      "row-activate",
      (event) =>
        (table.dataset.activated = (event as CustomEvent).detail[0].id),
    );
    theme.append(table);
    const tooltip = document.createElement("hearth-tooltip");
    Object.assign(tooltip, {
      text: "Stop the session before removal.",
      label: "Disabled removal reason",
      focusable: true,
    });
    tooltip.innerHTML =
      "<hearth-button disabled>Remove stopped session</hearth-button>";
    theme.append(tooltip);
  });
  const pane = page.locator("hearth-pane#web-inspector");
  await pane
    .getByRole("textbox", { name: "Web draft" })
    .fill("Mobile-safe draft");
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = page.getByRole("dialog", { name: "Web inspector" });
  await expect(pane.getByRole("textbox", { name: "Web draft" })).toHaveValue(
    "Mobile-safe draft",
  );
  await expect(
    pane.getByRole("button", { name: "Inspector footer" }),
  ).toBeInViewport();
  expect(await dialog.ariaSnapshot()).toContain(
    'textbox "Web draft": Mobile-safe draft',
  );
  await dialog.getByRole("button", { name: "Close Web inspector" }).click();
  await expect(dialog).not.toBeVisible();
  const table = page.locator("hearth-data-table#web-responsive");
  await table
    .locator(".h-table-select label")
    .nth(1)
    .click({ position: { x: 30, y: 20 } });
  expect(await table.getAttribute("data-activated")).toBeNull();
  await expect(table.getByText("Custom healthy status")).toBeVisible();
  await table.getByRole("button", { name: "Alpha", exact: true }).click();
  await expect(table).toHaveAttribute("data-activated", "a");
  await table.getByRole("button", { name: "Actions for b" }).click();
  await expect(
    page.getByRole("menuitem", { name: "Remove Beta" }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  const reason = page
    .locator("hearth-tooltip")
    .filter({
      has: page.getByRole("button", { name: "Remove stopped session" }),
    })
    .locator(".h-tooltip")
    .first();
  await reason.focus();
  await expect(page.getByRole("tooltip")).toHaveText(
    "Stop the session before removal.",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).not.toBeVisible();
});

test("responsive table keeps scoped cell content, per-row disabled actions, column thresholds and activation", async ({
  page,
}) => {
  await page.goto("/#examples");
  const root = page.getByRole("region", {
      name: "Composable workspace examples",
    }),
    table = root.getByRole("table", { name: "Composed resource registry" });
  await expect(
    table.getByRole("button", { name: "Photo library", exact: true }),
  ).toBeVisible();
  await expect(
    table.getByRole("columnheader", { name: "Provider", exact: true }),
  ).toHaveCount(1);
  await table.evaluate(
    (el) =>
      ((el.closest(".h-data-table") as HTMLElement).style.maxWidth = "500px"),
  );
  await expect(
    table.getByRole("columnheader", { name: "Provider", exact: true }),
  ).toHaveCount(0);
  await table
    .getByRole("button", { name: "Actions for media", exact: true })
    .click();
  await expect(
    page.getByRole("menuitem", { name: "Remove resource", exact: true }),
  ).toBeDisabled();
  await page.keyboard.press("Escape");
  await table
    .getByRole("button", { name: "Photo library", exact: true })
    .click();
  const pane = root.getByRole("complementary", { name: "Session inspector" });
  await expect(pane.getByText("Photo library", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("dialog", { name: "Session inspector" }),
  ).toBeVisible();
  await page
    .getByRole("dialog", { name: "Session inspector" })
    .getByRole("button", { name: "Close Session inspector" })
    .click();
  await expect(table.locator("tbody tr")).toHaveCount(3);
  expect(
    await table.evaluate((el) => el.getBoundingClientRect().width),
  ).toBeLessThanOrEqual(390);
  await expect(
    table.locator(".h-table-card-label").filter({ hasText: "State" }).first(),
  ).toBeVisible();
  await table
    .getByRole("checkbox", { name: "Select photos", exact: true })
    .check();
  await expect(root.getByText("1 selected", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("pane and mobile sidebar footer retain mounted inputs and identity while resizing", async ({
  page,
}) => {
  await page.goto("/#examples");
  const root = page.getByRole("region", {
    name: "Composable workspace examples",
  });
  await root.getByRole("button", { name: "Open session inspector" }).click();
  const sendBounds = (await root
    .getByRole("button", { name: "Send session message" })
    .boundingBox())!;
  const workspaceBounds = (await root
    .locator(".workspace-demo")
    .boundingBox())!;
  expect(sendBounds.y + sendBounds.height).toBeLessThanOrEqual(
    workspaceBounds.y + workspaceBounds.height + 1,
  );
  const composer = root.getByRole("textbox", {
    name: "Compose session message",
  });
  await composer.fill("Keep this draft");
  const footer = root.getByRole("textbox", { name: "Persistent sidebar note" });
  await footer.fill("Remember this");
  await composer.evaluate(
    (el) => ((el as HTMLElement).dataset.identity = "persistent"),
  );
  await composer.focus();
  await page.setViewportSize({ width: 390, height: 844 });
  const dialog = page.getByRole("dialog", { name: "Session inspector" });
  await expect(
    dialog.getByRole("textbox", { name: "Compose session message" }),
  ).toHaveValue("Keep this draft");
  await expect(
    dialog.getByRole("textbox", { name: "Compose session message" }),
  ).toHaveAttribute("data-identity", "persistent");
  await expect(
    dialog.getByRole("textbox", { name: "Compose session message" }),
  ).toBeFocused();
  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(composer).toHaveValue("Keep this draft");
  await expect(composer).toHaveAttribute("data-identity", "persistent");
  await expect(composer).toBeFocused();
  await root.getByRole("button", { name: "Close Session inspector" }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await root
    .getByRole("button", { name: "Open navigation", exact: true })
    .click();
  const navigation = page.getByRole("dialog", { name: "Main navigation" });
  await expect(
    navigation.getByRole("textbox", { name: "Persistent sidebar note" }),
  ).toHaveValue("Remember this");
  await navigation
    .getByRole("textbox", { name: "Persistent sidebar note" })
    .fill("Mobile edit");
  await page.setViewportSize({ width: 1100, height: 900 });
  await expect(footer).toHaveValue("Mobile edit");
});

test("list composition separates selection from activation, and message composer is IME-safe", async ({
  page,
}) => {
  await page.goto("/#examples");
  const root = page.getByRole("region", {
    name: "Composable workspace examples",
  });
  const selection = root.getByRole("checkbox", {
    name: "Select inspection session",
  });
  await selection.check();
  await expect(
    root.getByRole("complementary", { name: "Session inspector" }),
  ).not.toBeVisible();
  await root.getByRole("button", { name: "Open inspection session" }).click();
  const textarea = root.getByRole("textbox", {
    name: "Compose session message",
  });
  await textarea.fill("First line");
  await textarea.press("Shift+Enter");
  await textarea.press("x");
  await expect(textarea).toHaveValue("First line\nx");
  await textarea.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(textarea).toHaveValue("First line\nx");
  await textarea.press("Enter");
  await expect(textarea).toHaveValue("");
  await expect(root.getByText("First line\nx", { exact: true })).toBeVisible();
});

test("listbox and tree keep active and selected state separate with typeahead, disabled items, and RTL", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const list = document.createElement("hearth-listbox");
    list.id = "public-listbox";
    Object.assign(list, {
      label: "Public choices",
      options: [
        { value: "alpha", label: "Alpha" },
        { value: "beta", label: "Beta", disabled: true },
        { value: "bravo", label: "Bravo" },
        { value: "charlie", label: "Charlie" },
      ],
      value: "alpha",
    });
    list.addEventListener(
      "change",
      (event) =>
        (list.dataset.value = JSON.stringify((event as CustomEvent).detail[0])),
    );
    const tree = document.createElement("hearth-tree-view");
    tree.id = "public-tree";
    Object.assign(tree, {
      label: "Public hierarchy",
      items: [
        {
          id: "root",
          label: "Root",
          children: [
            { id: "a", label: "Alpha" },
            { id: "b", label: "Beta", disabled: true },
            { id: "c", label: "Charlie" },
          ],
        },
      ],
    });
    document.querySelector("hearth-theme")!.append(list, tree);
  });
  const list = page.locator("hearth-listbox#public-listbox"),
    box = list.getByRole("listbox");
  await box.focus();
  await box.press("ArrowDown");
  await expect(
    list.getByRole("option", { name: "Alpha", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await box.press("Enter");
  await expect(list).toHaveAttribute("data-value", '"bravo"');
  await box.press("c");
  await box.press("Enter");
  await expect(list).toHaveAttribute("data-value", '"charlie"');
  const tree = page.locator("hearth-tree-view#public-tree"),
    branch = tree.getByRole("treeitem", { name: "Root", exact: true });
  await branch.focus();
  await branch.press("ArrowRight");
  await expect(branch).toHaveAttribute("aria-expanded", "true");
  await branch.press("ArrowRight");
  await expect(tree.getByRole("treeitem", { name: "Alpha" })).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(tree.getByRole("treeitem", { name: "Charlie" })).toBeFocused();
  await tree.evaluate((el) => (el.style.direction = "rtl"));
  await page.keyboard.press("ArrowRight");
  await expect(branch).toBeFocused();
  await branch.press("ArrowRight");
  await expect(branch).toHaveAttribute("aria-expanded", "false");
});

test("virtual list bounds rendering and retains focused rows while scrolling", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const list = document.createElement("hearth-virtual-list");
    list.id = "public-virtual";
    Object.assign(list, {
      label: "Many observations",
      height: 240,
      rowHeight: 48,
      overscan: 3,
      items: Array.from({ length: 2000 }, (_, index) => ({
        id: String(index),
        label: `Observation ${index}`,
      })),
    });
    list.innerHTML = '<button slot="item:0" type="button">Keep focus</button>';
    document.querySelector("hearth-theme")!.append(list);
  });
  const root = page.locator("hearth-virtual-list#public-virtual"),
    viewport = root.getByRole("list");
  await expect(root.getByRole("listitem")).toHaveCount(8);
  await root.getByRole("button", { name: "Keep focus" }).focus();
  await viewport.evaluate((el) => (el.scrollTop = 48000));
  await expect.poll(() => root.getByRole("listitem").count()).toBeLessThan(15);
  await expect(root.getByRole("button", { name: "Keep focus" })).toBeFocused();
  await expect(
    root.getByRole("listitem").filter({ hasText: "Observation 1000" }),
  ).toHaveAttribute("aria-posinset", "1001");
  await root.evaluate((el) => Object.assign(el, { activeId: "1500" }));
  await expect.poll(() => viewport.evaluate((el) => el.scrollTop)).toBe(72000);
});

test("context menu, confirmation and resizing expose keyboard and non-drag pointer controls", async ({
  page,
}) => {
  await page.goto("/#examples");
  const root = page.getByRole("region", {
    name: "Composable workspace examples",
  });
  await root
    .getByRole("button", { name: "Composed contextual actions", exact: true })
    .click();
  await expect(
    page.getByRole("menu", { name: "Composed contextual actions" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const separator = root.getByRole("separator", { name: "Inspector width" });
  await separator.focus();
  await separator.press("ArrowLeft");
  await expect(separator).toHaveAttribute("aria-valuenow", "340");
  await root.getByRole("button", { name: "Decrease pane width" }).click();
  await expect(separator).toHaveAttribute("aria-valuenow", "320");
  await root
    .getByRole("table", { name: "Composed resource registry" })
    .getByRole("button", { name: "Actions for photos" })
    .click();
  await page
    .getByRole("menuitem", { name: "Remove resource", exact: true })
    .click();
  const confirmation = page.getByRole("alertdialog", {
    name: "Remove this resource?",
  });
  await expect(confirmation).toBeVisible();
  await expect(
    confirmation.getByRole("button", { name: "Cancel", exact: true }),
  ).toBeFocused();
  await confirmation
    .getByRole("button", { name: "Confirm", exact: true })
    .click();
  await expect(confirmation).not.toBeVisible();
});

test("public field and overlay controllers compose consumer-owned native DOM and restore it on disposal", async ({
  page,
}) => {
  await page.goto("/elements.html");
  const result = await page.evaluate(async () => {
    const { bindField, createOverlayController, positionPopup } =
      await import("/primitives-demo.ts");
    const section = document.createElement("section");
    section.innerHTML =
      '<label>Name</label><input aria-describedby="existing"><p>Help text</p><button type="button">Open consumer dialog</button><dialog><button type="button">Close consumer dialog</button></dialog>';
    document.body.append(section);
    const input = section.querySelector("input")!,
      label = section.querySelector("label")!,
      description = section.querySelector("p")!;
    const field = bindField(input, {
      label,
      descriptions: [description],
      validationMessage: "Fix this value.",
      invalid: true,
    });
    const associated =
      label.htmlFor === input.id &&
      input.getAttribute("aria-describedby")!.includes(description.id) &&
      !input.checkValidity();
    field.dispose();
    const restored =
      !input.id &&
      !label.htmlFor &&
      input.getAttribute("aria-describedby") === "existing" &&
      input.checkValidity();
    const trigger = section.querySelector("button")!,
      dialog = section.querySelector("dialog")!;
    trigger.focus();
    const controller = createOverlayController(dialog, {
      returnFocus: () => trigger,
    });
    controller.open();
    const modal = dialog.matches(":modal");
    controller.close();
    await new Promise((resolve) => setTimeout(resolve, 50));
    const returned = document.activeElement === trigger;
    controller.dispose();
    const popup = document.createElement("div");
    popup.setAttribute("popover", "auto");
    popup.style.cssText =
      "position:fixed;inset:auto;margin:0;width:180px;height:100px";
    section.append(popup);
    popup.showPopover();
    positionPopup(
      () => new DOMRect(innerWidth - 20, innerHeight - 20, 20, 20),
      popup,
    );
    const bounds = popup.getBoundingClientRect();
    const positioned =
      bounds.right <= innerWidth && bounds.bottom <= innerHeight;
    popup.hidePopover();
    section.remove();
    return { associated, restored, modal, returned, positioned };
  });
  expect(result).toEqual({
    associated: true,
    restored: true,
    modal: true,
    returned: true,
    positioned: true,
  });
});
