import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { catalog } from "../site/catalog";

test("agent index and every component reference are served as plain text", async ({
  request,
}) => {
  for (const path of [
    "llms.txt",
    ...catalog.map(
      (c) => `docs/components/${c.tag.slice("hearth-".length)}/llms.txt`,
    ),
  ]) {
    const response = await request.get("/" + path);
    expect(response.status(), path).toBe(200);
    expect(response.headers()["content-type"], path).toContain("text/plain");
    expect(await response.text(), path).toBe(readFileSync(path, "utf8"));
  }
  const head = await request.head("/llms.txt");
  expect(head.status()).toBe(200);
  expect(await head.body()).toHaveLength(0);
});
