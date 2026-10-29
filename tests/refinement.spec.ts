import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("code examples switch and copy in Vue and native custom elements", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#technical");
  const snippet = page.locator(".technical-grid .h-code-snippet").first();
  await snippet.getByRole("tab", { name: "cURL", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    snippet.getByRole("tab", { name: "JavaScript", exact: true }),
  ).toBeFocused();
  await expect(
    snippet.getByRole("tabpanel", { name: "JavaScript" }),
  ).toContainText("await fetch");
  await snippet.getByRole("button", { name: "Copy code", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain(
    "await fetch",
  );
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    theme.id = "new-components";
    const code = document.createElement("hearth-code-snippet");
    code.id = "code-options";
    Object.assign(code, {
      label: "Framework example",
      options: [
        { id: "vue", label: "Vue", code: "<script>escaped</script>" },
        { id: "skip", label: "Unavailable", code: "no", disabled: true },
        { id: "html", label: "HTML", code: "<main>Hello</main>" },
      ],
    });
    const install = document.createElement("hearth-package-install");
    install.id = "installer";
    Object.assign(install, { packages: ["@hearth-ui/vue", "vue"], dev: true });
    theme.append(code, install);
    document.body.append(theme);
  });
  const code = page.locator("hearth-code-snippet#code-options");
  await expect(
    code.getByRole("tabpanel", { name: "Vue", exact: true }),
  ).toContainText("<script>escaped</script>");
  await expect(code.locator("script")).toHaveCount(0);
  await code.getByRole("tab", { name: "Vue", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    code.getByRole("tab", { name: "HTML", exact: true }),
  ).toBeFocused();
  await code.getByRole("button", { name: "Copy code", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "<main>Hello</main>",
  );
  const install = page.locator("hearth-package-install#installer");
  await install.getByRole("tab", { name: "pnpm", exact: true }).click();
  await install.getByRole("button", { name: "Copy code", exact: true }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "pnpm add -D @hearth-ui/vue vue",
  );
});

test("HTML diagrams expose keyboard data, normalized stacks, live updates, and bounded invalid data", async ({
  page,
}) => {
  await page.goto("/#technical");
  const chart = page.getByRole("figure", {
    name: "Duration by interval",
    exact: true,
  });
  const baselines = await chart
    .locator(".h-diagram-segment")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().bottom),
    );
  expect(Math.max(...baselines) - Math.min(...baselines)).toBeLessThan(1);
  await chart.getByRole("button").first().focus();
  await page.keyboard.press("End");
  await expect(chart.getByRole("button").last()).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(chart.getByRole("button").last()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  const stacked = page.getByRole("figure", {
    name: "Request outcomes",
    exact: true,
  });
  await stacked.locator("summary").click();
  await expect(stacked.getByRole("table")).toContainText("%");
  const before = await stacked
    .getByRole("button")
    .last()
    .getAttribute("aria-label");
  await page
    .getByRole("button", { name: "Next interval", exact: true })
    .click();
  await expect(stacked.getByRole("button").last()).not.toHaveAttribute(
    "aria-label",
    before!,
  );
  await expect(stacked.locator("svg,canvas")).toHaveCount(0);
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const host = document.createElement("hearth-stacked-bar-chart");
    host.id = "chart-test";
    Object.assign(host, {
      label: "Traffic",
      series: [
        { id: "ok", label: "OK" },
        { id: "bad", label: "Failed" },
      ],
      columns: [
        { id: "a", label: "A", values: { ok: 3, bad: 1 } },
        { id: "b", label: "Empty", values: { ok: -4, bad: NaN } },
        { id: "c", label: "Large", values: { ok: 1e300, bad: 1e300 } },
      ],
    });
    document.querySelector("hearth-theme")!.append(host);
  });
  const native = page.locator("hearth-stacked-bar-chart#chart-test");
  await expect(native.getByRole("button").first()).toHaveAccessibleName(
    "A: OK 3 (75.0%), Failed 1 (25.0%)",
  );
  await expect(native.getByRole("button").nth(1)).toHaveAccessibleName(
    "Empty: OK 0 (0.0%), Failed 0 (0.0%)",
  );
  for (const segment of await native
    .getByRole("button")
    .nth(1)
    .locator(".h-diagram-segment")
    .all())
    await expect(segment).not.toBeVisible();
  const heights = await native
    .locator(".h-diagram-column")
    .last()
    .locator(".h-diagram-segment")
    .evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).style.height),
    );
  expect(heights).toEqual(["50%", "50%"]);
});

test("motion remains interruptible and reduced motion stops signal animation and press transforms", async ({
  page,
}) => {
  await page.goto("/#technical");
  const disclosure = page.locator(".technical-grid .h-collapsible");
  await disclosure.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await page.keyboard.press("Space");
  await expect(disclosure).not.toHaveAttribute("open");
  const wave = page.getByRole("figure", {
    name: "Microphone activity",
    exact: true,
  });
  await wave.getByRole("button", { name: "Resume animation" }).click();
  await expect(wave.locator("[part=bar]").first()).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await wave.getByRole("button", { name: "Pause animation" }).click();
  await expect(wave.locator("[part=bar]").first()).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await wave.getByRole("button", { name: "Resume animation" }).click();
  await expect(wave.locator("[part=bar]").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  const button = page.getByRole("button", { name: "Run build", exact: true });
  await button.hover();
  await page.mouse.down();
  await expect(button).toHaveCSS("transform", "none");
  await page.mouse.up();
  await expect(button).toBeDisabled();
  await expect(button).toHaveAccessibleName("Run build");
});

test("long strings and oversized slotted content stay inside table viewport in either direction", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const wrapper = document.createElement("div");
    wrapper.id = "table-boundary";
    wrapper.style.cssText =
      "width:420px;max-width:100%;display:grid;grid-template-columns:minmax(0,1fr)";
    const table = document.createElement("hearth-data-table");
    table.id = "stress-table";
    Object.assign(table, {
      label: "Long content",
      mobileLayout: "scroll",
      columns: [
        { key: "name", label: "Name".repeat(30) },
        { key: "content", label: "Content" },
      ],
      rows: [{ id: "one", name: "x".repeat(500), content: "y".repeat(1000) }],
      actions: [{ id: "inspect", label: "Inspect" }],
    });
    table.innerHTML =
      '<div slot="cell:one:content"><pre style="width:1200px">Oversized technical output</pre></div>';
    wrapper.append(table);
    document.querySelector("hearth-theme")!.append(wrapper);
  });
  for (const direction of ["ltr", "rtl"]) {
    await page
      .locator("#table-boundary")
      .evaluate((el, dir) => el.setAttribute("dir", dir), direction);
    const boundary = await page.locator("#table-boundary").boundingBox();
    const table = await page
      .locator("hearth-data-table#stress-table table")
      .boundingBox();
    expect(table!.width).toBeLessThanOrEqual(boundary!.width + 1);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await expect(
      page
        .locator("hearth-data-table#stress-table")
        .getByRole("button", { name: "Actions for one" }),
    ).toBeVisible();
  }
  await page.setViewportSize({ width: 320, height: 740 });
  await page
    .locator("hearth-data-table#stress-table")
    .evaluate((el) => Object.assign(el, { mobileLayout: "cards" }));
  await expect(
    page.locator("hearth-data-table#stress-table .h-data-table"),
  ).toHaveClass(/cards/);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("gallery keeps navigation, framework code, and constrained previews usable at small widths", async ({
  page,
}) => {
  await page.goto("/#components/HCodeSnippet");
  await expect(
    page.getByRole("navigation", { name: "Components", exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Code", exact: true }).click();
  await page.getByRole("tab", { name: "Web components", exact: true }).click();
  await expect(
    page.getByRole("tabpanel", { name: "Web components", exact: true }),
  ).toContainText("registerElements");
  await page.getByRole("tab", { name: "Preview", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Preview frame width" })
    .selectOption("360px");
  await expect
    .poll(
      async () =>
        (await page.locator(".registry-preview").boundingBox())!.width,
    )
    .toBeLessThanOrEqual(360);
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page
    .getByRole("button", { name: "Browse components", exact: true })
    .click();
  await page
    .getByRole("navigation", { name: "Components", exact: true })
    .getByRole("link", { name: "Waveform", exact: true })
    .click();
  await expect(page).toHaveURL(/#components\/HWaveform$/);
});

test("developer showcase and gallery meet automated core accessibility checks in both modes", async ({
  page,
}) => {
  for (const mode of ["dark", "light"]) {
    await page.goto("/#technical");
    await page
      .locator(".h-theme")
      .first()
      .evaluate((el, mode) => el.setAttribute("data-hearth-mode", mode), mode);
    const result = await new AxeBuilder({ page })
      .include(".technical-examples")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
    ).toEqual([]);
  }
  await page.goto("/#components/HCodeSnippet");
  const result = await new AxeBuilder({ page })
    .include(".registry")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      count: v.nodes.length,
      nodes: v.nodes
        .slice(0, 3)
        .map((n) => ({ target: n.target, summary: n.failureSummary })),
    })),
  ).toEqual([]);
});

test("native controls keep names, roles, focus indicators and expanded state across shadow roots", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const host = document.createElement("hearth-theme");
    host.id = "aria-fixture";
    host.innerHTML =
      '<hearth-button label="Inspect resource" icon="search" icon-only></hearth-button><hearth-collapsible label="More settings"><hearth-input label="Nested setting"></hearth-input></hearth-collapsible><hearth-combobox label="Environment"></hearth-combobox><hearth-dropdown-menu label="More actions"></hearth-dropdown-menu><hearth-waveform label="Signal"></hearth-waveform>';
    Object.assign(host.querySelector("hearth-combobox")!, {
      options: [
        { value: "prod", label: "Production" },
        { value: "dev", label: "Development" },
      ],
    });
    Object.assign(host.querySelector("hearth-dropdown-menu")!, {
      items: [
        { id: "first", label: "Archive" },
        { id: "second", label: "Inspect" },
      ],
    });
    document.body.replaceChildren(host);
  });
  const inspect = page.getByRole("button", {
    name: "Inspect resource",
    exact: true,
  });
  await inspect.focus();
  await expect(inspect).toBeFocused();
  expect(
    await inspect.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  const combo = page.getByRole("combobox", { name: "Environment" });
  await expect(page.locator("hearth-combobox .h-combo-anchor")).toHaveCSS(
    "opacity",
    "1",
  );
  await combo.focus();
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(combo).toHaveAttribute("aria-expanded", "false");
  const actions = page.getByRole("button", {
    name: "More actions",
    exact: true,
  });
  await actions.focus();
  await page.keyboard.press("ArrowDown");
  await expect(actions).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("i");
  await expect(page.getByRole("menuitem", { name: "Inspect" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(actions).toBeFocused();
  await page.emulateMedia({ forcedColors: "active" });
  expect(
    await actions.evaluate((el) => getComputedStyle(el).outlineStyle),
  ).toBe("solid");
  await page.emulateMedia({ forcedColors: "none", reducedMotion: "reduce" });
  const result = await new AxeBuilder({ page })
    .include("hearth-theme#aria-fixture")
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(
    result.violations.map((v) => ({
      id: v.id,
      nodes: v.nodes.map((n) => n.target),
    })),
  ).toEqual([]);
});

test("action and error notifications remain available instead of timing out", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const host = document.createElement("hearth-theme");
    host.id = "persistent-toasts";
    host.innerHTML =
      '<hearth-toast title="Could not save" tone="danger" duration="50"></hearth-toast><hearth-toast title="Workspace removed" action-label="Undo" duration="50"></hearth-toast>';
    for (const toast of host.children)
      toast.addEventListener("dismiss", () =>
        toast.setAttribute("data-dismissed", "true"),
      );
    document.body.append(host);
  });
  await page.waitForTimeout(150);
  await expect(
    page.locator("#persistent-toasts hearth-toast[data-dismissed]"),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await page
    .locator("hearth-toast")
    .filter({ has: page.getByText("Could not save", { exact: true }) })
    .getByRole("button", { name: "Dismiss notification" })
    .click();
  await expect(
    page.locator("#persistent-toasts hearth-toast[data-dismissed]"),
  ).toHaveCount(1);
});
