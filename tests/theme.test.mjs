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
  themes,
} from "../dist/vue/index.js";

test("theme exports filter unrelated properties and the native Vue build renders on the server", async () => {
  assert.deepEqual(themes, ["sunset", "ocean", "forest"]);
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
