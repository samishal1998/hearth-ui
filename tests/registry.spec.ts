import { test, expect } from "@playwright/test";

test("registry pages, filters, deep links, focused previews, and mobile layout", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#components");
  await expect(
    page.getByRole("heading", { name: "Find the right component." }),
  ).toBeVisible();
  await expect(page.locator(".registry-card")).toHaveCount(12);
  const first = await page.locator(".registry-card h2").first().textContent();
  await page.getByRole("button", { name: "Next page", exact: true }).click();
  await expect(page.locator(".registry-card h2").first()).not.toHaveText(
    first!,
  );
  await page.getByRole("button", { name: /^Controls/ }).click();
  await page
    .getByRole("searchbox", { name: "Find a component" })
    .fill("calendar");
  await page
    .locator(".registry-card")
    .filter({
      has: page.getByRole("heading", { name: "HCalendar", exact: true }),
    })
    .click();
  await expect(page).toHaveURL(/#components\/HCalendar$/);
  await expect(
    page.getByRole("heading", { name: "HCalendar", exact: true }),
  ).toBeVisible();
  const preview = page.locator(".registry-preview hearth-calendar");
  await expect(preview.getByRole("grid")).toBeVisible();
  await preview
    .getByRole("button", { name: "Wednesday, September 23, 2026" })
    .click();
  await expect(page.locator(".registry-event")).toContainText("2026-09-23");
  await page.getByRole("button", { name: "Reset preview" }).click();
  await expect(preview.locator("td[aria-selected=true]")).toHaveText("20");
  await expect(
    page.getByRole("link", { name: "Complete component reference" }),
  ).toHaveAttribute("href", "docs/components/calendar/llms.txt");
  await page.reload();
  await expect(preview.getByRole("grid")).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("link", { name: "All components" }).click();
  await page
    .getByRole("searchbox", { name: "Find a component" })
    .fill("nothing matches this");
  await expect(
    page.getByRole("heading", { name: "No matching components." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Reset filters" }).click();
  await expect(page.locator(".registry-card")).toHaveCount(12);
  expect(errors).toEqual([]);
});

test("auth page is available as the seventh recipe and submits an in-memory preview", async ({
  page,
}) => {
  await page.goto("/#recipes");
  await expect(page.locator(".recipe-gallery > article")).toHaveCount(7);
  await page
    .getByRole("link", { name: "Preview auth page", exact: true })
    .click();
  await expect(page).toHaveURL(/#recipe-auth$/);
  await expect(
    page.getByRole("heading", { name: "Welcome home." }),
  ).toBeVisible();
  await page.locator("input[name=username]").fill("demo");
  await page.locator("input[name=password]").fill("example-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByText(
      "Sign-in demo complete. No credentials were sent or stored.",
    ),
  ).toBeVisible();
  await page.getByRole("link", { name: "All page recipes" }).click();
  await expect(page).toHaveURL(/#recipes$/);
});

test("Hearth pickers replace native date/time popups and retain validity, form values, and keyboard dismissal", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "picker-form";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      form.dataset.submitted = "true";
    });
    for (const props of [
      {
        type: "date",
        label: "Planned date",
        name: "date",
        value: "2024-02-28",
        min: "2024-02-01",
        max: "2024-03-31",
      },
      {
        type: "time",
        label: "Planned time",
        name: "time",
        value: "09:30",
        step: 900,
      },
      {
        type: "datetime-local",
        label: "Planned timestamp",
        name: "timestamp",
        value: "2024-02-28T09:30",
        min: "2024-02-28T09:30:00",
      },
    ]) {
      const element = document.createElement("hearth-input");
      Object.assign(element, { ...props, required: true });
      form.append(element);
    }
    document.querySelector("hearth-theme")!.append(form);
  });
  const form = page.locator("#picker-form");
  const date = form.getByRole("textbox", { name: "Planned date", exact: true }),
    time = form.getByRole("textbox", { name: "Planned time", exact: true });
  await expect(date).toHaveAttribute("type", "text");
  await expect(time).toHaveAttribute("type", "text");
  await expect(
    form.locator(
      "input[type=date],input[type=time],input[type=datetime-local]",
    ),
  ).toHaveCount(0);
  await date.fill("2024-02-30");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await date.fill("2024-02-28");
  await form
    .getByRole("button", { name: "Open calendar for Planned date" })
    .click();
  await form
    .getByRole("dialog")
    .getByRole("button", { name: "Thursday, February 29, 2024" })
    .click();
  await expect(date).toHaveValue("2024-02-29");
  await expect(date).toBeFocused();
  await form
    .getByRole("button", { name: "Choose time for Planned time" })
    .click();
  const popup = form.getByRole("dialog", { name: "Time picker: Planned time" });
  await popup.getByRole("spinbutton", { name: "Hour", exact: true }).fill("10");
  await popup
    .getByRole("spinbutton", { name: "Minute", exact: true })
    .fill("45");
  await popup
    .getByRole("spinbutton", { name: "Minute", exact: true })
    .press("Enter");
  await expect(form).not.toHaveAttribute("data-submitted", "true");
  await expect(time).toHaveValue("10:45");
  await expect(time).toBeFocused();
  await form
    .getByRole("button", { name: "Choose time for Planned time" })
    .click();
  await page.keyboard.press("Escape");
  await expect(popup).not.toBeVisible();
  await expect(
    form.getByRole("button", { name: "Choose time for Planned time" }),
  ).toBeFocused();
  expect(
    await form.evaluate((el) => [...new FormData(el as HTMLFormElement)]),
  ).toEqual([
    ["date", "2024-02-29"],
    ["time", "10:45"],
    ["timestamp", "2024-02-28T09:30"],
  ]);
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(true);
  await time.fill("10:46");
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
});

test("select and combobox adornments remain inset in both writing directions", async ({
  page,
}) => {
  await page.goto("/#examples");
  for (const direction of ["ltr", "rtl"]) {
    await page
      .locator(".live-components")
      .evaluate((el, dir) => el.setAttribute("dir", dir), direction);
    const select = page.locator(".live-components .h-select-control").first();
    const geometry = await select.evaluate((el) => {
      const box = el.getBoundingClientRect(),
        icon = el.querySelector("svg")!.getBoundingClientRect();
      return { left: icon.left - box.left, right: box.right - icon.right };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(12);
    expect(geometry.right).toBeGreaterThanOrEqual(12);
  }
  const combo = page.locator("#expanded-components .h-combo-control").first();
  const inset = await combo.evaluate((el) => {
    const box = el.getBoundingClientRect(),
      button = el.querySelectorAll(".h-combo-action");
    const last = button[button.length - 1]!.getBoundingClientRect();
    return box.right - last.right;
  });
  expect(inset).toBeGreaterThanOrEqual(5);
});
