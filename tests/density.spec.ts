import { test, expect, type Page } from "@playwright/test";

async function fixture(page: Page) {
  await page.goto("/elements.html");
  await expect(
    page.getByRole("heading", { name: "Native HTML. Familiar components." }),
  ).toBeVisible();
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    theme.id = "density-preview";
    theme.style.cssText = "display:block;width:min(100%,480px)";
    theme.innerHTML = `<hearth-card title="Density preview"><form>
      <hearth-button id="density-button">Save</hearth-button>
      <hearth-button id="density-icon" icon-only icon="search" label="Search"></hearth-button>
      <hearth-input id="density-input" label="Workspace" name="workspace" value="Home" hide-label></hearth-input>
      <hearth-select id="density-select" label="Provider" hide-label></hearth-select>
      <hearth-combobox id="density-combo" label="Category" hide-label></hearth-combobox>
      <hearth-checkbox id="density-checkbox" label="Select row" hide-label></hearth-checkbox>
      <hearth-radio-group id="density-radio" label="Layout"></hearth-radio-group>
      <hearth-switch id="density-switch" label="Public page"></hearth-switch>
      <hearth-sidebar id="density-nav"></hearth-sidebar>
      <hearth-list><hearth-list-item id="density-list" title="Session" href="#session"></hearth-list-item></hearth-list>
      <hearth-data-table id="density-table" label="Records" selectable></hearth-data-table>
      <hearth-calendar id="density-calendar" month="2024-02"></hearth-calendar>
    </form></hearth-card>`;
    for (const id of ["density-select", "density-combo", "density-radio"])
      Object.assign(theme.querySelector(`#${id}`)!, {
        options: [{ value: "one", label: "First" }],
      });
    Object.assign(theme.querySelector("#density-nav")!, {
      items: [{ id: "overview", label: "Overview" }],
    });
    Object.assign(theme.querySelector("#density-table")!, {
      columns: [{ key: "name", label: "Name", sortable: true }],
      rows: [{ id: "one", name: "Home" }],
    });
    document.body.replaceChildren(theme);
  });
  await expect(
    page.locator("#density-button").getByRole("button", { name: "Save" }),
  ).toBeVisible();
}

const controlSelectors = [
  "#density-button .h-button",
  "#density-icon .h-button",
  "#density-checkbox .h-checkbox",
  "#density-radio .h-radio-option",
  "#density-switch .h-toggle",
  "#density-table .h-table-select label",
];
const fieldSelectors = [
  "#density-input .h-field-control",
  "#density-select select",
  "#density-combo .h-combo-control",
];

test("density levels resize real controls and rows without losing values, and legacy aliases match", async ({
  page,
}) => {
  await fixture(page);
  const field = page.getByRole("textbox", { name: "Workspace", exact: true });
  await field.fill("Keep this value");
  for (const [density, control, height] of [
    ["medium", 40, 40],
    ["low", 44, 44],
    ["high", 32, 34],
    ["comfortable", 44, 44],
    ["compact", 40, 40],
  ] as const) {
    await page
      .locator("hearth-theme#density-preview")
      .evaluate((el, value) => el.setAttribute("density", value), density);
    for (const selector of controlSelectors) {
      await expect
        .poll(
          async () =>
            (await page.locator(selector).first().boundingBox())!.height,
          `${density} ${selector}`,
        )
        .toBeCloseTo(control, 0);
    }
    for (const selector of fieldSelectors) {
      await expect
        .poll(
          async () => (await page.locator(selector).boundingBox())!.height,
          `${density} ${selector}`,
        )
        .toBeCloseTo(height, 0);
    }
    await expect(field).toHaveValue("Keep this value");
    expect(
      await page
        .locator("#density-preview form")
        .evaluate((el) => new FormData(el as HTMLFormElement).get("workspace")),
    ).toBe("Keep this value");
  }
  await page
    .locator("hearth-theme#density-preview")
    .evaluate((el) => el.setAttribute("density", "high"));
  expect(
    (await page.locator("#density-nav .h-navigation button").boundingBox())!
      .height,
  ).toBeLessThan(40);
  expect(
    (await page.locator("#density-list .h-list-body").boundingBox())!.height,
  ).toBeLessThan(40);
  expect(
    (await page
      .locator("#density-calendar .h-calendar-nav")
      .first()
      .boundingBox())!.height,
  ).toBe(32);
  await expect(page.locator("#density-input .h-field-control")).toHaveCSS(
    "border-radius",
    "6px",
  );
});

test("high density and explicit compact sizes retain touch targets across shadow roots", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  try {
    const page = await context.newPage();
    await fixture(page);
    await page
      .locator("hearth-theme#density-preview")
      .evaluate((el) => el.setAttribute("density", "high"));
    for (const selector of [
      ...controlSelectors,
      ...fieldSelectors,
      "#density-nav .h-navigation button",
      "#density-calendar .h-calendar-nav",
    ])
      expect(
        (await page.locator(selector).first().boundingBox())!.height,
        selector,
      ).toBeGreaterThanOrEqual(44);
    await page
      .locator("hearth-input#density-input")
      .evaluate((el) => el.setAttribute("size", "compact"));
    expect(
      (await page.locator("#density-input .h-field-control").boundingBox())!
        .height,
    ).toBeGreaterThanOrEqual(44);
    await page.getByRole("combobox", { name: "Category" }).click();
    expect(
      (await page
        .getByRole("button", { name: "Toggle Category options" })
        .boundingBox())!.height,
    ).toBeGreaterThanOrEqual(44);
  } finally {
    await context.close();
  }
});

test("all palettes share neutral main surfaces and tint only secondary surfaces in both modes", async ({
  page,
}) => {
  await fixture(page);
  const values: Record<
    string,
    {
      bg: string;
      surface: string;
      raised: string;
      panel: string;
      card: string;
    }[]
  > = { dark: [], light: [] };
  for (const mode of ["dark", "light"] as const) {
    for (const theme of ["sunset", "ocean", "forest", "dusk", "rose"]) {
      await page
        .locator("hearth-theme#density-preview")
        .evaluate((el, { theme, mode }) => Object.assign(el, { theme, mode }), {
          theme,
          mode,
        });
      await expect(
        page.locator("#density-preview .h-theme").first(),
      ).toHaveAttribute("data-hearth-theme", theme);
      values[mode].push(
        await page
          .locator("#density-preview .h-theme")
          .first()
          .evaluate((el) => {
            const css = getComputedStyle(el),
              probe = document.createElement("span");
            el.append(probe);
            const color = (key: string) => {
              probe.style.background = `var(${key})`;
              return getComputedStyle(probe).backgroundColor;
            };
            const result = {
              bg: color("--h-bg"),
              surface: color("--h-surface"),
              raised: color("--h-raised"),
              panel: color("--h-panel"),
              card: getComputedStyle(
                document
                  .querySelector("hearth-card")!
                  .shadowRoot!.querySelector(".h-surface")!,
              ).backgroundColor,
            };
            probe.remove();
            return result;
          }),
      );
    }
    expect(new Set(values[mode].map((v) => v.bg)).size).toBe(1);
    expect(new Set(values[mode].map((v) => v.surface)).size).toBe(1);
    for (const value of values[mode]) expect(value.card).toBe(value.surface);
    expect(new Set(values[mode].map((v) => v.raised)).size).toBe(5);
    expect(new Set(values[mode].map((v) => v.panel)).size).toBe(5);
  }
  expect(values.dark[0].bg).not.toBe(values.light[0].bg);
});

test("studio offers three densities, migrates legacy density, and exports neutral mode-aware defaults", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem(
      "hearth-playground",
      JSON.stringify({
        version: 2,
        theme: "rose",
        density: "comfortable",
        mode: "dark",
      }),
    ),
  );
  await page.goto("/#themes");
  const density = page.getByRole("combobox", { name: "Density", exact: true });
  await expect(density).toHaveValue("low");
  const input = page.getByRole("textbox", { name: "Your brand name" });
  await density.selectOption("high");
  await expect
    .poll(async () => (await input.boundingBox())!.height)
    .toBeCloseTo(32, 0);
  await expect(page.locator(".h-theme").first()).toHaveAttribute(
    "data-hearth-density",
    "high",
  );
  await page.getByRole("button", { name: "Export your theme" }).click();
  const code = await page.getByRole("dialog").locator("pre").innerText();
  expect(code).toContain("#101216");
  expect(code).toContain("#f5f6f8");
  expect(code).toContain('[data-hearth-mode="light"]');
  expect(code).toContain("color-mix(");
});
