import { test, expect } from "@playwright/test";
test.use({ hasTouch: true });

test("range fill aligns in both directions, coincident handles drag apart, and decimal endpoints remain reachable", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "refined-range-form";
    const range = document.createElement("hearth-range-slider");
    range.id = "refined-range";
    Object.assign(range, {
      label: "Allocation",
      name: "allocation",
      value: [20, 80],
      min: 0,
      max: 100,
      step: 5,
    });
    range.addEventListener("change", () => {
      range.dataset.changes = String(Number(range.dataset.changes || 0) + 1);
    });
    form.append(range);
    document.querySelector("hearth-theme")!.append(form);
  });
  const root = page.locator("hearth-range-slider#refined-range"),
    lower = root.getByRole("slider", { name: "Allocation: Minimum" }),
    upper = root.getByRole("slider", { name: "Allocation: Maximum" });
  await expect(lower).toHaveValue("20");
  for (const direction of ["ltr", "rtl"]) {
    await root.evaluate((el, value) => (el.style.direction = value), direction);
    const geometry = await root.evaluate((el) => {
      const fill = el
        .shadowRoot!.querySelector(".h-range-fill")!
        .getBoundingClientRect();
      const centers = [
        ...el.shadowRoot!.querySelectorAll(".h-range-thumb"),
      ].map((node) => {
        const box = node.getBoundingClientRect();
        return box.x + box.width / 2;
      });
      return {
        fill: fill.x,
        width: fill.width,
        start: Math.min(...centers),
        distance: Math.abs(centers[1] - centers[0]),
      };
    });
    expect(Math.abs(geometry.fill - geometry.start)).toBeLessThan(1);
    expect(Math.abs(geometry.width - geometry.distance)).toBeLessThan(1);
  }
  await root.evaluate((el) => {
    el.style.direction = "ltr";
    Object.assign(el, { modelValue: [50, 50] });
  });
  await expect(lower).toHaveValue("50");
  await expect(upper).toHaveValue("50");
  const track = root.locator(".h-range-track");
  await track.scrollIntoViewIfNeeded();
  const box = (await track.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 + (box.width - 44) * 0.2,
    box.y + 22,
    { steps: 6 },
  );
  await page.mouse.up();
  await expect(lower).toHaveValue("50");
  await expect(upper).toHaveValue("70");
  await expect(root).toHaveAttribute("data-changes", "1");
  await root.evaluate((el) => Object.assign(el, { modelValue: [50, 50] }));
  await expect(upper).toHaveValue("50");
  await page.mouse.move(box.x + box.width / 2, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(
    box.x + box.width / 2 - (box.width - 44) * 0.2,
    box.y + 22,
    { steps: 6 },
  );
  await page.mouse.up();
  await expect(lower).toHaveValue("30");
  await expect(upper).toHaveValue("50");
  await expect(root).toHaveAttribute("data-changes", "2");
  await root.evaluate((el) => Object.assign(el, { modelValue: [20, 80] }));
  await expect(lower).toHaveValue("20");
  await track.evaluate((el) =>
    el.addEventListener("pointerdown", (event) => {
      (el as HTMLElement).dataset.pointer = String(
        (event as PointerEvent).pointerId,
      );
    }),
  );
  await page.mouse.move(box.x + 22 + (box.width - 44) * 0.2, box.y + 22);
  await page.mouse.down();
  await page.mouse.move(box.x + 22 + (box.width - 44) * 0.4, box.y + 22, {
    steps: 4,
  });
  await expect(lower).toHaveValue("40");
  await track.dispatchEvent("pointercancel", {
    pointerId: Number(await track.getAttribute("data-pointer")),
  });
  await page.mouse.up();
  await expect(lower).toHaveValue("20");
  await expect(upper).toHaveValue("80");
  await expect(root).toHaveAttribute("data-changes", "2");
  await root.evaluate((el) =>
    Object.assign(el, {
      min: 0.1,
      max: 0.3,
      step: 0.1,
      modelValue: [0.1, 0.3],
    }),
  );
  await expect(upper).toHaveValue("0.3");
  await lower.focus();
  await lower.press("ArrowRight");
  await expect(lower).toHaveValue("0.2");
  await lower.press("End");
  await expect(lower).toHaveValue("0.3");
  expect(
    await page
      .locator("#refined-range-form")
      .evaluate((el) =>
        new FormData(el as HTMLFormElement).getAll("allocation"),
      ),
  ).toEqual(["0.3", "0.3"]);
});

test("counter stepping keeps focus off the text field, supports holding, and preserves nullable/reset/readonly behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "refined-counter-form";
    const counter = document.createElement("hearth-number-input");
    counter.id = "refined-counter";
    Object.assign(counter, {
      label: "Copies",
      name: "copies",
      value: 2,
      min: 0,
      max: 5,
      step: 0.5,
      required: true,
    });
    counter.addEventListener(
      "update:modelValue",
      (event) =>
        (counter.dataset.value = JSON.stringify(
          (event as CustomEvent).detail[0],
        )),
    );
    form.append(counter);
    document.querySelector("hearth-theme")!.append(form);
  });
  const root = page.locator("hearth-number-input#refined-counter"),
    field = root.getByRole("spinbutton", { name: "Copies" }),
    increase = root.getByRole("button", { name: "Increase Copies" });
  await increase.tap();
  await expect(field).toHaveValue("2.5");
  await expect(field).not.toBeFocused();
  await increase.scrollIntoViewIfNeeded();
  const box = (await increase.boundingBox())!;
  expect(box.width).toBeGreaterThanOrEqual(44);
  expect(box.height).toBeGreaterThanOrEqual(44);
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await expect(field).toHaveValue("5");
  await page.mouse.up();
  await expect(field).toHaveValue("5");
  await expect(increase).toBeDisabled();
  await field.fill("");
  await expect(root).toHaveAttribute("data-value", "null");
  expect(
    await page
      .locator("#refined-counter-form")
      .evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(false);
  await page
    .locator("#refined-counter-form")
    .evaluate((el) => (el as HTMLFormElement).reset());
  await expect(field).toHaveValue("2");
  await field.press("ArrowUp");
  await expect(field).toHaveValue("2.5");
  await root.evaluate((el) => Object.assign(el, { readonly: true }));
  await expect(increase).toBeDisabled();
  await expect(field).toHaveAttribute("readonly", "");
});

test("time columns offer only valid minute/second combinations, support keyboard application, and keep mobile actions visible", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "refined-time-form";
    const picker = document.createElement("hearth-time-picker");
    picker.id = "refined-time";
    Object.assign(picker, {
      label: "Run time",
      name: "clock",
      value: "09:07",
      min: "09:07",
      max: "10:37",
      step: 900,
      mobileBreakpoint: 900,
    });
    form.append(picker);
    document.querySelector("hearth-theme")!.append(form);
  });
  const root = page.locator("hearth-time-picker#refined-time"),
    trigger = root.getByRole("button", { name: "Choose time for Run time" });
  await trigger.click();
  const dialog = root.getByRole("dialog", { name: "Time picker: Run time" }),
    hours = dialog.getByRole("listbox", { name: "Hour", exact: true }),
    minutes = dialog.getByRole("listbox", { name: "Minute", exact: true });
  await expect(
    hours.getByRole("option", { name: "08", exact: true }),
  ).toBeDisabled();
  await expect(minutes.getByRole("option")).toHaveText([
    "07",
    "22",
    "37",
    "52",
  ]);
  await hours.getByRole("option", { name: "10", exact: true }).click();
  await expect(minutes.getByRole("option")).toHaveText(["07", "22", "37"]);
  await hours.press("ArrowRight");
  await expect(minutes).toBeFocused();
  await minutes.press("Home");
  await minutes.press("ArrowDown");
  await minutes.press("Enter");
  await expect(
    root.getByRole("textbox", { name: "Run time", exact: true }),
  ).toHaveValue("10:22");
  await expect(trigger).toBeFocused();
  expect(
    await page
      .locator("#refined-time-form")
      .evaluate((el) => new FormData(el as HTMLFormElement).get("clock")),
  ).toBe("10:22");
  await trigger.click();
  await hours.getByRole("option", { name: "09", exact: true }).click();
  await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    root.getByRole("textbox", { name: "Run time", exact: true }),
  ).toHaveValue("10:22");
  await root.evaluate((el) =>
    Object.assign(el, {
      value: "23:59:45",
      min: "22:00:00",
      max: "02:00:00",
      step: 15,
    }),
  );
  await page.setViewportSize({ width: 740, height: 390 });
  await trigger.click();
  await expect(
    dialog.getByRole("button", { name: "Apply time" }),
  ).toBeInViewport();
  await expect(hours).toBeInViewport();
  await expect(
    hours.getByRole("option", { name: "03", exact: true }),
  ).toBeDisabled();
  await hours.getByRole("option", { name: "02", exact: true }).click();
  await expect(minutes.getByRole("option")).toHaveText(["00"]);
  const seconds = dialog.getByRole("listbox", { name: "Second", exact: true });
  await expect(seconds.getByRole("option")).toHaveText(["00"]);
  await dialog.getByRole("button", { name: "Apply time" }).click();
  await expect(
    root.getByRole("textbox", { name: "Run time", exact: true }),
  ).toHaveValue("02:00:00");
});

test("calendar month/year navigation keeps its grid stable and draft year controls out of the owning form", async ({
  page,
}) => {
  await page.goto("/#examples");
  const calendar = page.locator(".control-examples .h-calendar").first();
  const before = (await calendar.getByRole("grid").boundingBox())!.height;
  await calendar
    .getByRole("button", { name: "Next month", exact: true })
    .click();
  expect((await calendar.getByRole("grid").boundingBox())!.height).toBe(before);
  await expect(calendar.locator("tbody tr")).toHaveCount(6);
  const form = page.getByRole("form", { name: "Maintenance scheduling" });
  await form
    .getByRole("button", { name: "Open calendar for Start date" })
    .click();
  const dialog = form.getByRole("dialog");
  await dialog.getByRole("button", { name: "Choose month and year" }).click();
  const year = dialog.getByRole("spinbutton", { name: "Year" });
  await year.fill("0");
  expect(await year.evaluate((el: HTMLInputElement) => el.validity.valid)).toBe(
    false,
  );
  expect(
    await form.evaluate((el) => (el as HTMLFormElement).checkValidity()),
  ).toBe(true);
  expect(
    await form.evaluate((el) =>
      new FormData(el as HTMLFormElement).getAll("period"),
    ),
  ).toEqual(["2026-09-20", "2026-09-25"]);
  await year.fill("2025");
  await dialog.getByRole("button", { name: "Mar 2025", exact: true }).click();
  await dialog
    .getByRole("button", { name: "Saturday, March 15, 2025" })
    .click();
  await expect(
    form.getByRole("textbox", { name: "Start date", exact: true }),
  ).toHaveValue("2025-03-15");
  await form
    .getByRole("button", { name: "Open calendar for Start date" })
    .click();
  await dialog.getByRole("button", { name: "Clear date" }).click();
  await expect(
    form.getByRole("textbox", { name: "Start date", exact: true }),
  ).toHaveValue("");
});

test("calendar Home and End choose available dates within the bounded week", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const calendar = document.createElement("hearth-calendar");
    calendar.id = "bounded-calendar";
    Object.assign(calendar, {
      value: "2024-03-20",
      month: "2024-03",
      weekStartsOn: 1,
      min: "2024-03-18",
      max: "2024-03-22",
      disabledDates: ["2024-03-18", "2024-03-22"],
    });
    document.querySelector("hearth-theme")!.append(calendar);
  });
  const calendar = page.locator("hearth-calendar#bounded-calendar");
  await calendar
    .getByRole("button", { name: "Wednesday, March 20, 2024" })
    .focus();
  await page.keyboard.press("Home");
  await expect(
    calendar.getByRole("button", { name: "Tuesday, March 19, 2024" }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    calendar.getByRole("button", { name: "Thursday, March 21, 2024" }),
  ).toBeFocused();
});

test("popover footer slots remain available in web components and can be added or removed dynamically", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const popover = document.createElement("hearth-popover");
    popover.id = "footer-popover";
    Object.assign(popover, { label: "Footer example" });
    popover.textContent = "Body content";
    document.querySelector("hearth-theme")!.append(popover);
  });
  const root = page.locator("hearth-popover#footer-popover");
  await root
    .getByRole("button", { name: "Footer example", exact: true })
    .click();
  await expect(root.locator("[part=footer]")).toHaveCount(0);
  await root.evaluate((el) => {
    const footer = document.createElement("button");
    footer.slot = "footer";
    footer.type = "button";
    footer.textContent = "Footer action";
    el.append(footer);
  });
  await expect(
    root.getByRole("button", { name: "Footer action" }),
  ).toBeInViewport();
  await root.evaluate((el) => el.querySelector("[slot=footer]")!.remove());
  await expect(root.locator("[part=footer]")).toHaveCount(0);
});
