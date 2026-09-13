import { test, expect } from "@playwright/test";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

test("downloaded custom elements run in a raw browser without a bundler or Node globals", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const server = createServer(async (req, res) => {
    try {
      const path = new URL(req.url || "/", "http://localhost").pathname;
      if (path === "/") {
        res.setHeader("Content-Type", "text/html");
        res.end(
          `<!doctype html><html lang="en"><head><link rel="stylesheet" href="/dist/themes.css"><title>Raw Hearth consumer</title></head><body style="margin:0"><hearth-theme theme="sunset" mode="dark"><hearth-auth-page brand="Raw HTML"></hearth-auth-page><output id="result"></output></hearth-theme><script type="module">import '/dist/elements/auto.js';document.querySelector('hearth-auth-page').addEventListener('submit',e=>document.querySelector('#result').textContent=e.detail[0].username);</script></body></html>`,
        );
      } else if (path.startsWith("/dist/")) {
        res.setHeader(
          "Content-Type",
          path.endsWith(".css") ? "text/css" : "text/javascript",
        );
        res.end(await readFile(resolve("." + path)));
      } else {
        res.writeHead(404);
        res.end();
      }
    } catch {
      res.writeHead(404);
      res.end();
    }
  });
  await new Promise<void>((done) => server.listen(0, "127.0.0.1", done));
  try {
    const address = server.address();
    if (!address || typeof address === "string")
      throw new Error("No test server port");
    await page.goto(`http://127.0.0.1:${address.port}/`);
    await expect(
      page.getByRole("heading", { name: "Welcome home." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Sign in", exact: true }),
    ).toHaveCSS("background-color", "rgb(255, 122, 47)");
    await page.getByLabel(/^Username/).fill("Browser owner");
    await page.getByLabel(/^Password/).fill("demo");
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page.locator("#result")).toHaveText("Browser owner");
    expect(
      await page.evaluate(
        () =>
          typeof (globalThis as typeof globalThis & { process?: unknown })
            .process,
      ),
    ).toBe("undefined");
    expect(errors).toEqual([]);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((done) => server.close(() => done()));
  }
});

test("native Vue: themes, scoped islands, dialogs, login template, and dashboard actions", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Themes", exact: true }).click();
  await page.getByLabel("Palette", { exact: true }).selectOption("ocean");
  await expect(
    page.locator(".theme-preview-stack .h-button.primary").first(),
  ).toHaveCSS("background-color", "rgb(112, 186, 255)");
  await expect(
    page.locator(".theme-islands .h-theme").last().locator(".h-button"),
  ).toHaveCSS("background-color", "rgb(139, 215, 164)");
  await page.getByLabel("Color mode", { exact: true }).selectOption("light");
  await expect(page.locator(".h-theme").first()).toHaveCSS(
    "color-scheme",
    "light",
  );
  await page.getByRole("switch", { name: "Compact density" }).check();
  await expect(
    page.locator(".theme-preview-stack .h-button.primary").first(),
  ).toHaveCSS("min-height", "40px");
  await page
    .getByLabel("Accent", { exact: true })
    .evaluate((el: HTMLInputElement) => {
      el.value = "#b666f3";
      el.dispatchEvent(new Event("input", { bubbles: true }));
    });
  await expect(
    page.locator(".theme-preview-stack .h-button.primary").first(),
  ).toHaveCSS("background-color", "rgb(182, 102, 243)");
  await page.getByRole("button", { name: "Export your theme" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("dialog").locator("pre")).toContainText(
    "--h-accent: #b666f3",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByLabel("Color mode", { exact: true }).selectOption("system");
  await page.emulateMedia({ colorScheme: "dark" });
  await page.getByRole("button", { name: "Toggle theme mode" }).click();
  await expect(page.getByLabel("Color mode", { exact: true })).toHaveValue(
    "light",
  );
  await page.getByRole("button", { name: "Reset to Sunset" }).click();
  await page.getByRole("link", { name: "Components", exact: true }).click();
  await page.getByRole("button", { name: "Open a real dialog" }).click();
  await page
    .getByRole("dialog")
    .getByLabel("A name for your next project")
    .fill("A little home");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("tab", { name: "Preview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Source", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("End");
  await expect(
    page.getByRole("tab", { name: "Source", exact: true }),
  ).toBeFocused();
  await page.goto("/#login");
  await page.getByLabel(/^Username/).fill("Sami");
  await page.getByLabel(/^Password/).fill("not-a-real-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("heading", {
      name: "Your apps. Right where you left them.",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Add app", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByLabel(/^Application name/)
    .fill("Cedar");
  await page
    .getByRole("button", { name: "Add application", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Cedar", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Favorite Cedar", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Unfavorite Cedar", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(
    "not-a-real-password",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(
    page.getByRole("dialog", { name: "Main navigation" }),
  ).toBeVisible();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Settings", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Make yourself at home." }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("web components: native form ownership, validation, reset, disabled fieldsets, slots, events, and themes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/elements.html");
  await expect(
    page.getByRole("heading", { name: "Native HTML. Familiar components." }),
  ).toBeVisible();
  await page
    .locator('hearth-button[href="./#guide"]')
    .evaluate((el) => (el as HTMLElement).focus());
  await expect(page.getByRole("link", { name: "Back to guide" })).toBeFocused();
  await expect(page.getByLabel(/^Workspace name/)).toHaveValue("Homestead");
  await expect(page.getByRole("switch", { name: "Public page" })).toBeChecked();
  await page
    .getByRole("button", { name: "Save workspace", exact: true })
    .click();
  await expect(page.locator("#form-result")).toContainText("Submit the form");
  expect(
    await page
      .locator("#email")
      .evaluate(
        (el) =>
          (el as HTMLElement & { validity: ValidityState }).validity
            .valueMissing,
      ),
  ).toBe(true);
  await page.getByLabel(/^Email address/).fill("owner@example.com");
  await page.getByLabel(/^Workspace name/).fill("Cedar");
  await page.getByLabel(/^Category/).selectOption("development");
  await page.getByRole("switch", { name: "Public page" }).uncheck();
  await page
    .getByRole("button", { name: "Save workspace", exact: true })
    .click();
  await expect(page.locator("#form-result")).toHaveText(
    '{"name":"Cedar","email":"owner@example.com","category":"development"}',
  );
  await page.getByRole("button", { name: "Reset form", exact: true }).click();
  await expect(page.getByLabel(/^Workspace name/)).toHaveValue("Homestead");
  await expect(page.getByLabel(/^Email address/)).toHaveValue("");
  await expect(page.getByRole("switch", { name: "Public page" })).toBeChecked();
  await page.getByRole("button", { name: "Toggle disabled fieldset" }).click();
  await expect(page.getByLabel(/^Workspace name/)).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Save workspace", exact: true }),
  ).toBeDisabled();
  expect(
    await page
      .locator("#example-form")
      .evaluate((form) =>
        Object.fromEntries(new FormData(form as HTMLFormElement)),
      ),
  ).toEqual({});
  await page.getByRole("button", { name: "Toggle disabled fieldset" }).click();
  await expect(page.getByLabel(/^Workspace name/)).toBeEnabled();
  await expect(
    page.getByRole("button", { name: "Save workspace", exact: true }),
  ).toBeEnabled();
  await page
    .locator("#name")
    .evaluate((el) => Object.assign(el, { modelValue: "Changed by property" }));
  await expect(page.getByLabel(/^Workspace name/)).toHaveValue(
    "Changed by property",
  );
  await page.getByLabel(/^Email address/).fill("hello@example.com");
  await page.getByLabel(/^Email address/).press("Enter");
  await expect(page.locator("#form-result")).toContainText(
    "Changed by property",
  );
  await expect(page.locator("#form-result")).toContainText('"public":"yes"');
  await page
    .locator("hearth-switch#public")
    .evaluate((el) =>
      (
        el as HTMLElement & { formStateRestoreCallback(state: string): void }
      ).formStateRestoreCallback("unchecked"),
    );
  await expect(
    page.getByRole("switch", { name: "Public page" }),
  ).not.toBeChecked();
  await page.getByRole("tab", { name: "Overview", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tabpanel", { name: "Details" })).toBeVisible();
  await expect(
    page.getByText("The detail panel is another native named slot.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("The overview panel is a native named slot.", {
      exact: true,
    }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Favorite Photo library" }).click();
  await expect(
    page.getByRole("button", { name: "Unfavorite Photo library" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Open dialog", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByLabel("Your project").fill("A home");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("button", { name: "Use Ocean" }).click();
  await expect(
    page.getByRole("button", { name: "Save workspace", exact: true }),
  ).toHaveCSS("background-color", "rgb(112, 186, 255)");
  await expect(
    page.getByRole("button", { name: "Forest primary action" }),
  ).toHaveCSS("background-color", "rgb(139, 215, 164)");
  await page.getByRole("button", { name: "Use light mode" }).click();
  await expect(page.getByLabel(/^Workspace name/)).toHaveCSS(
    "background-color",
    "rgb(242, 247, 251)",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("the dashboard web component renders slotted content and mobile navigation", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await expect(
    page.getByRole("heading", { name: "Native HTML. Familiar components." }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => {
    const shell = document.createElement("hearth-dashboard-shell");
    Object.assign(shell, {
      brand: "Cedar",
      username: "Owner",
      items: [
        { id: "home", label: "Overview", icon: "home" },
        { id: "apps", label: "Apps", icon: "apps" },
      ],
      active: "home",
    });
    shell.innerHTML =
      '<hearth-page-header title="Web-component workspace"></hearth-page-header><hearth-button slot="header-actions">Header slot action</hearth-button>';
    shell.addEventListener("navigate", (event) => {
      const [id] = (event as CustomEvent<[string]>).detail;
      Object.assign(shell, { active: id });
      shell.dataset.selected = id;
    });
    document.body.replaceChildren(shell);
  });
  await expect(
    page.getByRole("heading", { name: "Web-component workspace" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Header slot action" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Apps", exact: true })
    .click();
  await expect(page.locator("hearth-dashboard-shell")).toHaveAttribute(
    "data-selected",
    "apps",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("built-in palettes retain readable semantic text and system-mode support", async ({
  page,
}) => {
  await page.goto("/elements.html");
  await expect(
    page.getByRole("heading", { name: "Native HTML. Familiar components." }),
  ).toBeVisible();
  for (const theme of ["sunset", "ocean", "forest", "dusk", "rose"])
    for (const { mode, colorScheme } of [
      { mode: "dark", colorScheme: "dark" },
      { mode: "light", colorScheme: "light" },
      { mode: "system", colorScheme: "light" },
      { mode: "system", colorScheme: "dark" },
    ] as const) {
      await page.emulateMedia({ colorScheme });
      await page
        .locator("hearth-theme#island")
        .evaluate((el, { theme, mode }) => Object.assign(el, { theme, mode }), {
          theme,
          mode,
        });
      await page.waitForFunction(
        ({ theme, mode }) => {
          const root = document
            .querySelector("hearth-theme#island")
            ?.shadowRoot?.querySelector(".h-theme");
          return (
            root?.getAttribute("data-hearth-theme") === theme &&
            root?.getAttribute("data-hearth-mode") === mode
          );
        },
        { theme, mode },
      );
      await expect(page.getByLabel(/^Workspace name/)).toHaveCSS(
        "color-scheme",
        colorScheme,
      );
      const ratios = await page
        .locator("hearth-theme#island")
        .evaluate((el) => {
          const css = getComputedStyle(
            el.shadowRoot!.querySelector(".h-theme")!,
          );
          const luminance = (key: string) => {
            let hex = css.getPropertyValue(key).trim();
            if (hex.length === 4)
              hex = "#" + [...hex.slice(1)].map((c) => c + c).join("");
            const rgb = [1, 3, 5]
              .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
              .map((v) =>
                v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
              );
            return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
          };
          return [
            ["--h-text", "--h-bg"],
            ["--h-muted", "--h-surface"],
            ["--h-accent-text", "--h-surface"],
            ["--h-on-accent", "--h-accent"],
            ["--h-on-accent", "--h-accent-hover"],
            ["--h-success", "--h-surface"],
            ["--h-warning", "--h-surface"],
            ["--h-danger", "--h-surface"],
            ["--h-info", "--h-surface"],
          ].map(([a, b]) => {
            const x = luminance(a),
              y = luminance(b);
            return {
              pair: `${a}/${b}`,
              ratio: (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05),
            };
          });
        });
      for (const pair of ratios)
        expect(
          pair.ratio,
          `${theme}/${mode}/${colorScheme} ${pair.pair}`,
        ).toBeGreaterThanOrEqual(4.5);
    }
  await page
    .locator("hearth-theme#island")
    .evaluate((el) => Object.assign(el, { mode: "system" }));
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.getByLabel(/^Workspace name/)).toHaveCSS(
    "color-scheme",
    "light",
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.getByLabel(/^Workspace name/)).toHaveCSS(
    "color-scheme",
    "dark",
  );
});

test("React 19 consumes bundled web components and their event payloads", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/react.html");
  await page
    .getByLabel("React-controlled event example", { exact: true })
    .fill("Hello from React");
  await page
    .getByLabel("React-controlled event example", { exact: true })
    .blur();
  await expect(page.locator("#react-value")).toHaveText("Hello from React");
  await page.getByLabel(/^Username/).fill("React owner");
  await page.getByLabel(/^Password/).fill("demo-only");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.locator("#react-result")).toContainText("React owner");
  await page.getByRole("button", { name: "Toggle React theme" }).click();
  await expect(
    page.getByRole("button", { name: "Sign in", exact: true }),
  ).toHaveCSS("background-color", "rgb(112, 186, 255)");
  expect(errors).toEqual([]);
});
