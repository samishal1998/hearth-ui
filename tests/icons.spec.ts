import { test, expect } from "@playwright/test";
test("icon gallery discovers and copies new names and custom elements render matching definitions", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#components/HIcon");
  const gallery = page.getByRole("region", { name: "Built-in icons" });
  await gallery
    .getByRole("searchbox", { name: "Find an icon" })
    .fill("refresh");
  await expect(gallery.locator(".icon-tile")).toHaveCount(1);
  await gallery
    .getByRole("button", { name: "Copy refresh icon name: refresh" })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "refresh",
  );
  await gallery.getByRole("searchbox", { name: "Find an icon" }).fill("retry");
  await expect(gallery.locator(".icon-tile")).toHaveCount(1);
  await expect(gallery.locator(".icon-tile")).toContainText(
    "Same glyph as refresh",
  );
  await page.setViewportSize({ width: 320, height: 740 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/elements.html");
  await page.evaluate(async () => {
    const { iconDefinitions } = await import("/icons-demo.ts");
    for (const [id, name] of [
      ["named", "refresh"],
      ["defined", iconDefinitions.refresh],
    ] as const) {
      const icon = document.createElement("hearth-icon");
      icon.id = id;
      Object.assign(icon, { name });
      document.querySelector("hearth-theme")!.append(icon);
    }
  });
  const named = page.locator("hearth-icon#named svg"),
    defined = page.locator("hearth-icon#defined svg");
  await expect(named).toHaveAttribute("stroke-width", "1.8");
  await expect(defined.locator("path")).toHaveAttribute(
    "d",
    (await named.locator("path").getAttribute("d"))!,
  );
});

test("every everyday icon has drawable geometry at 16, 20 and 24 pixels", async ({
  page,
}) => {
  await page.goto("/elements.html");
  const result = await page.evaluate(async () => {
    const { iconDefinitions, iconAliases } = await import("/icons-demo.ts");
    const names = [
      "settings",
      "error",
      "success",
      "refresh",
      "retry",
      "resend",
      "save",
      "cancel",
      "time",
      "snooze",
      "user",
      "admin",
      "later",
      "list",
      "globe",
      "link",
      "unlink",
      "edit",
      "undo",
      "redo",
      "archive",
      "folder",
      "folder-open",
      "mail",
      "eye",
      "eye-off",
      "unlock",
      "stop",
      "power",
      "history",
    ];
    const output: {
      name: string;
      size: number;
      width: number;
      height: number;
      paths: string[];
    }[] = [];
    for (const size of [16, 20, 24])
      for (const name of names) {
        const icon = document.createElement("hearth-icon");
        Object.assign(icon, { name, size });
        document.querySelector("hearth-theme")!.append(icon);
        await new Promise((resolve) => requestAnimationFrame(resolve));
        const svg = icon.shadowRoot!.querySelector("svg")!;
        const box = svg.getBoundingClientRect();
        const path = svg.querySelector("path")!;
        if (!(path.getTotalLength() > 0))
          throw new Error(`Empty geometry: ${name}`);
        output.push({
          name,
          size,
          width: box.width,
          height: box.height,
          paths: [...svg.querySelectorAll("path")].map((p) =>
            p.getAttribute("d")!,
          ),
        });
        if (!iconDefinitions[name])
          throw new Error(`Missing definition: ${name}`);
        icon.remove();
      }
    if (iconAliases.cancel !== "close" || iconAliases.time !== "clock")
      throw new Error("Missing aliases");
    return output;
  });
  for (const icon of result) {
    expect(icon.width, icon.name).toBe(icon.size);
    expect(icon.height, icon.name).toBe(icon.size);
    expect(icon.paths[0]).toBeTruthy();
  }
});
