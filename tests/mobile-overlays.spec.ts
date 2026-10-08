import { test, expect, type Locator, type Page } from "@playwright/test";
test.use({ hasTouch: true });

async function docked(panel: Locator, page: Page) {
  await expect(panel).toHaveClass(/h-mobile(?: |$)/);
  await expect
    .poll(async () => Math.round((await panel.boundingBox())?.width ?? 0))
    .toBe(page.viewportSize()!.width);
  const box = (await panel.boundingBox())!;
  expect(Math.abs(box.x)).toBeLessThanOrEqual(1);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(
    Math.abs(box.y + box.height - page.viewportSize()!.height),
  ).toBeLessThanOrEqual(1);
}

test("Vue dialogs and side sheets switch at the breakpoint without losing input or focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto("/#examples");
  await page
    .getByRole("button", { name: "Open a real dialog", exact: true })
    .click();
  const dialog = page.getByRole("dialog", {
    name: "A little room for a decision.",
  });
  await expect(dialog).not.toHaveClass(/h-mobile(?: |$)/);
  const field = dialog.getByLabel("A name for your next project");
  await field.fill("Keep this draft");
  await page.setViewportSize({ width: 640, height: 800 });
  await docked(dialog, page);
  await expect(field).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe("hidden");
  expect(await field.evaluate((el) => getComputedStyle(el).fontSize)).toBe(
    "16px",
  );
  await page.setViewportSize({ width: 641, height: 800 });
  await expect(dialog).not.toHaveClass(/h-mobile(?: |$)/);
  await expect(field).toHaveValue("Keep this draft");
  await expect(field).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).not.toBe("hidden");
  await page.setViewportSize({ width: 390, height: 844 });
  await docked(dialog, page);
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press("Tab");
    expect(
      // Native dialogs permit visiting browser chrome, but keep page controls inert.
      await dialog.evaluate(
        (el) =>
          el.matches(":modal") &&
          (el.contains(document.activeElement) ||
            document.activeElement === document.body),
      ),
    ).toBe(true);
  }
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).not.toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).not.toBe("hidden");
  await page
    .getByRole("button", { name: "Inspect provider", exact: true })
    .click();
  const sheet = page.getByRole("dialog", { name: "Provider details" });
  await docked(sheet, page);
  await sheet.getByLabel("Provider display name").fill("Saved draft");
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(sheet).not.toHaveClass(/h-mobile(?: |$)/);
  await expect(sheet.getByLabel("Provider display name")).toHaveValue(
    "Saved draft",
  );
  const box = (await sheet.boundingBox())!;
  expect(Math.round(box.width)).toBe(440);
  expect(Math.round(box.x + box.width)).toBe(1000);
  await page.keyboard.press("Escape");
  await expect(sheet).not.toBeVisible();
});

test("theme inheritance, per-overlay overrides, nested islands, scroll locking, and virtual keyboard sizing work across shadow roots", async ({
  page,
}) => {
  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    theme.id = "overlay-theme";
    Object.assign(theme, { mobileBreakpoint: 500 });
    const nested = document.createElement("hearth-theme");
    nested.id = "nested-overlay-theme";
    theme.append(nested);
    const dialog = document.createElement("hearth-dialog");
    dialog.id = "responsive-dialog";
    Object.assign(dialog, { title: "Responsive fixture", open: true });
    dialog.innerHTML =
      '<hearth-input label="Persistent draft"></hearth-input><div style="height:1500px">Long scrollable content</div><hearth-button slot="footer">Footer action</hearth-button>';
    dialog.addEventListener("close", () =>
      Object.assign(dialog, { open: false }),
    );
    nested.append(dialog);
    document.querySelector("hearth-theme")!.append(theme);
  });
  const host = page.locator("hearth-dialog#responsive-dialog"),
    dialog = host.getByRole("dialog", { name: "Responsive fixture" });
  await expect(dialog).toBeVisible();
  await expect(dialog).not.toHaveClass(/h-mobile(?: |$)/);
  await page
    .locator("hearth-theme#overlay-theme")
    .evaluate((el) => Object.assign(el, { mobileBreakpoint: 900 }));
  await docked(dialog, page);
  await host.evaluate((el) => Object.assign(el, { mobileBreakpoint: 0 }));
  await expect(dialog).not.toHaveClass(/h-mobile(?: |$)/);
  await host.evaluate((el) =>
    Object.assign(el, { mobileBreakpoint: undefined }),
  );
  await docked(dialog, page);
  await page
    .locator("hearth-theme#nested-overlay-theme")
    .evaluate((el) => Object.assign(el, { mobileBreakpoint: 600 }));
  await expect(dialog).not.toHaveClass(/h-mobile(?: |$)/);
  await page
    .locator("hearth-theme#nested-overlay-theme")
    .evaluate((el) => Object.assign(el, { mobileBreakpoint: undefined }));
  await docked(dialog, page);
  const body = host.locator("[part=body]");
  expect(await body.evaluate((el) => el.scrollHeight > el.clientHeight)).toBe(
    true,
  );
  await body.evaluate((el) => (el.scrollTop = el.scrollHeight));
  await expect(
    host.getByRole("button", { name: "Footer action" }),
  ).toBeVisible();
  await expect(
    host.getByRole("button", { name: "Close dialog" }),
  ).toBeInViewport();
  await page.evaluate(() => {
    Object.defineProperty(window.visualViewport, "height", {
      value: 320,
      configurable: true,
    });
    window.visualViewport!.dispatchEvent(new Event("resize"));
  });
  await expect
    .poll(async () => {
      const box = (await dialog.boundingBox())!;
      return Math.round(box.y + box.height);
    })
    .toBe(320);
  await expect(
    host.getByRole("button", { name: "Close dialog" }),
  ).toBeInViewport();
  await page.evaluate(() => {
    const sheet = document.createElement("hearth-sheet");
    sheet.id = "nested-modal";
    Object.assign(sheet, { title: "Second modal", open: true });
    document.querySelector("hearth-theme#nested-overlay-theme")!.append(sheet);
  });
  await expect(
    page.getByRole("dialog", { name: "Second modal" }),
  ).toBeVisible();
  await host.evaluate((el) => Object.assign(el, { open: false }));
  expect(
    await page.evaluate(() => document.documentElement.style.overflow),
  ).toBe("hidden");
  await page
    .getByRole("dialog", { name: "Second modal" })
    .getByRole("button", { name: "Close panel" })
    .click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.style.overflow))
    .not.toBe("hidden");
});

test("picker and menu panels dock on mobile and restore anchored desktop placement", async ({
  page,
}) => {
  await page.setViewportSize({ width: 900, height: 800 });
  await page.goto("/#components/HDatePicker");
  await page
    .getByRole("spinbutton", { name: "Mobile breakpoint (px)" })
    .fill("1000");
  await page
    .getByRole("button", { name: "Open calendar for Maintenance date" })
    .click();
  const panel = page.getByRole("dialog", {
    name: "Open calendar for Maintenance date",
  });
  await docked(panel, page);
  const day = panel.locator('button[tabindex="0"]');
  await expect(day).toBeFocused();
  await page
    .locator(".registry-preview")
    .evaluate((el) => el.style.setProperty("--h-mobile-breakpoint", "0px"));
  await expect(panel).not.toHaveClass(/h-mobile(?: |$)/);
  await expect(day).toBeFocused();
  expect((await panel.boundingBox())!.width).toBeLessThan(900);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page
    .getByRole("button", { name: "Record actions", exact: true })
    .click();
  const menu = page.getByRole("menu", { name: "Record actions" });
  const menuPanel = page.locator(
    "hearth-dropdown-menu#command-menu .h-dropdown-panel",
  );
  await docked(menuPanel, page);
  await expect(
    menu.getByRole("menuitem", { name: "Edit record" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-result")).toHaveText("delete");
  await expect(menu).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open command palette", exact: true })
    .click();
  const commands = page.getByRole("dialog", { name: "Command palette" });
  await docked(commands, page);
  await expect(
    page.getByRole("combobox", { name: "Search commands" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(commands).not.toBeVisible();
});

test("mobile multi-selection remains searchable above clipping ancestors and retains form values across resizing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "mobile-selection-form";
    form.style.cssText = "height:100px;overflow:hidden";
    const el = document.createElement("hearth-multi-select");
    Object.assign(el, {
      label: "Mobile providers",
      name: "providers",
      options: Array.from({ length: 40 }, (_, i) => ({
        value: `p${i}`,
        label: `Provider ${i}`,
      })),
    });
    form.append(el);
    document.querySelector("hearth-theme")!.append(form);
  });
  const host = page.locator("#mobile-selection-form hearth-multi-select"),
    input = host.getByRole("combobox", { name: "Mobile providers" });
  await input.fill("Provider 2");
  const panel = host.locator(".h-combo-anchor");
  await docked(panel, page);
  await expect(input).toBeFocused();
  await host.getByRole("option", { name: "Provider 2", exact: true }).click();
  await expect(
    host.getByRole("option", { name: "Provider 2", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  expect(
    await page
      .locator("#mobile-selection-form")
      .evaluate((el) =>
        new FormData(el as HTMLFormElement).getAll("providers"),
      ),
  ).toEqual(["p2"]);
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(panel).not.toHaveClass(/h-mobile(?: |$)/);
  expect(await panel.evaluate((el) => el.matches(":popover-open"))).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await docked(panel, page);
  await input.fill("Provider 3");
  await host.getByRole("option", { name: "Provider 3", exact: true }).click();
  await host
    .getByRole("button", { name: "Close Mobile providers options" })
    .click();
  await expect(input).toHaveAttribute("aria-expanded", "false");
  await expect(
    host.getByRole("button", { name: "Toggle Mobile providers options" }),
  ).toBeFocused();
  expect(
    await page
      .locator("#mobile-selection-form")
      .evaluate((el) =>
        new FormData(el as HTMLFormElement).getAll("providers"),
      ),
  ).toEqual(["p2", "p3"]);
  await input.focus();
  await docked(panel, page);
  await input.press("Escape");
  await expect(input).toHaveAttribute("aria-expanded", "false");
  expect(errors).toEqual([]);
});

test("navigation expands inline, dashboard navigation uses the configured threshold, and tooltips support touch dismissal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const container = document.createElement("div");
    container.innerHTML =
      '<hearth-navigation-menu id="mobile-nav"></hearth-navigation-menu><hearth-tooltip id="touch-help" label="Mobile help" text="Tap for contextual help"></hearth-tooltip><button type="button">Outside mobile controls</button>';
    Object.assign(container.querySelector("#mobile-nav")!, {
      items: [
        {
          id: "manage",
          label: "Manage fixtures",
          children: [{ id: "providers", label: "Fixture providers" }],
        },
      ],
    });
    document.querySelector("hearth-theme")!.append(container);
  });
  const nav = page.locator("hearth-navigation-menu#mobile-nav");
  await nav.getByText("Manage fixtures", { exact: true }).click();
  await expect(
    nav.getByRole("button", { name: "Fixture providers" }),
  ).toBeVisible();
  expect(
    await nav
      .locator(".h-menu-popup")
      .evaluate((el) => getComputedStyle(el).position),
  ).toBe("static");
  await page.keyboard.press("Escape");
  await expect(
    nav.getByRole("button", { name: "Fixture providers" }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Mobile help", exact: true }).tap();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await page.getByRole("button", { name: "Outside mobile controls" }).tap();
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await page.goto("/#dashboard");
  await page.getByRole("button", { name: "Open navigation" }).click();
  await docked(page.getByRole("dialog", { name: "Main navigation" }), page);
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect(
    page.getByRole("dialog", { name: "Main navigation" }),
  ).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).not.toBeVisible();
});
