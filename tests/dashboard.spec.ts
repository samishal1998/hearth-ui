import { test, expect } from "@playwright/test";

test("top-layer popovers, tooltip focus, menus, sheets, and command selection work across shadow roots", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/elements.html");
  await page.getByRole("button", { name: "Edit popover", exact: true }).click();
  const popover = page.getByRole("dialog", { name: "Popover controls" });
  await expect(popover).toBeVisible();
  await expect(page.getByLabel("Popover field", { exact: true })).toBeFocused();
  const box = await popover.boundingBox();
  expect(box!.x).toBeGreaterThanOrEqual(0);
  expect(box!.x + box!.width).toBeLessThanOrEqual(1440);
  await page.keyboard.press("Escape");
  await expect(popover).not.toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit popover", exact: true }),
  ).toBeFocused();
  const tipTrigger = page.getByRole("button", {
    name: "Custom tooltip trigger",
    exact: true,
  });
  await tipTrigger.focus();
  await expect(page.getByRole("tooltip")).toBeVisible();
  await expect(tipTrigger).toHaveAttribute(
    "aria-description",
    "Contextual help across shadow roots",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).not.toBeVisible();
  await expect(tipTrigger).not.toHaveAttribute("aria-description");
  await page
    .getByRole("button", { name: "Record actions", exact: true })
    .click();
  await expect(
    page.getByRole("menuitem", { name: "Edit record" }),
  ).toBeFocused();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("menuitem", { name: "Delete record" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#menu-result")).toHaveText("delete");
  await expect(page.getByRole("menu")).not.toBeVisible();
  await page.getByRole("button", { name: "Open sheet", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Record details" }),
  ).toBeVisible();
  await page.getByLabel("Sheet field", { exact: true }).fill("Edited");
  await page.keyboard.press("Escape");
  await expect(
    page.getByRole("dialog", { name: "Record details" }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Open command palette", exact: true })
    .click();
  const search = page.getByRole("combobox", {
    name: "Search commands",
    exact: true,
  });
  await expect(search).toBeFocused();
  await search.fill("settings");
  await search.press("Enter");
  await expect(page.locator("#command-result")).toHaveText("settings");
  await expect(
    page.getByRole("dialog", { name: "Command palette", exact: true }),
  ).not.toBeVisible();
  expect(errors).toEqual([]);
});

test("toast expiry pauses during hover and focus and resumes on leaving", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.getByRole("button", { name: "Show timed toast" }).click();
  const toast = page.locator("hearth-toaster").locator(".h-toast");
  await toast.hover();
  await page.waitForTimeout(650);
  await expect(toast).toBeVisible();
  await toast.getByRole("button", { name: "Dismiss notification" }).focus();
  await page.mouse.move(0, 0);
  await page.waitForTimeout(650);
  await expect(toast).toBeVisible();
  await page.getByRole("button", { name: "Show timed toast" }).focus();
  await expect(toast).not.toBeVisible({ timeout: 2000 });
});

test("data tables sort numeric columns, select pages, and preserve per-row slots", async ({
  page,
}) => {
  await page.goto("/elements.html");
  const table = page.getByRole("table", { name: "Records", exact: true });
  await expect(
    page.getByText("Custom cell content", { exact: true }),
  ).toBeVisible();
  await table
    .getByRole("checkbox", { name: "Select rows on this page" })
    .check();
  await expect(page.locator("#table-selection")).toHaveText('["alpha","beta"]');
  await table.getByRole("button", { name: "Sort by Port" }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Beta");
  await expect(
    table.getByRole("columnheader", { name: "Sort by Port" }),
  ).toHaveAttribute("aria-sort", "ascending");
  await table.getByRole("button", { name: "Sort by Port" }).click();
  await expect(table.locator("tbody tr").first()).toContainText("Alpha");
  const root = page.locator("hearth-data-table#records");
  await root.getByRole("button", { name: "Next page" }).click();
  await expect(table.locator("tbody tr")).toHaveCount(1);
  await expect(table.locator("tbody tr").first()).toContainText("Beta");
  await root.evaluate((el) => Object.assign(el, { rows: [], loading: true }));
  await expect(
    root.getByRole("status", { name: "Loading table rows" }),
  ).toBeVisible();
  await root.evaluate((el) => Object.assign(el, { loading: false }));
  await expect(table).toContainText("No items to display.");
});

test("file controls submit actual files, reject invalid batches, and reset with native dates and segments", async ({
  page,
}) => {
  await page.goto("/elements.html");
  const input = page.getByLabel("Configuration files", { exact: true });
  await page.getByRole("button", { name: "Submit files" }).click();
  await expect(page.locator("#files-result")).toHaveText("Not submitted");
  await input.setInputFiles([
    {
      name: "config.json",
      mimeType: "application/json",
      buffer: Buffer.from("{}"),
    },
    {
      name: "other.json",
      mimeType: "application/json",
      buffer: Buffer.from('{"ok":true}'),
    },
  ]);
  await page.getByRole("radio", { name: "List view", exact: true }).check();
  await page.getByLabel("Schedule date", { exact: true }).fill("2026-09-19");
  await page.getByLabel("Schedule time", { exact: true }).fill("12:30");
  await page
    .getByLabel("Local timestamp", { exact: true })
    .fill("2026-09-19T12:30");
  await page.getByRole("button", { name: "Submit files" }).click();
  const result = JSON.parse(
    (await page.locator("#files-result").textContent())!,
  );
  expect(result.files).toEqual(["config.json", "other.json"]);
  expect(result.view).toBe("list");
  expect(result.date).toBe("2026-09-19");
  expect(result.time).toBe("12:30");
  expect(result.timestamp).toBe("2026-09-19T12:30");
  await input.setInputFiles({
    name: "bad.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("bad"),
  });
  await expect(page.getByText(/bad.txt: This file type/)).toBeVisible();
  expect(await input.evaluate((el: HTMLInputElement) => el.files!.length)).toBe(
    0,
  );
  await input.setInputFiles({
    name: "large.json",
    mimeType: "application/json",
    buffer: Buffer.alloc(1025),
  });
  await expect(page.getByText(/large.json: File exceeds/)).toBeVisible();
  await input.setInputFiles({
    name: "good.json",
    mimeType: "application/json",
    buffer: Buffer.from("{}"),
  });
  await page.getByRole("button", { name: "Toggle file fieldset" }).click();
  await expect(input).toBeDisabled();
  expect(
    await page
      .locator("#files-form")
      .evaluate((el) => [...new FormData(el as HTMLFormElement)]),
  ).toEqual([]);
  await page.getByRole("button", { name: "Toggle file fieldset" }).click();
  await page.getByRole("button", { name: "Reset files" }).click();
  expect(await input.evaluate((el: HTMLInputElement) => el.files!.length)).toBe(
    0,
  );
  await expect(
    page.getByRole("button", { name: "Remove good.json" }),
  ).not.toBeVisible();
  await expect(page.getByRole("radio", { name: "Grid view" })).toBeChecked();
});

test("code, copy fields, bounded logs, sparklines, and forwarded resource slots render correctly", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/elements.html");
  const code = page.locator("hearth-code-block#code");
  await expect(code.locator("script")).toHaveCount(0);
  await code.getByRole("button", { name: "Copy code" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'echo "<script>escaped</script>"\nsecond line',
  );
  const secret = page
    .locator("hearth-copy-field")
    .filter({ has: page.getByLabel("Secret example", { exact: true }) });
  await expect(
    page.getByLabel("Secret example", { exact: true }),
  ).toHaveAttribute("type", "password");
  await secret.getByRole("button", { name: "Reveal value" }).click();
  await expect(
    page.getByLabel("Secret example", { exact: true }),
  ).toHaveAttribute("type", "text");
  const log = page.getByRole("log", { name: "Fixture logs" });
  await expect(log.locator(".h-log-line")).toHaveCount(20);
  await expect(log).not.toContainText("Entry 0");
  await log.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await expect(
    page.getByRole("button", { name: "Resume follow" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Append fixture log" }).click();
  expect(await log.evaluate((el) => el.scrollTop)).toBe(0);
  await page.getByRole("button", { name: "Resume follow" }).click();
  await expect
    .poll(() => log.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
  await page.getByLabel("Search logs", { exact: true }).fill("New tail");
  await expect(log.locator(".h-log-line")).toHaveCount(1);
  const spark = page.locator("hearth-sparkline#trend");
  await expect(spark.locator("polyline")).toHaveAttribute(
    "points",
    /4,24.*156,24/,
  );
  await spark.evaluate((el) =>
    Object.assign(el, { values: [Number.NaN, Number.POSITIVE_INFINITY] }),
  );
  await expect(spark.locator("polyline")).toHaveCount(0);
  await expect(
    page.getByText("Forwarded overview slot.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Resource logs" }).click();
  await expect(
    page.getByText("Forwarded logs slot.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Forwarded overview slot.", { exact: true }),
  ).not.toBeVisible();
});

test("Vue page recipes expose settings, provider, status, error, and setup behavior", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#recipes");
  await expect(
    page.getByRole("heading", {
      name: "A good starting point, already assembled.",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Preview settings page" }).click();
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true }),
  ).toBeDisabled();
  await page.getByLabel("Workspace name", { exact: true }).fill("Changed");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Save changes", exact: true }),
  ).toBeDisabled();
  await page.goto("/#recipe-provider");
  await page.getByLabel(/^Provider name/).fill("Local service");
  await page.getByLabel(/^Endpoint/).fill("https://example.com");
  await page.getByRole("button", { name: "Test connection" }).click();
  await expect(
    page.getByText("Provider · Connected", { exact: true }),
  ).toBeVisible();
  await page.goto("/#recipe-status");
  await expect(
    page.getByText("Service maintenance", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Incident updates" }),
  ).toBeVisible();
  await page.goto("/#recipe-error");
  await page.getByRole("radio", { name: "503", exact: true }).check();
  await expect(
    page.getByRole("heading", { name: "A little pause." }),
  ).toBeVisible();
  await page.goto("/#recipe-setup");
  await page.getByLabel(/^Owner username/).fill("demo");
  await page.getByLabel(/^Owner password/).fill("not-a-real-password");
  await page.getByRole("button", { name: "Create owner account" }).click();
  await page.getByLabel(/^Provider name/).fill("Service");
  await page.getByLabel(/^Endpoint/).fill("https://example.com");
  await page.getByRole("button", { name: "Save provider" }).click();
  await expect(
    page.getByRole("heading", { name: "A new place to call home." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open your workspace" }).click();
  await expect(
    page.getByText("Setup demo complete. No account or provider was created."),
  ).toBeVisible();
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "not-a-real-password",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});
