import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("signed percentage bars share a zero center and fixed scale, with narrow strokes and exact values", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    const chart = document.createElement("hearth-diverging-bar-chart");
    chart.id = "signed-chart";
    Object.assign(chart, {
      label: "Signed samples",
      items: [100, 50, 0, -50, -100, 175, -240, NaN].map((value, index) => ({
        id: String(index),
        label: `Point ${index}`,
        value,
      })),
    });
    theme.append(chart);
    document.body.replaceChildren(theme);
  });
  const chart = page.locator("hearth-diverging-bar-chart#signed-chart");
  const buttons = chart.getByRole("button");
  await expect(buttons).toHaveCount(8);
  await expect(buttons.nth(1)).toHaveAccessibleName("Point 1: +50%");
  await expect(buttons.nth(3)).toHaveAccessibleName("Point 3: -50%");
  await expect(buttons.nth(5)).toHaveAccessibleName(
    "Point 5: +175% (bar capped at ±100%)",
  );
  await expect(buttons.nth(6)).toHaveAccessibleName(
    "Point 6: -240% (bar capped at ±100%)",
  );
  await expect(buttons.nth(7)).toHaveAccessibleName("Point 7: 0%");
  const plot = (await chart.locator(".h-diagram-bars").boundingBox())!;
  expect(plot.height).toBe(96);
  for (const [index, fraction, direction] of [
    [0, 0.5, 1],
    [1, 0.25, 1],
    [3, 0.25, -1],
    [4, 0.5, -1],
    [5, 0.5, 1],
    [6, 0.5, -1],
  ]) {
    const bar = (await buttons
      .nth(index)
      .locator("[part=segment]")
      .boundingBox())!;
    expect(bar.width).toBe(6);
    expect(bar.height).toBeCloseTo(plot.height * fraction, 1);
    expect(direction > 0 ? bar.y + bar.height : bar.y).toBeCloseTo(
      plot.y + plot.height / 2,
      1,
    );
    expect(
      (await buttons.nth(index).boundingBox())!.width,
    ).toBeGreaterThanOrEqual(24);
  }
  await expect(buttons.nth(2).locator("[part=segment]")).not.toBeVisible();
  await expect(buttons.nth(7).locator("[part=segment]")).not.toBeVisible();
  await chart.locator("summary").click();
  await expect(chart.getByRole("table")).toContainText("+175%");
  await expect(chart.getByRole("table")).toContainText("-240%");
  await expect(chart.locator("svg,canvas")).toHaveCount(0);
  await chart.evaluate((el) =>
    Object.assign(el, { items: [{ id: "1", label: "Point 1", value: 50 }] }),
  );
  expect(
    (await chart.locator("[part=segment]").boundingBox())!.height,
  ).toBeCloseTo(24, 1);
  await chart.getByRole("button").focus();
  await chart.evaluate((el) =>
    Object.assign(el, { items: [{ id: "1", label: "Point 1", value: -50 }] }),
  );
  await expect(chart.getByRole("button")).toBeFocused();
  await expect(chart.getByRole("button")).toHaveAccessibleName("Point 1: -50%");
  const updated = (await chart.locator("[part=segment]").boundingBox())!;
  const updatedPlot = (await chart.locator(".h-diagram-bars").boundingBox())!;
  expect(updated.y).toBeCloseTo(updatedPlot.y + updatedPlot.height / 2, 1);
  expect(updated.height).toBeCloseTo(24, 1);
});

test("signed chart supports keyboard inspection, selection, live sign changes, RTL and reduced motion", async ({
  page,
}) => {
  await page.goto("/#technical");
  const chart = page.getByRole("figure", {
    name: "Throughput change",
    exact: true,
  });
  const points = chart.getByRole("button");
  await points.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(points.nth(1)).toBeFocused();
  await expect(chart.locator("[part=tooltip]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(chart.locator("[part=tooltip]")).not.toBeVisible();
  await page.keyboard.press("Enter");
  await expect(points.nth(1)).toHaveAttribute("aria-pressed", "true");
  const before = await points.nth(1).getAttribute("aria-label");
  await page
    .getByRole("button", { name: "Update changes", exact: true })
    .click();
  await expect(points.nth(1)).not.toHaveAttribute("aria-label", before!);
  await expect(points.nth(1)).toHaveAttribute("aria-pressed", "true");
  await chart.evaluate((el) => el.setAttribute("dir", "rtl"));
  await points.first().focus();
  await page.keyboard.press("ArrowLeft");
  await expect(points.nth(1)).toBeFocused();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(points.first().locator("[part=segment]")).toHaveCSS(
    "transition-duration",
    "0s",
  );
});

test("signed charts keep slim bars and touch targets in narrow containers, and pass core accessibility checks", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/#components/HDivergingBarChart");
    const chart = page.locator(".registry-preview hearth-diverging-bar-chart");
    await expect(chart).toBeVisible();
    const points = chart.getByRole("button");
    expect((await points.first().boundingBox())!.width).toBeGreaterThanOrEqual(
      44,
    );
    expect(
      (await points.first().locator("[part=segment]").boundingBox())!.width,
    ).toBe(6);
    expect(
      await chart
        .locator("[part=viewport]")
        .evaluate((el) => el.scrollWidth > el.clientWidth),
    ).toBe(true);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await points.last().focus();
    await page.keyboard.press("Enter");
    await expect(points.last()).toHaveAttribute("aria-pressed", "true");
    for (const mode of ["dark", "light"]) {
      await page
        .locator(".h-theme")
        .first()
        .evaluate(
          (el, mode) => el.setAttribute("data-hearth-mode", mode),
          mode,
        );
      const result = await new AxeBuilder({ page })
        .include(".registry-preview")
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(
        result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      ).toEqual([]);
    }
  } finally {
    await context.close();
  }
});
