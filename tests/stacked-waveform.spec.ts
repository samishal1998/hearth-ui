import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function mount(page: Page) {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const theme = document.createElement("hearth-theme");
    theme.id = "stacked-wave-theme";
    const chart = document.createElement("hearth-stacked-waveform");
    chart.id = "stacked-wave";
    Object.assign(chart, {
      label: "Stacked amounts",
      columns: [
        {
          id: "one",
          label: "Pillar 1",
          segments: [
            { id: "green", label: "Green", value: 1, tone: "success" },
            { id: "red", label: "Red", value: 10, tone: "danger" },
            { id: "blue", label: "Blue", value: 5, tone: "info" },
          ],
        },
        {
          id: "two",
          label: "Pillar 2",
          segments: [
            { id: "green", label: "Green", value: 2, tone: "success" },
            { id: "red", label: "Red", value: 12, tone: "danger" },
            { id: "blue", label: "Blue", value: 7, tone: "info" },
          ],
        },
        {
          id: "three",
          label: "Pillar 3",
          segments: [
            { id: "green-top", label: "Green", value: 5, tone: "success" },
            { id: "red", label: "Red", value: 12, tone: "danger" },
            { id: "green-bottom", label: "Green", value: 12, tone: "success" },
          ],
        },
      ],
    });
    chart.addEventListener("select", (event) =>
      Object.assign(chart, { selected: (event as CustomEvent).detail[0] }),
    );
    theme.append(chart);
    document.body.replaceChildren(theme);
  });
  await expect(
    page.getByRole("slider", { name: "Inspect Stacked amounts" }),
  ).toBeVisible();
}

test("stacked waveform preserves amount ratios, subpixel gaps, centered pillars, order and repeated colors", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page);
  const chart = page.locator("hearth-stacked-waveform#stacked-wave");
  const plot = (await chart.locator("[part=plot]").boundingBox())!;
  const pillars = chart.locator("[part=pillar]");
  for (const [index, total] of [16, 21, 29].entries()) {
    const box = (await pillars.nth(index).boundingBox())!;
    expect(box.width).toBe(8);
    expect(box.height).toBeCloseTo((plot.height * total) / 29, 1);
    expect(box.y + box.height / 2).toBeCloseTo(plot.y + plot.height / 2, 1);
    const segments = await pillars
      .nth(index)
      .locator("[part=segment]")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const r = node.getBoundingClientRect();
          return { y: r.y, height: r.height };
        }),
      );
    expect(segments[1].y - segments[0].y - segments[0].height).toBeCloseTo(
      0.5,
      1,
    );
    expect(segments[2].y - segments[1].y - segments[1].height).toBeCloseTo(
      0.5,
      1,
    );
  }
  const first = await pillars
    .first()
    .locator("[part=segment]")
    .evaluateAll((nodes) =>
      nodes.map((node) => node.getBoundingClientRect().height),
    );
  expect(first[1] / first[2]).toBeCloseTo(2, 1);
  expect(first[2] / first[0]).toBeCloseTo(5, 1);
  const repeated = await pillars
    .nth(2)
    .locator("[part=segment]")
    .evaluateAll((nodes) =>
      nodes.map((node) => ({
        id: node.getAttribute("data-segment-id"),
        color: getComputedStyle(node).backgroundColor,
      })),
    );
  expect(repeated.map((segment) => segment.id)).toEqual([
    "green-top",
    "red",
    "green-bottom",
  ]);
  expect(repeated[0].color).toBe(repeated[2].color);
  expect(repeated[0].color).not.toBe(repeated[1].color);
  await chart.locator("summary").click();
  for (const total of ["16", "21", "29"])
    await expect(
      chart.getByRole("cell", { name: total, exact: true }),
    ).toBeVisible();
  await expect(chart.locator("svg,canvas")).toHaveCount(0);
});

test("one native scrubber supports inspection, repeated segment announcements, selection and data updates", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await mount(page);
  const chart = page.locator("hearth-stacked-waveform#stacked-wave");
  const slider = chart.getByRole("slider");
  await slider.focus();
  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    "Pillar 3: total 29; Green 5, Red 12, Green 12",
  );
  await expect(chart.locator("[data-column-id=three]")).toHaveClass(/selected/);
  await expect(chart.locator("[part=tooltip]")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(chart.locator("[part=tooltip]")).not.toBeVisible();
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("1");
  await chart.evaluate((el) => {
    const host = el as HTMLElement & { columns: any[] };
    host.columns = host.columns.map((column, index) =>
      index === 1
        ? {
            ...column,
            segments: column.segments.map((segment: any, i: number) =>
              i === 0 ? { ...segment, value: 4 } : segment,
            ),
          }
        : column,
    );
  });
  await expect(slider).toBeFocused();
  await expect(slider).toHaveAttribute(
    "aria-valuetext",
    "Pillar 2: total 23; Green 4, Red 12, Blue 7",
  );
  await expect(chart.locator("[part=segment]").first()).toHaveCSS(
    "transition-duration",
    "0s",
  );
  await chart.evaluate((el) => el.setAttribute("dir", "rtl"));
  await page.keyboard.press("Home");
  await page.keyboard.press("ArrowLeft");
  await expect(slider).toHaveValue("1");
  const pillar = chart.locator("[data-column-id=three]");
  const box = (await pillar.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await expect(chart.locator("[part=tooltip]")).toContainText(
    "Pillar 3: total 29",
  );
});

test("dense stacks fit touch widths without widening pillars and expose exact values accessibly", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 320, height: 740 },
    hasTouch: true,
    reducedMotion: "reduce",
  });
  try {
    const page = await context.newPage();
    await page.goto("/#components/HStackedWaveform");
    const chart = page.locator(".registry-preview hearth-stacked-waveform");
    const slider = chart.getByRole("slider");
    await expect(slider).toBeVisible();
    const box = (await slider.boundingBox())!;
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(
      (await chart.locator("[part=pillar]").first().boundingBox())!.width,
    ).toBeLessThanOrEqual(8);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await slider.tap({ position: { x: box.width - 4, y: box.height / 2 } });
    await expect(slider).toHaveValue("23");
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

test("zero and invalid amounts leave no artificial fill and empty data has a useful state", async ({
  page,
}) => {
  await mount(page);
  const chart = page.locator("hearth-stacked-waveform#stacked-wave");
  await chart.evaluate((el) =>
    Object.assign(el, {
      columns: [
        {
          id: "zero",
          label: "Zero",
          segments: [
            { id: "a", label: "A", value: 0 },
            { id: "b", label: "B", value: -4 },
            { id: "c", label: "C", value: NaN },
          ],
        },
      ],
    }),
  );
  await expect(chart.getByRole("slider")).toHaveAttribute(
    "aria-valuetext",
    "Zero: total 0; A 0, B 0, C 0",
  );
  for (const segment of await chart.locator("[part=segment]").all())
    await expect(segment).not.toBeVisible();
  await chart.evaluate((el) => Object.assign(el, { columns: [] }));
  await expect(chart.getByText("No amounts to display.")).toBeVisible();
  await expect(chart.getByRole("slider")).toHaveCount(0);
});
