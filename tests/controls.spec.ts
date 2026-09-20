import { test, expect, type Page } from "@playwright/test";

async function mountForm(page: Page) {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "new-controls-form";
    const fieldset = document.createElement("fieldset");
    fieldset.id = "new-controls-fields";
    form.append(fieldset);
    const fields: [string, Record<string, unknown>][] = [
      [
        "number-input",
        {
          label: "Workers",
          name: "workers",
          value: 2,
          min: 0,
          max: 5,
          step: 0.5,
          required: true,
        },
      ],
      ["number-input", { label: "Optional count", name: "optional" }],
      [
        "time-picker",
        {
          label: "Start time",
          name: "time",
          value: "09:30",
          min: "08:00",
          max: "18:00",
          step: 900,
          required: true,
        },
      ],
      [
        "theme-switcher",
        { label: "Preferred mode", name: "mode", value: "system" },
      ],
      [
        "date-picker",
        {
          label: "Release date",
          name: "date",
          value: "2024-02-28",
          min: "2024-02-01",
          max: "2024-03-31",
          required: true,
        },
      ],
      [
        "date-range-picker",
        {
          label: "Audit period",
          name: "period",
          value: ["2024-02-27", "2024-03-02"],
          required: true,
        },
      ],
      [
        "range-slider",
        {
          label: "Budget",
          name: "budget",
          value: [20, 80],
          min: 0,
          max: 100,
          step: 5,
        },
      ],
    ];
    for (const [tag, props] of fields) {
      const el = document.createElement(`hearth-${tag}`);
      Object.assign(el, props);
      fieldset.append(el);
    }
    const reset = document.createElement("button");
    reset.type = "reset";
    reset.textContent = "Reset new controls";
    form.append(reset);
    document.querySelector("hearth-theme")!.append(form);
  });
  await expect(page.getByLabel("Workers", { exact: true })).toHaveValue("2");
}

test("Vue controls bind theme, counter, time, intervals, and workflow state", async ({
  page,
}) => {
  await page.goto("/#examples");
  const root = page.getByRole("region", { name: "Upcoming controls" });
  await root.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(root.locator(".h-theme")).toHaveAttribute(
    "data-hearth-mode",
    "light",
  );
  await root.getByRole("button", { name: "Increase Replica count" }).click();
  await expect(root.getByLabel("Replica count", { exact: true })).toHaveValue(
    "3",
  );
  await root.getByLabel("Backup time", { exact: true }).fill("12:30");
  const lower = root.getByRole("slider", {
    name: "Capacity: Minimum",
    exact: true,
  });
  await lower.focus();
  await lower.press("ArrowRight");
  await expect(root.getByText("Target: 21–80%")).toBeVisible();
  await root.locator(".h-range-track").scrollIntoViewIfNeeded();
  const track = await root.locator(".h-range-track").boundingBox();
  await page.mouse.click(track!.x + track!.width * 0.4, track!.y + 22);
  const clicked = Number(await lower.inputValue());
  expect(clicked).toBeGreaterThan(21);
  expect(clicked).toBeLessThan(80);
  await page.mouse.move(
    track!.x + 12 + ((track!.width - 24) * clicked) / 100,
    track!.y + 22,
  );
  await page.mouse.down();
  await page.mouse.move(track!.x + track!.width * 0.6, track!.y + 22, {
    steps: 5,
  });
  await page.mouse.up();
  expect(Number(await lower.inputValue())).toBeGreaterThan(clicked);
  await root
    .getByRole("button", { name: "Review Check the configuration." })
    .click();
  await expect(root.getByText("Current step: review")).toBeVisible();
  await expect(
    root.getByRole("listitem").filter({ hasText: "Review" }),
  ).toHaveAttribute("aria-current", "step");
  await expect(
    root.getByRole("button", { name: "Deploy", exact: true }),
  ).toBeDisabled();
  const calendar = root.getByRole("grid", { name: "Scheduling calendar" });
  await calendar
    .getByRole("button", { name: "Sunday, September 20, 2026" })
    .focus();
  await page.keyboard.press("PageDown");
  await page.keyboard.press("Enter");
  await expect(
    calendar.getByRole("button", { name: "Tuesday, October 20, 2026" }),
  ).toBeFocused();
  await expect(root.getByText("Selected date: 2026-10-20")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("new custom-element fields submit, validate both endpoints, disable, and reset with typed models", async ({
  page,
}) => {
  await mountForm(page);
  const form = page.locator("#new-controls-form");
  const values = () =>
    form.evaluate((el) => [...new FormData(el as HTMLFormElement).entries()]);
  expect(await values()).toEqual([
    ["workers", "2"],
    ["optional", ""],
    ["time", "09:30"],
    ["mode", "system"],
    ["date", "2024-02-28"],
    ["period", "2024-02-27"],
    ["period", "2024-03-02"],
    ["budget", "20"],
    ["budget", "80"],
  ]);
  await page.getByRole("button", { name: "Increase Workers" }).click();
  await expect(page.getByLabel("Workers", { exact: true })).toHaveValue("2.5");
  await page.getByLabel("Workers", { exact: true }).fill("");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await page.getByLabel("Workers", { exact: true }).fill("3");
  await page
    .getByRole("textbox", { name: "End date", exact: true })
    .fill("2024-02-01");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await page
    .getByRole("textbox", { name: "End date", exact: true })
    .fill("2024-03-10");
  await page.getByLabel(/^Start time/).fill("07:00");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await page.getByLabel(/^Start time/).fill("10:00");
  await form.getByRole("radio", { name: "Dark", exact: true }).check();
  const lower = form.getByRole("slider", { name: "Budget: Minimum" });
  await lower.focus();
  await lower.press("End");
  await expect(lower).toHaveValue("80");
  await expect(
    form.getByRole("slider", { name: "Budget: Maximum" }),
  ).toHaveValue("80");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(true);
  await page
    .locator("#new-controls-fields")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = true));
  await expect(
    page.getByRole("button", { name: "Increase Workers" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Open calendar for Release date" }),
  ).toBeDisabled();
  await expect(lower).toBeDisabled();
  expect(await values()).toEqual([]);
  await page
    .locator("#new-controls-fields")
    .evaluate((el) => ((el as HTMLFieldSetElement).disabled = false));
  await page.getByRole("button", { name: "Reset new controls" }).click();
  await expect(page.getByLabel("Workers", { exact: true })).toHaveValue("2");
  await expect(
    page.getByRole("textbox", { name: "End date", exact: true }),
  ).toHaveValue("2024-03-02");
  await expect(lower).toHaveValue("20");
  await expect(
    form.getByRole("radio", { name: "System", exact: true }),
  ).toBeChecked();
  expect(
    await form
      .locator("hearth-range-slider")
      .evaluate(
        (el) => (el as HTMLElement & { modelValue: number[] }).modelValue,
      ),
  ).toEqual([20, 80]);
  expect(
    await form
      .locator("hearth-number-input")
      .nth(1)
      .evaluate(
        (el) => (el as HTMLElement & { modelValue: number | null }).modelValue,
      ),
  ).toBeNull();
});

test("calendar navigates leap days, unavailable dates, month boundaries, and extreme supported years", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const el = document.createElement("hearth-calendar");
    el.id = "test-calendar";
    Object.assign(el, {
      value: "2024-02-28",
      month: "2024-02",
      label: "Leap calendar",
      today: "2024-02-29",
      min: "2024-01-01",
      max: "2024-12-31",
      disabledDates: ["2024-03-01"],
    });
    document.querySelector("hearth-theme")!.append(el);
  });
  const calendar = page.locator("hearth-calendar#test-calendar");
  await calendar
    .getByRole("button", { name: "Wednesday, February 28, 2024", exact: true })
    .focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: "Thursday, February 29, 2024" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(calendar.locator("td[aria-selected=true]")).toContainText("29");
  await page.keyboard.press("ArrowRight");
  await expect(
    calendar.getByRole("button", { name: "Saturday, March 2, 2024" }),
  ).toBeFocused();
  await expect(
    calendar.getByRole("button", { name: "Friday, March 1, 2024" }),
  ).toBeDisabled();
  await page.keyboard.press("PageUp");
  await expect(
    calendar.getByRole("button", { name: "Friday, February 2, 2024" }),
  ).toBeFocused();
  await calendar.evaluate((el) =>
    Object.assign(el, { month: "9999-12", min: undefined, max: undefined }),
  );
  await expect(
    calendar.getByRole("button", { name: "Next month", exact: true }),
  ).toBeDisabled();
  await expect(calendar.locator("[part=day]")).toHaveCount(31);
  await calendar.evaluate((el) => Object.assign(el, { month: "0001-01" }));
  await expect(
    calendar.getByRole("button", { name: "Previous month", exact: true }),
  ).toBeDisabled();
});

test("date-picker popover selects a leap day, returns focus, and respects readonly", async ({
  page,
}) => {
  await mountForm(page);
  const picker = page
    .locator("hearth-date-picker")
    .filter({ has: page.getByLabel(/^Release date/) });
  await picker
    .getByRole("button", { name: "Open calendar for Release date" })
    .click();
  const dialog = picker.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "Wednesday, February 28, 2024" }),
  ).toBeFocused();
  await dialog
    .getByRole("button", { name: "Thursday, February 29, 2024" })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Release date", exact: true }),
  ).toHaveValue("2024-02-29");
  await expect(
    page.getByRole("textbox", { name: "Release date", exact: true }),
  ).toBeFocused();
  await expect(dialog).not.toBeVisible();
  await picker.evaluate((el) => Object.assign(el, { readonly: true }));
  await expect(
    picker.getByRole("button", { name: "Open calendar for Release date" }),
  ).toBeDisabled();
});
