import { test, expect } from "@playwright/test";

test("React receives array-valued selection events and supplies object properties", async ({
  page,
}) => {
  await page.goto("/react.html");
  await expect(
    page.getByRole("button", { name: "Remove Docker", exact: true }),
  ).toBeVisible();
  const combo = page.getByRole("combobox", {
    name: "React providers",
    exact: true,
  });
  await combo.fill("traefik");
  await combo.press("Enter");
  await expect(page.locator("#react-selections")).toHaveText("docker, traefik");
  await combo.press("Escape");
  await page
    .getByRole("button", { name: "Remove Docker", exact: true })
    .click();
  await expect(page.locator("#react-selections")).toHaveText("traefik");
});

test("Vue comboboxes, selection controls, navigation, and disclosure primitives", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/#examples");
  const multi = page.getByRole("combobox", {
    name: "Discovery providers",
    exact: true,
  });
  await multi.fill("proxy");
  await expect(page.getByRole("option", { name: /Traefik/ })).toBeVisible();
  await multi.press("Enter");
  await expect(
    page.locator(".expanded-examples .example-result").first(),
  ).toContainText("docker, traefik");
  await page
    .getByRole("button", { name: "Remove Docker", exact: true })
    .click();
  await expect(
    page.locator(".expanded-examples .example-result").first(),
  ).toContainText("Selected: traefik");
  await multi.fill("Caddy");
  await expect(page.getByRole("option", { name: /Caddy/ })).toBeDisabled();
  await multi.press("Enter");
  await multi.press("Escape");
  await page.getByRole("button", { name: "Clear Discovery providers" }).click();
  await page
    .getByRole("button", { name: "Save providers", exact: true })
    .click();
  expect(
    await multi.evaluate((el: HTMLInputElement) => el.validity.valid),
  ).toBe(false);
  await multi.fill("manual");
  await multi.press("Enter");
  await multi.press("Escape");
  const radio = page.getByRole("radio", { name: /^Private/ });
  await radio.focus();
  await radio.press("ArrowDown");
  await expect(page.getByRole("radio", { name: /^Public/ })).toBeChecked();
  await radio.press("End");
  await expect(page.getByRole("radio", { name: /^Public/ })).toBeChecked();
  await expect(
    page.getByRole("checkbox", { name: /Select all applications/ }),
  ).toHaveJSProperty("indeterminate", true);
  await page.getByRole("checkbox", { name: /Select all applications/ }).check();
  await expect(
    page.getByRole("checkbox", { name: /Select all applications/ }),
  ).toHaveJSProperty("indeterminate", false);
  const menu = page.getByRole("navigation", {
    name: "Main navigation",
    exact: true,
  });
  await menu.getByText("Manage", { exact: true }).click();
  await menu.getByRole("button", { name: "Providers", exact: true }).click();
  await expect(menu.getByText("Manage", { exact: true })).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Providers", exact: true }),
  ).not.toBeVisible();
  const manualTabs = page.getByRole("tablist", { name: "Workspace sections" });
  await manualTabs.getByRole("tab", { name: "General" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    manualTabs.getByRole("tab", { name: "Appearance" }),
  ).toBeFocused();
  await expect(
    manualTabs.getByRole("tab", { name: "General" }),
  ).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Enter");
  await expect(
    manualTabs.getByRole("tab", { name: "Appearance" }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Expand sidebar", exact: true })
    .click();
  await page
    .getByText("How does stable identity work?", { exact: true })
    .click();
  await expect(
    page.getByText(
      "Keep the same application identity even when a container is recreated.",
      { exact: true },
    ),
  ).toBeVisible();
  await page.getByText("Who can view a public page?", { exact: true }).click();
  await expect(
    page.getByText(
      "Keep the same application identity even when a container is recreated.",
      { exact: true },
    ),
  ).not.toBeVisible();
  await page
    .locator("#expanded-components")
    .getByRole("button", { name: "Next page", exact: true })
    .click();
  await expect(
    page
      .locator("#expanded-components")
      .getByRole("button", { name: "Page 2", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("web components preserve multi-value FormData, selection validation, resets, and numeric types", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/elements.html");
  const multi = page.getByRole("combobox", {
    name: "Choose providers",
    exact: true,
  });
  await expect(multi).toBeVisible();
  await page.getByRole("button", { name: "Save advanced form" }).click();
  await expect(page.locator("#advanced-result")).toContainText(
    '"providers":["docker"]',
  );
  await multi.fill("proxy");
  await multi.press("Enter");
  await expect(page.locator("#advanced-examples")).toHaveAttribute(
    "data-provider-values",
    '["docker","traefik"]',
  );
  // Selecting from the popup must not implicitly submit its surrounding form.
  await expect(page.locator("#advanced-result")).toContainText(
    '"providers":["docker"]',
  );
  await multi.press("Escape");
  await page.getByRole("radio", { name: "Public", exact: true }).check();
  await page
    .getByRole("checkbox", { name: "Email summaries", exact: true })
    .check();
  await page
    .getByLabel("Notes", { exact: true })
    .fill("First line\nSecond line");
  const range = page.getByRole("slider", {
    name: "Refresh interval",
    exact: true,
  });
  await range.focus();
  await range.press("ArrowRight");
  await page.getByRole("button", { name: "Save advanced form" }).click();
  let result = JSON.parse(
    (await page.locator("#advanced-result").textContent())!,
  );
  expect(result.providers).toEqual(["docker", "traefik"]);
  expect(result.access).toBe("public");
  expect(result.summaries).toBe("yes");
  expect(result.notes).toBe("First line\nSecond line");
  expect(result.interval).toBe("6");
  await page.getByRole("button", { name: "Reset advanced form" }).click();
  await expect(
    page.getByRole("radio", { name: "Private", exact: true }),
  ).toBeChecked();
  await expect(page.getByLabel("Notes", { exact: true })).toHaveValue(
    "Initial note",
  );
  await expect(range).toHaveValue("5");
  expect(
    await page
      .locator("hearth-range#interval")
      .evaluate(
        (el) => (el as HTMLElement & { modelValue: number }).modelValue,
      ),
  ).toBe(5);
  await page.getByRole("button", { name: "Save advanced form" }).click();
  result = JSON.parse((await page.locator("#advanced-result").textContent())!);
  expect(result.providers).toEqual(["docker"]);
  expect(result.summaries).toBeUndefined();
  await page.getByRole("button", { name: "Clear Choose providers" }).click();
  await page.getByRole("button", { name: "Save advanced form" }).click();
  expect(
    await page
      .locator("hearth-combobox#providers")
      .evaluate((el) =>
        (el as HTMLElement & { checkValidity(): boolean }).checkValidity(),
      ),
  ).toBe(false);
  await multi.fill("Caddy");
  await expect(page.getByRole("option", { name: /Caddy/ })).toBeDisabled();
  await multi.press("Enter");
  await multi.press("Escape");
  await page
    .locator("hearth-combobox#providers")
    .evaluate((el) => Object.assign(el, { modelValue: ["manual", "traefik"] }));
  await expect(
    page.getByRole("button", { name: "Remove Manual", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save advanced form" }).click();
  result = JSON.parse((await page.locator("#advanced-result").textContent())!);
  expect(result.providers).toEqual(["manual", "traefik"]);
  await page.getByRole("button", { name: "Toggle advanced fieldset" }).click();
  await expect(multi).toBeDisabled();
  await expect(
    page.getByRole("radio", { name: "Private", exact: true }),
  ).toBeDisabled();
  await expect(page.getByLabel("Notes", { exact: true })).toBeDisabled();
  expect(
    await page
      .locator("#advanced-form")
      .evaluate((form) => [...new FormData(form as HTMLFormElement)]),
  ).toEqual([]);
  await page.getByRole("button", { name: "Toggle advanced fieldset" }).click();
  await expect(multi).toBeEnabled();
  await expect(
    page.getByRole("radio", { name: "Team", exact: true }),
  ).toBeDisabled();
  await page
    .locator("hearth-combobox#providers")
    .evaluate((el) =>
      (
        el as HTMLElement & { formStateRestoreCallback(state: string): void }
      ).formStateRestoreCallback('["docker","manual"]'),
    );
  await expect(
    page.getByRole("button", { name: "Remove Docker", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("array-typed multi-select elements preserve reset state and form values without a multiple attribute", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await expect(
    page.getByRole("combobox", { name: "Choose providers", exact: true }),
  ).toBeVisible();
  await page.evaluate(() => {
    const form = document.createElement("form");
    form.id = "typed-multi-form";
    const multi = document.createElement("hearth-multi-select");
    multi.id = "typed-multi";
    Object.assign(multi, {
      label: "Team members",
      name: "members",
      value: ["sam"],
      options: [
        { value: "sam", label: "Sam" },
        { value: "lee", label: "Lee" },
      ],
      required: true,
    });
    form.append(multi);
    document.body.append(form);
  });
  const input = page.getByRole("combobox", {
    name: "Team members",
    exact: true,
  });
  await input.fill("Lee");
  await input.press("Enter");
  await input.press("Escape");
  expect(
    await page
      .locator("#typed-multi-form")
      .evaluate((form) =>
        new FormData(form as HTMLFormElement).getAll("members"),
      ),
  ).toEqual(["sam", "lee"]);
  await page
    .locator("#typed-multi-form")
    .evaluate((form) => (form as HTMLFormElement).reset());
  await expect(
    page.getByRole("button", { name: "Remove Lee", exact: true }),
  ).not.toBeVisible();
  expect(
    await page
      .locator("hearth-multi-select#typed-multi")
      .evaluate(
        (el) => (el as HTMLElement & { modelValue: string[] }).modelValue,
      ),
  ).toEqual(["sam"]);
  await page
    .locator("hearth-multi-select#typed-multi")
    .evaluate((el) =>
      (
        el as HTMLElement & { formStateRestoreCallback(state: string): void }
      ).formStateRestoreCallback('["lee"]'),
    );
  await expect(
    page.getByRole("button", { name: "Remove Lee", exact: true }),
  ).toBeVisible();
  await page
    .locator("hearth-range#interval")
    .evaluate((el) => Object.assign(el, { modelValue: 12, step: 5 }));
  await expect(
    page.getByRole("slider", { name: "Refresh interval", exact: true }),
  ).toHaveValue("11");
  await expect(page.locator("hearth-range#interval [part=value]")).toHaveText(
    "11 min",
  );
});

test("web component navigation, progress, skeletons, accordions, and manual tabs retain native semantics", async ({
  page,
}) => {
  await page.goto("/elements.html");
  const menu = page.getByRole("navigation", {
    name: "Example navigation",
    exact: true,
  });
  await menu.getByText("Manage", { exact: true }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    menu.getByRole("button", { name: "Apps", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu.getByText("Manage", { exact: true })).toBeFocused();
  const tabs = page.getByRole("tablist", { name: "Manual vertical tabs" });
  await tabs.getByRole("tab", { name: "General" }).focus();
  await page.keyboard.press("ArrowDown");
  await expect(tabs.getByRole("tab", { name: "Appearance" })).toBeFocused();
  await expect(
    page.getByText("General configuration panel.", { exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Space");
  await expect(
    page.getByText("Appearance configuration panel.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("progressbar", { name: "Scan progress", exact: true }),
  ).toHaveAttribute("value", "35");
  await expect(
    page.getByRole("progressbar", { name: "Pending scan", exact: true }),
  ).not.toHaveAttribute("value");
  await page
    .locator("hearth-progress#scan-progress")
    .evaluate((el) => Object.assign(el, { value: 200, max: 50 }));
  await expect(
    page.getByRole("progressbar", { name: "Scan progress", exact: true }),
  ).toHaveAttribute("value", "50");
  await page
    .getByTitle("Navigation and feedback")
    .getByRole("button", { name: "Next page", exact: true })
    .click();
  await expect(page.locator("#page-result")).toHaveText("Page 2");
  await page.getByRole("button", { name: "Page 10", exact: true }).click();
  await expect(
    page
      .getByTitle("Navigation and feedback")
      .getByRole("button", { name: "Next page", exact: true }),
  ).toBeDisabled();
  await page.getByText("Where is the data?", { exact: true }).click();
  await expect(
    page.getByText("Your application owns its data.", { exact: true }),
  ).toBeVisible();
  await page.getByText("Can I change the theme?", { exact: true }).click();
  await expect(
    page.getByText("Your application owns its data.", { exact: true }),
  ).not.toBeVisible();
  await page
    .getByRole("button", { name: "Collapse sidebar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Expand sidebar", exact: true }),
  ).toBeVisible();
  const avatar = page.getByRole("img", { name: "Sami Mishal", exact: true });
  await expect(avatar).toBeVisible();
  await expect(avatar.locator("[part=fallback]")).toHaveText("SM");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator("hearth-skeleton [part=block]")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(page.locator("hearth-skeleton [part=block]")).toHaveCSS(
    "width",
    "40px",
  );
});
