import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Vue tag input commits and deduplicates values, preserves rejected drafts, submits and resets", async ({
  page,
}) => {
  await page.goto("/#operations");
  const form = page.getByRole("form", { name: "Allowed hosts", exact: true }),
    input = form.getByRole("textbox", { name: "Allowed hosts", exact: true });
  await input.fill("cache.internal");
  await input.press("Enter");
  await input.fill("cache.internal");
  await input.press("Enter");
  await expect(
    form.getByRole("button", { name: "Remove cache.internal" }),
  ).toHaveCount(1);
  await input.evaluate((el) => {
    const transfer = new DataTransfer();
    transfer.setData("text", "worker.internal,bad host");
    el.dispatchEvent(
      new ClipboardEvent("paste", {
        clipboardData: transfer,
        bubbles: true,
        cancelable: true,
      }),
    );
  });
  await expect(input).toHaveValue("bad host");
  await expect(form.getByRole("alert")).toContainText("Use letters");
  await input.fill("queue.internal");
  await input.dispatchEvent("keydown", { key: "Enter", isComposing: true });
  await expect(input).toHaveValue("queue.internal");
  await input.press("Enter");
  await form.getByRole("button", { name: "Save hosts" }).click();
  await expect(form.getByRole("status")).toContainText(
    "api.internal, cache.internal, worker.internal, queue.internal",
  );
  await form.getByRole("button", { name: "Reset hosts" }).click();
  await expect(form.getByRole("button", { name: /Remove / })).toHaveCount(1);
  await expect(input).toHaveValue("");
});

test("custom-element tags retain repeated FormData, required validity, reset, and disabled fieldsets", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "tags-form";
    const fieldset = document.createElement("fieldset");
    fieldset.id = "tags-fieldset";
    const field = document.createElement("hearth-tag-input");
    field.id = "tags";
    Object.assign(field, {
      label: "Tags",
      name: "tags",
      value: ["one"],
      required: true,
      maxTags: 3,
    });
    fieldset.append(field);
    form.append(fieldset);
    document.querySelector("hearth-theme")!.append(form);
  });
  const field = page.locator("hearth-tag-input#tags"),
    input = field.getByRole("textbox", { name: "Tags" });
  await input.fill("two,three");
  await input.press("Enter");
  expect(
    await page
      .locator("#tags-form")
      .evaluate((el) => new FormData(el as HTMLFormElement).getAll("tags")),
  ).toEqual(["one", "two", "three"]);
  await page
    .locator("#tags-fieldset")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = true));
  await expect(input).toBeDisabled();
  expect(
    await page
      .locator("#tags-form")
      .evaluate((el) => new FormData(el as HTMLFormElement).getAll("tags")),
  ).toEqual([]);
  await page
    .locator("#tags-fieldset")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = false));
  await page
    .locator("#tags-form")
    .evaluate((el) => (el as HTMLFormElement).reset());
  await expect(field.getByRole("button", { name: /Remove / })).toHaveCount(1);
  await field.getByRole("button", { name: "Remove one" }).click();
  expect(
    await field.evaluate((el) =>
      (el as HTMLElement & { checkValidity(): boolean }).checkValidity(),
    ),
  ).toBe(false);
  await input.fill("pending");
  expect(
    await field.evaluate((el) =>
      (el as HTMLElement & { checkValidity(): boolean }).checkValidity(),
    ),
  ).toBe(false);
  await input.press("Enter");
  expect(
    await field.evaluate((el) =>
      (el as HTMLElement & { checkValidity(): boolean }).checkValidity(),
    ),
  ).toBe(true);
});

test("heatmap matrix navigation, missing data, quota semantics and uptime coverage remain inspectable", async ({
  page,
}) => {
  await page.goto("/#operations");
  const heatmap = page.getByRole("figure", {
    name: "Request activity",
    exact: true,
  });
  await heatmap.getByRole("button").first().focus();
  await page.keyboard.press("ArrowDown");
  await expect(heatmap.getByRole("button").nth(6)).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(heatmap.getByRole("button").nth(6)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    heatmap.getByRole("button", { name: "Cache, 11:00: No data" }),
  ).toBeVisible();
  const meter = page.getByRole("meter", { name: "Storage used" });
  await expect(meter).toHaveAttribute("value", "76");
  await expect(meter).toHaveAttribute("high", "90");
  await expect(
    page.getByRole("figure", { name: "API availability", exact: true }),
  ).toContainText("81.82% up during recorded time");
  await expect(
    page.getByRole("figure", { name: "API availability", exact: true }),
  ).toContainText("8.3% unknown coverage");
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const el = document.createElement("hearth-uptime-history");
    el.id = "overlap";
    Object.assign(el, {
      label: "Overlap",
      intervals: [
        { id: "a", label: "A", start: 0, end: 20, status: "up" },
        { id: "b", label: "B", start: 10, end: 30, status: "down" },
      ],
    });
    document.querySelector("hearth-theme")!.append(el);
  });
  await expect(page.locator("hearth-uptime-history#overlap")).toContainText(
    "Intervals overlap",
  );
});

test("workflow branches, nested traces and timing spans work with native controls and narrow containers", async ({
  page,
}) => {
  await page.goto("/#operations");
  const flow = page.getByRole("figure", {
    name: "Build workflow",
    exact: true,
  });
  await expect(
    flow.getByRole("group", { name: "Parallel checks parallel branches" }),
  ).toBeVisible();
  await flow.getByRole("button", { name: /Browser checks/ }).click();
  await expect(
    flow.getByRole("button", { name: /Browser checks/ }),
  ).toHaveAttribute("aria-pressed", "true");
  const trace = page.getByRole("region", {
    name: "Agent execution",
    exact: true,
  });
  await trace.getByText("Search repository", { exact: true }).click();
  await expect(trace.getByText("src/config.ts", { exact: true })).toBeVisible();
  const timeline = page.getByRole("figure", {
    name: "Request timing",
    exact: true,
  });
  await timeline.getByRole("button", { name: /Database query:/ }).click();
  await expect(
    timeline.getByRole("button", { name: /Database query:/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("JSON inspection preserves escaped paths, avoids render-time getters, and bounds recursive values", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const value: any = { "a/b": { "~key": 17 } };
    value.self = value;
    Object.defineProperty(value, "accessor", {
      enumerable: true,
      get() {
        throw new Error("Getter must not run during inspection");
      },
    });
    const el = document.createElement("hearth-json-viewer");
    el.id = "json-inspector";
    Object.assign(el, { label: "Payload", value });
    document.querySelector("hearth-theme")!.append(el);
  });
  const viewer = page.locator("hearth-json-viewer#json-inspector");
  await expect(
    viewer.getByRole("treeitem", { name: "self: [Circular]", exact: true }),
  ).toBeVisible();
  await expect(
    viewer.getByRole("treeitem", { name: "accessor: [Accessor]", exact: true }),
  ).toBeVisible();
  const branch = viewer.getByRole("treeitem", {
    name: "a/b: Object (1)",
    exact: true,
  });
  await branch.focus();
  await page.keyboard.press("ArrowRight");
  await viewer.getByRole("treeitem", { name: "~key: 17", exact: true }).click();
  await viewer.getByRole("button", { name: "Copy path" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "/a~1b/~0key",
  );
  await viewer.getByRole("button", { name: "Copy value" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("17");
});

test("code diffs switch views and copy literal hunks while inline copy uses the full payload", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#operations");
  const diff = page.getByRole("region", {
    name: "Configuration changes",
    exact: true,
  });
  await diff.getByRole("button", { name: "Split", exact: true }).click();
  await expect(
    diff.getByRole("columnheader", { name: "Before", exact: true }),
  ).toBeVisible();
  await expect(
    diff.getByRole("columnheader", { name: "After", exact: true }),
  ).toBeVisible();
  expect(
    (await diff.locator(".h-diff-number").first().boundingBox())!.width,
  ).toBeLessThan(40);
  await diff.getByRole("button", { name: "Copy diff" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "@@ -1,3 +1,3 @@\n server:\n-  retries: 2\n+  retries: 4\n   timeout: 5000",
  );
  await page.getByRole("button", { name: /Copy request ID:/ }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "req_7c9a31f084b2",
  );
});

test("message scrolling follows new output and preserves a visible message when earlier history arrives", async ({
  page,
}) => {
  await page.goto("/#operations");
  const viewport = page.getByRole("region", {
    name: "Diagnostic conversation",
    exact: true,
  });
  await expect
    .poll(() =>
      viewport.evaluate(
        (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
      ),
    )
    .toBeLessThan(2);
  await viewport.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await page.getByRole("button", { name: "Jump to latest" }).waitFor();
  const first = page.locator('[data-message-id="0"]');
  const offset = await first.evaluate(
    (el) =>
      el.getBoundingClientRect().top -
      el.closest(".h-message-viewport")!.getBoundingClientRect().top,
  );
  await page.getByRole("button", { name: "Load earlier messages" }).click();
  await expect
    .poll(() =>
      first.evaluate(
        (el) =>
          el.getBoundingClientRect().top -
          el.closest(".h-message-viewport")!.getBoundingClientRect().top,
      ),
    )
    .toBeCloseTo(offset, 0);
  await page
    .getByRole("button", { name: "Append message", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Jump to latest" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Jump to latest" }).click();
  await expect
    .poll(() =>
      viewport.evaluate(
        (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
      ),
    )
    .toBeLessThan(2);
  await page.getByRole("button", { name: "Grow last message" }).click();
  await expect
    .poll(() =>
      viewport.evaluate(
        (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
      ),
    )
    .toBeLessThan(2);
});

test("custom-element message slots preserve history anchors and native diff content stays escaped", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const scroller = document.createElement("hearth-message-scroller");
    scroller.id = "native-messages";
    Object.assign(scroller, {
      label: "Native conversation",
      maxHeight: "160px",
    });
    for (let i = 0; i < 6; i++) {
      const message = document.createElement("div");
      message.dataset.nativeMessage = String(i);
      message.style.minHeight = "80px";
      message.textContent = `Message ${i}`;
      scroller.append(message);
    }
    const diff = document.createElement("hearth-code-diff");
    diff.id = "native-diff";
    Object.assign(diff, {
      label: "Literal diff",
      hunks: [
        {
          id: "h",
          lines: [
            { kind: "added", newLine: 1, text: "<script>literal()</script>" },
          ],
        },
      ],
    });
    document.querySelector("hearth-theme")!.append(scroller, diff);
  });
  const scroller = page.locator("hearth-message-scroller#native-messages"),
    viewport = scroller.getByRole("region", { name: "Native conversation" });
  await expect
    .poll(() =>
      viewport.evaluate(
        (el) => el.scrollHeight - el.clientHeight - el.scrollTop,
      ),
    )
    .toBeLessThan(2);
  await page.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  );
  await viewport.evaluate((el) => {
    el.scrollTop = 0;
    el.dispatchEvent(new Event("scroll"));
  });
  await expect(
    scroller.getByRole("button", { name: "Jump to latest" }),
  ).toBeVisible();
  const message = scroller.locator('[data-native-message="0"]');
  const before =
    (await message.boundingBox())!.y - (await viewport.boundingBox())!.y;
  await scroller.evaluate((el) => {
    const earlier = document.createElement("div");
    earlier.textContent = "Earlier message";
    earlier.style.minHeight = "90px";
    el.prepend(earlier);
  });
  await expect
    .poll(
      async () =>
        (await message.boundingBox())!.y - (await viewport.boundingBox())!.y,
    )
    .toBeCloseTo(before, 0);
  const diff = page.locator("hearth-code-diff#native-diff");
  await expect(diff.locator("script")).toHaveCount(0);
  await expect(diff.locator("code")).toHaveText("<script>literal()</script>");
});

test("every operations component has a working native gallery preview", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  for (const name of [
    "HHeatmap",
    "HUptimeHistory",
    "HMeter",
    "HTagInput",
    "HInlineCopyText",
    "HAttachment",
    "HFlow",
    "HSpanTimeline",
    "HTraceView",
    "HMessageScroller",
    "HJsonViewer",
    "HCodeDiff",
    "HWaffleChart",
    "HDonutChart",
    "HWaterfallChart",
    "HTimeSeriesChart",
  ]) {
    const tag =
      "hearth-" +
      name
        .slice(1)
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .toLowerCase();
    await page.goto(`/#components/${name}`);
    await expect(page.locator(`.registry-preview ${tag}`)).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test("composition charts preserve exact amounts and whole-cell totals with native graphics", async ({
  page,
}) => {
  await page.goto("/#operations");
  const waffle = page.getByRole("figure", {
      name: "Request allocation",
      exact: true,
    }),
    donut = page.getByRole("figure", { name: "Request mix", exact: true });
  await expect(waffle.locator("[part=cell]")).toHaveCount(100);
  await expect(waffle.locator("[data-category=cached]")).toHaveCount(72);
  await waffle.getByRole("button", { name: /Cached:/ }).click();
  await expect(donut.getByRole("button", { name: /Cached:/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(waffle.locator("svg,canvas")).toHaveCount(0);
  await expect(donut.locator("svg,canvas")).toHaveCount(0);
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const el = document.createElement("hearth-waffle-chart");
    el.id = "rounding";
    Object.assign(el, {
      label: "Rounding",
      items: [
        { id: "a", label: "A", value: 1 },
        { id: "b", label: "B", value: 1 },
        { id: "c", label: "C", value: 1 },
      ],
    });
    document.querySelector("hearth-theme")!.append(el);
  });
  const chart = page.locator("hearth-waffle-chart#rounding");
  await expect(chart.locator("[part=cell]")).toHaveCount(100);
  await expect(chart.locator("[data-category=a]")).toHaveCount(34);
});

test("time-series inspection preserves missing-data gaps, markers, thresholds and visibility toggles", async ({
  page,
}) => {
  await page.goto("/#operations");
  const chart = page.getByRole("figure", {
    name: "Response latency",
    exact: true,
  });
  const path = await chart.locator("[data-series=api]").getAttribute("d");
  expect((path!.match(/M/g) || []).length).toBe(2);
  await expect(chart.locator("[part=threshold]")).toHaveCount(1);
  await expect(chart.locator("[part=marker]")).toHaveCount(1);
  await expect(chart).toContainText("Marker — Deployment: 09:15");
  const slider = chart.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    "09:20: API No sample, Worker 30 ms",
  );
  await chart.getByRole("button", { name: "API", exact: true }).click();
  await expect(chart.locator("[data-series=api]")).toHaveCount(0);
  await expect(
    chart.getByRole("button", { name: "API", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
});

test("grouped and stacked horizontal bars, histogram bins, and waterfall totals are meaningful", async ({
  page,
}) => {
  await page.goto("/#operations");
  const grouped = page.getByRole("figure", {
    name: "Operations by service",
    exact: true,
  });
  await expect(grouped).toHaveClass(/horizontal/);
  await expect(
    grouped.locator("[part=column]").first().locator("[part=segment]"),
  ).toHaveCount(2);
  await grouped.getByRole("button", { name: "Write", exact: true }).click();
  await expect(
    grouped.locator("[part=column]").first().locator("[part=segment]"),
  ).toHaveCount(1);
  const histogram = page.getByRole("figure", {
    name: "Latency distribution",
    exact: true,
  });
  await expect(histogram.locator(".h-diagram-bars")).toHaveCSS("gap", "0px");
  const waterfall = page.getByRole("figure", {
    name: "Monthly cost",
    exact: true,
  });
  await expect(
    waterfall.getByRole("button", {
      name: "Credit: change -20 USD, running total 125 USD",
      exact: true,
    }),
  ).toBeVisible();
  await waterfall.locator("summary").click();
  await expect(
    waterfall.getByRole("row", { name: /Total Total: 125 USD 125 USD/ }),
  ).toBeVisible();
});

test("artifact preview and removal are application-owned and the sample download works", async ({
  page,
}) => {
  await page.goto("/#operations");
  const attachment = page.getByRole("article", {
    name: "build-report.json",
    exact: true,
  });
  await attachment
    .getByRole("button", { name: "Preview build-report.json", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Build report preview" }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  const download = page.waitForEvent("download");
  await attachment
    .getByRole("link", { name: "Download build-report.json" })
    .click();
  expect((await download).suggestedFilename()).toBe("build-report.json");
  await attachment
    .getByRole("button", { name: "Remove build-report.json" })
    .click();
  await expect(attachment).toHaveCount(0);
  await page.getByRole("button", { name: "Restore artifact" }).click();
  await expect(attachment).toBeVisible();
});

test("new operations components pass automated accessibility checks and contain narrow layouts", async ({
  page,
}) => {
  await page.goto("/#operations");
  for (const mode of ["dark", "light"]) {
    await page
      .locator(".h-theme")
      .first()
      .evaluate((el, mode) => el.setAttribute("data-hearth-mode", mode), mode);
    const result = await new AxeBuilder({ page })
      .include(".operations-examples")
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(
      result.violations.map((v) => ({
        id: v.id,
        count: v.nodes.length,
        nodes: v.nodes
          .slice(0, 4)
          .map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    ).toEqual([]);
  }
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
