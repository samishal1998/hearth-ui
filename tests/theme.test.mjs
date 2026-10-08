import { test } from "node:test";
import assert from "node:assert/strict";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import {
  HTheme,
  HButton,
  HAuthPage,
  themeStyle,
  themeCSS,
  themeProfileCSS,
  HSurface,
  HIcon,
  iconNames,
  nextCollectionId,
  toggleSelection,
  createTypeahead,
  HStack,
  HHeading,
  HMessage,
  HTreeView,
  themes,
} from "../dist/vue/index.js";

test("theme exports filter unrelated properties and the native Vue build renders on the server", async () => {
  assert.deepEqual(themes, ["sunset", "ocean", "forest", "dusk", "rose"]);
  assert.deepEqual(
    themeStyle({
      "--h-accent": "#abcdef",
      color: "red",
      "--h-invalid;": "red",
      "--h-empty": undefined,
    }),
    { "--h-accent": "#abcdef" },
  );
  assert.equal(
    themeCSS({ "--h-accent": "#abcdef" }, ".my-app"),
    ".my-app {\n  --h-accent: #abcdef;\n}",
  );
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          HTheme,
          { theme: "sunset", tokens: { "--h-accent": "#abcdef" } },
          {
            default: () =>
              h(
                HButton,
                { variant: "primary" },
                { default: () => "<script>literal label</script>" },
              ),
          },
        ),
    }),
  );
  assert.match(html, /data-hearth-theme="sunset"/);
  assert.match(html, /--h-accent:#abcdef/);
  assert.match(html, /&lt;script&gt;literal label&lt;\/script&gt;/);
  const auth = await renderToString(
    createSSRApp({ render: () => h(HAuthPage, { brand: "My home" }) }),
  );
  assert.match(auth, /My home/);
  assert.match(auth, /autocomplete="current-password"/);
  const unsafeLink = await renderToString(
    createSSRApp({
      render: () =>
        h(
          HButton,
          { href: "javascript:alert(1)" },
          { default: () => "Untrusted link" },
        ),
    }),
  );
  assert.doesNotMatch(unsafeLink, /href="javascript:/);
  assert.match(unsafeLink, /type="button"/);
  const labeled = await renderToString(
    createSSRApp({
      render: () =>
        h(HButton, {
          iconOnly: true,
          icon: "settings",
          "aria-label": "Settings",
        }),
    }),
  );
  assert.match(labeled, /aria-label="Settings"/);
});

test("public collection primitives are immutable, disabled-aware, and direction-aware", () => {
  const items = [
    { id: "a", textValue: "Alpha" },
    { id: "disabled", disabled: true },
    { id: "b", textValue: "Bravo" },
    { id: "c", textValue: "Charlie" },
  ];
  assert.equal(nextCollectionId(items, "a", "ArrowDown"), "b");
  assert.equal(nextCollectionId(items, "c", "ArrowDown"), "c");
  assert.equal(nextCollectionId(items, "c", "ArrowDown", { wrap: true }), "a");
  assert.equal(
    nextCollectionId(items, "b", "ArrowRight", {
      orientation: "horizontal",
      direction: "rtl",
    }),
    "a",
  );
  assert.equal(
    nextCollectionId(items, "b", "ArrowDown", { orientation: "horizontal" }),
    "b",
  );
  const selection = ["a"];
  assert.deepEqual(toggleSelection(selection, "b", true), ["a", "b"]);
  assert.deepEqual(selection, ["a"]);
  const typeahead = createTypeahead();
  assert.equal(typeahead.search(items, "b", "a", 0), "b");
  assert.equal(typeahead.search(items, "r", "b", 10), "b");
  typeahead.reset();
  assert.equal(typeahead.search(items, "c", "b", 100), "c");
});

test("layout and hierarchical primitives render safely on the server", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(HStack, {}, () => [
          h(HHeading, { level: 3, size: "lg" }, () => "<Workspace>"),
          h(HMessage, { author: "Hearth" }, () => h("p", "An escaped message")),
          h(HTreeView, {
            label: "Resources",
            items: [
              {
                id: "root",
                label: "Root",
                children: [{ id: "child", label: "Child" }],
              },
            ],
            defaultExpanded: ["root"],
          }),
        ]),
    }),
  );
  assert.match(html, /<h3/);
  assert.match(html, /&lt;Workspace&gt;/);
  assert.match(html, /role="tree"/);
  assert.match(html, /aria-level="2"/);
});

test("mode profiles and custom SVG definitions render on the server without browser state", async () => {
  const html = await renderToString(
    createSSRApp({
      render: () =>
        h(
          HTheme,
          {
            mode: "light",
            tokens: { "--h-radius-card": "8px" },
            modeTokens: {
              dark: { "--h-bg": "#101010" },
              light: { "--h-bg": "#fefefe" },
            },
          },
          () =>
            h(HSurface, { as: "section", tone: "inset" }, () =>
              h(HIcon, {
                name: { paths: ["M2 2h8v8H2z"], viewBox: "0 0 12 12" },
              }),
            ),
        ),
    }),
  );
  assert.match(html, /--h-bg:#fefefe/);
  assert.doesNotMatch(html, /--h-bg:#101010/);
  assert.match(html, /<section/);
  assert.match(html, /viewBox="0 0 12 12"/);
  assert.match(html, /d="M2 2h8v8H2z"/);
  assert.ok(iconNames.includes("calendar"));
  const css = themeProfileCSS(
    {
      modeTokens: {
        dark: { "--h-bg": "#101010" },
        light: { "--h-bg": "#fefefe" },
      },
    },
    { target: "elements" },
  );
  assert.match(css, /::part\(base\)/);
  assert.match(css, /prefers-color-scheme: dark/);
  assert.match(css, /prefers-color-scheme: light/);
});
