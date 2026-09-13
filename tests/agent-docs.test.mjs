import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { posix, resolve } from "node:path";
import { Script } from "node:vm";
import { parse, compileScript, compileTemplate } from "vue/compiler-sfc";
import { renderAgentDocs, root } from "../scripts/agent-docs.mjs";

test("agent references cover all public components, resolve links, and contain valid examples", async () => {
  const { files, catalog } = await renderAgentDocs();
  const index = files.get("llms.txt");
  assert.equal(files.size, catalog.length + 1);
  const exports = readFileSync(resolve(root, "src/index.ts"), "utf8");
  const publicNames = [...exports.matchAll(/default as (H\w+)/g)].map(
    (m) => m[1],
  );
  assert.deepEqual([...catalog.map((c) => c.name)].sort(), publicNames.sort());
  for (const [path, text] of files) {
    assert.equal(
      readFileSync(resolve(root, path), "utf8"),
      text,
      `${path} is stale`,
    );
    for (const [, href] of text.matchAll(/\]\(([^)]+)\)/g)) {
      if (/^https?:/.test(href)) continue;
      const target = posix.normalize(posix.join(posix.dirname(path), href));
      assert.ok(files.has(target), `${path} has a broken reference to ${href}`);
    }
    if (path === "llms.txt") continue;
    assert.ok(index.includes(`](${path})`), `Index omits ${path}`);
    assert.match(text, /## Public API/);
    assert.match(text, /### Defaults/);
    assert.match(text, /### Events/);
    assert.match(text, /### Slots/);
    assert.match(text, /### CSS parts/);
    const vue = text.match(/```vue\n([\s\S]*?)\n```/)?.[1];
    assert.ok(vue, `${path} lacks a Vue example`);
    const { descriptor, errors } = parse(vue, { filename: `${path}.vue` });
    assert.deepEqual(errors, []);
    const script = compileScript(descriptor, { id: "agent-example" });
    const template = compileTemplate({
      source: descriptor.template.content,
      filename: `${path}.vue`,
      id: "agent-example",
      compilerOptions: { bindingMetadata: script.bindings },
    });
    assert.deepEqual(template.errors, [], `${path}: invalid Vue template`);
    const js = text.match(/```js\n([\s\S]*?)\n```/)?.[1];
    assert.ok(js, `${path} lacks a web-component example`);
    new Script(js.replace(/^import .*;\n/gm, ""), { filename: path });
  }
  assert.ok(
    files.get("docs/components/multi-select/llms.txt").includes("getAll"),
  );
  assert.ok(
    files
      .get("docs/components/auth-page/llms.txt")
      .includes("Do not persist or log credentials"),
  );
  assert.ok(index.includes("`dusk`") && index.includes("`rose`"));
});
