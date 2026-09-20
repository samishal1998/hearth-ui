import { expect, test } from "@playwright/test";
import type { HearthTimelineElement } from "../src/elements";

test("Vue timeline preserves supplied order, timestamps, and detail slots when new activity arrives", async ({
  page,
}) => {
  await page.goto("/#examples");
  const history = page.getByRole("list", {
    name: "Deployment history",
    exact: true,
  });
  await expect(history.getByRole("listitem")).toHaveCount(2);
  await expect(history.getByRole("listitem").first()).toContainText(
    "Deployment healthy",
  );
  await expect(
    history.getByText("All three instances passed their health checks."),
  ).toBeVisible();
  await expect(history.locator("time").first()).toHaveAttribute(
    "datetime",
    "2026-09-19T12:04:00Z",
  );
  await page
    .getByRole("button", { name: "Add activity event", exact: true })
    .click();
  await expect(history.getByRole("listitem")).toHaveCount(3);
  await expect(history.getByRole("listitem").first()).toContainText(
    "Health check passed",
  );
  await expect(history.getByRole("listitem").nth(1)).toContainText(
    "All three instances passed their health checks.",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("web-component timeline supports preconnection data, stable focus, safe links, loading, and empty content", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/elements.html");
  await page.evaluate(() => {
    const element = document.createElement("hearth-timeline") as InstanceType<
      typeof HearthTimelineElement
    >;
    element.id = "test-timeline";
    element.label = "Audit history";
    element.items = [
      {
        id: "second",
        title: "Review deployment",
        href: "#deployment",
        timestamp: "12:04 UTC",
        dateTime: "2026-09-19T12:04:00Z",
        description: "Default detail",
      },
      {
        id: "first",
        title: "<img src=x onerror=alert(1)>",
        href: "javascript:alert(1)",
        description: "An earlier event",
      },
    ];
    const detail = document.createElement("p");
    detail.slot = "detail:second";
    detail.textContent = "Slotted audit details";
    element.append(detail);
    document.querySelector("hearth-theme")!.append(element);
  });
  const root = page.locator("hearth-timeline#test-timeline");
  const history = root.getByRole("list", { name: "Audit history" });
  await expect(history.getByRole("listitem")).toHaveCount(2);
  await expect(history.getByRole("listitem").first()).toContainText(
    "Review deployment",
  );
  await expect(root.getByText("Slotted audit details")).toBeVisible();
  await expect(
    history.getByText("Default detail", { exact: true }),
  ).not.toBeVisible();
  await expect(history.getByRole("link")).toHaveCount(1);
  await expect(history.locator("img")).toHaveCount(0);
  await expect(history).toContainText("<img src=x onerror=alert(1)>");
  const link = history.getByRole("link", { name: "Review deployment" });
  await link.focus();
  await root.evaluate((el: InstanceType<typeof HearthTimelineElement>) => {
    el.items = [
      { id: "third", title: "New event", description: "x".repeat(300) },
      ...el.items!,
    ];
    el.loading = true;
  });
  await expect(history.getByRole("listitem")).toHaveCount(3);
  await expect(link).toBeFocused();
  await expect(root.getByRole("status")).toHaveText("Loading activity…");
  await expect(root.locator('[part="base"]')).toHaveAttribute(
    "aria-busy",
    "true",
  );
  await page.setViewportSize({ width: 390, height: 844 });
  const overflow = await root.evaluate((el) => ({
    width: el.getBoundingClientRect().width,
    scroll:
      el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!.scrollWidth,
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(Math.ceil(overflow.width));
  await root.evaluate((el: InstanceType<typeof HearthTimelineElement>) => {
    el.items = [];
  });
  await expect(history).toHaveCount(0);
  await expect(root.getByText("No activity yet.")).not.toBeVisible();
  await root.evaluate((el: InstanceType<typeof HearthTimelineElement>) => {
    el.loading = false;
  });
  await expect(root.getByText("No activity yet.")).toBeVisible();
  await expect(root.getByRole("status")).toHaveCount(0);
  await root.evaluate((el) => {
    const empty = document.createElement("div");
    empty.slot = "empty";
    empty.textContent = "No deployments match this filter.";
    el.append(empty);
  });
  await expect(
    root.getByText("No deployments match this filter."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
