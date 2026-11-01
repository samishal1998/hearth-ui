import { test, expect } from "@playwright/test";

test("technical hub includes the new collection with one page heading, section navigation, and API references", async ({
  page,
}) => {
  await page.goto("/#technical");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Tools for technical interfaces.",
  );
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
  const nav = page.getByRole("navigation", {
    name: "Technical sections",
    exact: true,
  });
  await expect(nav.getByRole("button")).toHaveCount(7);
  for (const selector of [
    ".h-heatmap",
    ".h-uptime-history",
    ".h-meter",
    ".h-tag-input",
    ".h-inline-copy",
    ".h-attachment",
    ".h-flow",
    ".h-span-timeline",
    ".h-trace-view",
    ".h-message-scroller",
    ".h-json-viewer",
    ".h-code-diff",
    ".h-waffle-grid",
    ".h-donut-plot",
    ".h-waterfall-chart",
    ".h-time-series",
  ])
    await expect(
      page.locator(".technical-examples").locator(selector).first(),
      selector,
    ).toBeVisible();
  const reference = page.getByRole("link", {
    name: "HTimeSeriesChart",
    exact: true,
  });
  await expect(reference).toHaveAttribute(
    "href",
    "#components/HTimeSeriesChart",
  );
  await reference.click();
  await expect(page).toHaveURL(/#components\/HTimeSeriesChart$/);
});

test("section jumps retain demo state and keep focused headings clear of the sticky navigation", async ({
  page,
}) => {
  await page.goto("/#technical");
  const nav = page.getByRole("navigation", {
    name: "Technical sections",
    exact: true,
  });
  await nav
    .getByRole("button", { name: "Data & artifacts", exact: true })
    .click();
  const heading = page.getByRole("heading", {
    name: "Data & artifacts",
    level: 2,
  });
  await expect(heading).toBeFocused();
  const headingBox = (await heading.boundingBox())!,
    navBox = (await nav.boundingBox())!;
  expect(headingBox.y).toBeGreaterThanOrEqual(navBox.y + navBox.height);
  await expect(page).toHaveURL(/#technical$/);
  const form = page.getByRole("form", { name: "Allowed hosts", exact: true });
  await form
    .getByRole("textbox", { name: "Allowed hosts", exact: true })
    .fill("test.internal");
  await page.keyboard.press("Enter");
  await nav
    .getByRole("button", { name: "Signals & amounts", exact: true })
    .click();
  const duration = page.getByRole("figure", {
    name: "Duration by interval",
    exact: true,
  });
  await duration.locator("[part=column]").first().click();
  const signed = page.getByRole("figure", {
    name: "Throughput change",
    exact: true,
  });
  await signed.locator("[part=column]").first().click();
  await expect(duration.locator("[part=column]").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(signed.locator("[part=column]").first()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await nav
    .getByRole("button", { name: "Data & artifacts", exact: true })
    .click();
  await expect(
    form.getByRole("button", { name: "Remove test.internal" }),
  ).toBeVisible();
  await nav
    .getByRole("button", { name: "Interaction lab", exact: true })
    .click();
  const reset = page.getByRole("button", { name: "Reset state", exact: true });
  await reset.focus();
  await page.keyboard.press("Control+Enter");
  await expect(
    page.getByRole("button", { name: "Run build", exact: true }),
  ).toBeDisabled();
  await reset.click();
  await page
    .getByRole("button", { name: "Workspace actions", exact: true })
    .click();
  await page.getByRole("menuitem", { name: "View logs", exact: true }).click();
  await expect(page.locator(".technical-event")).toHaveText(
    "Selected action: logs",
  );
});

test("technical navigation and grouped examples fit a 320px viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/#technical");
  const nav = page.getByRole("navigation", {
    name: "Technical sections",
    exact: true,
  });
  for (const label of [
    "Observability",
    "Workflows & traces",
    "Data & artifacts",
    "Chart variants",
    "Interaction lab",
  ]) {
    await nav.getByRole("button", { name: label, exact: true }).click();
    await expect(
      page.getByRole("heading", { name: label, level: 2 }),
    ).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page).toHaveURL(/#technical$/);
});
