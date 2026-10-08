import { test, expect, type Page } from "@playwright/test";

async function color(page: Page, label: string, value: string) {
  await page
    .getByLabel(label, { exact: true })
    .evaluate((el: HTMLInputElement, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
    }, value);
}

test("studio isolates both modes and exported CSS round-trips through Vue-style owners and web-component parts", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/#themes");
  await color(page, "Accent", "#ff55aa");
  await color(page, "Background", "#112233");
  await color(page, "Secondary text", "#ccddee");
  await page.getByLabel("Color mode", { exact: true }).selectOption("light");
  await expect(page.getByLabel("Accent", { exact: true })).not.toHaveValue(
    "#ff55aa",
  );
  await color(page, "Accent", "#0066aa");
  await color(page, "Background", "#edf4fe");
  await expect(page.locator("[data-preview-mode=dark]")).toHaveCSS(
    "background-color",
    "rgb(17, 34, 51)",
  );
  await expect(page.locator("[data-preview-mode=light]")).toHaveCSS(
    "background-color",
    "rgb(237, 244, 254)",
  );
  await page.getByLabel("Color mode", { exact: true }).selectOption("dark");
  await expect(page.getByLabel("Accent", { exact: true })).toHaveValue(
    "#ff55aa",
  );
  await page.reload();
  await expect(page.getByLabel("Accent", { exact: true })).toHaveValue(
    "#ff55aa",
  );
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("hearth-playground")!),
  );
  expect(stored.version).toBe(2);
  expect(stored.tokens["--h-accent"]).toBeUndefined();
  expect(stored.modeTokens.dark["--h-accent"]).toBe("#ff55aa");
  expect(stored.modeTokens.light["--h-accent"]).toBe("#0066aa");
  await page.getByLabel("Color mode", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator(".h-theme").first()).toHaveCSS(
    "background-color",
    "rgb(237, 244, 254)",
  );
  expect(
    await page
      .locator(".h-theme")
      .first()
      .evaluate((el) =>
        (el as HTMLElement).style.getPropertyValue("--h-muted"),
      ),
  ).toBe("");
  await page.getByRole("button", { name: "Export your theme" }).click();
  const dialog = page.getByRole("dialog");
  const vueCSS = (await dialog.locator("pre").textContent())!;
  await dialog.getByLabel("Export format").selectOption("elements-css");
  const elementCSS = (await dialog.locator("pre").textContent())!;
  await dialog.getByLabel("Export format").selectOption("profile");
  const profile = JSON.parse((await dialog.locator("pre").textContent())!);
  expect(profile.modeTokens.dark["--h-bg"]).toBe("#112233");
  expect(profile.modeTokens.light["--h-bg"]).toBe("#edf4fe");
  expect(profile.tokens["--h-bg"]).toBeUndefined();
  await page.keyboard.press("Escape");
  await page.addStyleTag({ content: vueCSS });
  await page.evaluate(() => {
    const root = document.createElement("section");
    root.id = "css-theme";
    root.dataset.hearthTheme = "custom";
    root.dataset.hearthMode = "system";
    const nested = document.createElement("section");
    nested.id = "css-theme-nested";
    nested.dataset.hearthTheme = "forest";
    nested.dataset.hearthMode = "light";
    root.append(nested);
    document.body.append(root);
  });
  const read = () =>
    page
      .locator("#css-theme")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--h-bg").trim());
  await expect.poll(read).toBe("#edf4fe");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect.poll(read).toBe("#112233");
  expect(
    await page
      .locator("#css-theme-nested")
      .evaluate((el) => getComputedStyle(el).getPropertyValue("--h-bg").trim()),
  ).toBe("#f3f7f2");
  await page.goto("/elements.html");
  await page.addStyleTag({ content: elementCSS });
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    theme.id = "exported-theme";
    theme.setAttribute("theme", "custom");
    theme.setAttribute("mode", "system");
    theme.innerHTML =
      '<hearth-theme id="nested-exported" theme="forest" mode="light">Nested island</hearth-theme>';
    document.body.append(theme);
  });
  const web = page
    .locator("hearth-theme#exported-theme")
    .locator(".h-theme")
    .first();
  await expect(web).toHaveCSS("background-color", "rgb(17, 34, 51)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(web).toHaveCSS("background-color", "rgb(237, 244, 254)");
  await expect(page.locator("hearth-theme#nested-exported .h-theme")).toHaveCSS(
    "background-color",
    "rgb(243, 247, 242)",
  );
});

test("modeTokens properties update across OS changes and clear stale overrides while legacy studio data is preserved", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.addInitScript(() =>
    localStorage.setItem(
      "hearth-playground",
      JSON.stringify({
        theme: "ocean",
        mode: "dark",
        tokens: { "--h-bg": "#102030", "--h-radius-card": "9px" },
      }),
    ),
  );
  await page.goto("/#themes");
  await expect(page.locator(".h-theme").first()).toHaveCSS(
    "background-color",
    "rgb(16, 32, 48)",
  );
  await page.getByLabel("Color mode", { exact: true }).selectOption("light");
  await expect(page.locator(".h-theme").first()).toHaveCSS(
    "background-color",
    "rgb(242, 247, 251)",
  );
  expect(
    await page.evaluate(
      () =>
        JSON.parse(localStorage.getItem("hearth-playground-v1")!).tokens[
          "--h-bg"
        ],
    ),
  ).toBe("#102030");
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const root = document.createElement("hearth-theme");
    root.id = "mode-property";
    Object.assign(root, {
      theme: "sunset",
      mode: "system",
      tokens: { "--h-radius-card": "9px" },
      modeTokens: {
        dark: { "--h-bg": "#102030", "--h-muted": "#cccccc" },
        light: { "--h-bg": "#fdfdfd" },
      },
    });
    document.body.append(root);
  });
  const root = page.locator("hearth-theme#mode-property"),
    base = root.locator(".h-theme");
  await expect(base).toHaveCSS("background-color", "rgb(16, 32, 48)");
  await page.emulateMedia({ colorScheme: "light" });
  await expect(base).toHaveCSS("background-color", "rgb(253, 253, 253)");
  expect(
    await base.evaluate((el) =>
      (el as HTMLElement).style.getPropertyValue("--h-muted"),
    ),
  ).toBe("");
  await root.evaluate((el) =>
    Object.assign(el, { modeTokens: { light: { "--h-bg": "#ffffff" } } }),
  );
  await expect(base).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(base).toHaveCSS("background-color", "rgb(11, 18, 32)");
});

test("Vue public primitives compose a compact form with hidden but accessible labels", async ({
  page,
}) => {
  await page.goto("/#examples");
  const form = page.getByRole("form", { name: "Foundation form" });
  const query = form.getByRole("searchbox", { name: "Find sessions" });
  await query.fill("hearth");
  await form.getByRole("button", { name: "Clear Find sessions" }).click();
  await expect(query).toHaveValue("");
  await expect(query).toBeFocused();
  await form
    .getByRole("combobox", { name: "Provider filter" })
    .selectOption("local");
  const project = form.getByRole("combobox", { name: "Project filter" });
  await project.fill("Hearth");
  await project.press("Enter");
  await form
    .getByRole("checkbox", { name: "Select foundation session" })
    .check();
  await form.getByRole("switch", { name: "Pinned sessions only" }).check();
  await form
    .getByRole("textbox", { name: "Session notes" })
    .fill("Accessible note");
  expect(
    await form.evaluate((el) =>
      Object.fromEntries(new FormData(el as HTMLFormElement)),
    ),
  ).toEqual({
    query: "",
    provider: "local",
    project: "hearth",
    selected: "on",
    pinned: "on",
    notes: "Accessible note",
  });
  await expect(form.locator(".h-sr-only:not([aria-live])")).toHaveCount(6);
  expect(
    Math.round(
      (await form.locator(".h-field-control").first().boundingBox())!.height,
    ),
  ).toBe(32);
  expect(
    Math.round((await form.locator(".h-checkbox").boundingBox())!.height),
  ).toBe(32);
  await expect(
    form
      .getByRole("button", { name: "Inspect foundation session" })
      .locator("path"),
  ).toHaveAttribute("d", "M4 7h16M4 12h10M4 17h16");
  await form
    .getByRole("button", { name: "Save preferences", exact: true })
    .click();
  await expect(form.getByRole("status")).toHaveText(
    "Preferences saved in this example.",
  );
});

test("web component slots, custom icons, hidden labels, clear events, and resets retain native form behavior", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const surface = document.createElement("hearth-surface");
    surface.id = "foundation-surface";
    Object.assign(surface, { as: "section", tone: "inset", padding: "sm" });
    const form = document.createElement("form");
    form.id = "foundation-web-form";
    const input = document.createElement("hearth-input");
    input.id = "foundation-search";
    Object.assign(input, {
      type: "search",
      label: "Search records",
      name: "query",
      value: "seed",
      hideLabel: true,
      size: "compact",
    });
    input.innerHTML =
      '<span slot="leading">Find</span><span slot="trailing">⌘ K</span>';
    input.addEventListener(
      "change",
      () => (form.dataset.onChange = String(new FormData(form).get("query"))),
    );
    form.append(input);
    for (const [tag, props] of [
      ["textarea", { label: "Record notes", name: "notes", value: "Note" }],
      [
        "select",
        {
          label: "Record filter",
          name: "filter",
          value: "all",
          options: [{ value: "all", label: "All" }],
        },
      ],
      [
        "combobox",
        {
          label: "Record project",
          name: "project",
          value: "hearth",
          options: [{ value: "hearth", label: "Hearth" }],
        },
      ],
      ["checkbox", { label: "Select record", name: "selected", checked: true }],
      ["switch", { label: "Pin record", name: "pinned", checked: true }],
    ] as [string, Record<string, unknown>][]) {
      const el = document.createElement(`hearth-${tag}`);
      Object.assign(el, { ...props, hideLabel: true, size: "compact" });
      form.append(el);
    }
    const button = document.createElement("hearth-button");
    button.id = "custom-icon";
    Object.assign(button, { iconOnly: true, label: "Custom action" });
    button.innerHTML =
      '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 3h18v18H3z"/></svg>';
    form.append(button);
    surface.append(form);
    document.querySelector("hearth-theme")!.append(surface);
  });
  const surface = page.locator("hearth-surface#foundation-surface"),
    form = page.locator("#foundation-web-form"),
    input = page.locator("hearth-input#foundation-search");
  await expect(surface.locator("section.h-surface")).toHaveCSS(
    "padding",
    "8px",
  );
  await expect(input.getByText("Find", { exact: true })).toBeVisible();
  await expect(input.getByText("⌘ K")).toBeVisible();
  for (const [role, name] of [
    ["searchbox", "Search records"],
    ["textbox", "Record notes"],
    ["combobox", "Record filter"],
    ["combobox", "Record project"],
    ["checkbox", "Select record"],
    ["switch", "Pin record"],
  ] as const)
    await expect(
      form.getByRole(role, { name, exact: true }),
    ).toHaveAccessibleName(name);
  await expect(page.locator("hearth-button#custom-icon svg")).toBeVisible();
  await input.getByRole("button", { name: "Clear Search records" }).click();
  await expect(form).toHaveAttribute("data-on-change", "");
  await expect(input.getByRole("searchbox")).toBeFocused();
  await form.evaluate((el) => (el as HTMLFormElement).reset());
  await expect(input.getByRole("searchbox")).toHaveValue("seed");
  expect(
    await form.evaluate((el) =>
      Object.fromEntries(new FormData(el as HTMLFormElement)),
    ),
  ).toEqual({
    query: "seed",
    notes: "Note",
    filter: "all",
    project: "hearth",
    selected: "on",
    pinned: "on",
  });
  await input.evaluate((el) => {
    el.querySelector("[slot=leading]")!.remove();
    const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("slot", "leading");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "18");
    icon.setAttribute("height", "18");
    el.append(icon);
  });
  await expect(input.locator("svg[slot=leading]")).toBeVisible();
});

test("compact controls keep touch targets and caption text respects the minimum token", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/#examples");
  const form = page.getByRole("form", { name: "Foundation form" });
  expect(
    (await form.locator(".h-checkbox").boundingBox())!.height,
  ).toBeGreaterThanOrEqual(44);
  expect(
    (await form.locator(".h-field-control").first().boundingBox())!.height,
  ).toBeGreaterThanOrEqual(44);
  await page
    .locator(".h-theme")
    .first()
    .evaluate((el) =>
      (el as HTMLElement).style.setProperty("--h-font-min-size", "14px"),
    );
  await expect(page.locator(".h-badge").first()).toHaveCSS("font-size", "14px");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await context.close();
});
