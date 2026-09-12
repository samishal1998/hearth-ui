import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";

const root = resolve(".");
const work = mkdtempSync(join(tmpdir(), "hearth-package-"));
try {
  const packed = JSON.parse(
    execFileSync(
      "npm",
      ["pack", "--ignore-scripts", "--json", "--pack-destination", work],
      { cwd: root, encoding: "utf8" },
    ),
  )[0];
  writeFileSync(
    join(work, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "@samishal1998/hearth-ui": `file:${join(work, packed.filename)}`,
      },
    }),
  );
  execFileSync(
    "npm",
    [
      "install",
      "--ignore-scripts",
      "--no-audit",
      "--no-fund",
      "--no-package-lock",
    ],
    { cwd: work, stdio: "inherit" },
  );
  writeFileSync(
    join(work, "consumer.ts"),
    `import { h } from 'vue';
import { HInput, HTheme, HMultiSelect, themeStyle } from '@samishal1998/hearth-ui';
import { HearthInputElement, HearthSelectElement, HearthMultiSelectElement, HearthComboboxElement, registerElements } from '@samishal1998/hearth-ui/elements';
const field = new HearthInputElement();
field.modelValue = 'hello';
field.checkValidity();
// @ts-expect-error string values must remain typed
field.modelValue = 123;
const select = new HearthSelectElement();
select.options = [{ value: 'media', label: 'Media' }];
const multi = new HearthMultiSelectElement();
multi.modelValue = ['media'];
multi.checkValidity();
// @ts-expect-error dedicated multi-selects only accept arrays
multi.modelValue = 'media';
const combo = new HearthComboboxElement();
combo.modelValue = ['media'];
combo.multiple = true;
h(HMultiSelect, { label: 'Providers', modelValue: ['media'], options: [{ value:'media', label:'Media' }] });
h(HInput, { label: 'Name', modelValue: 'Home' });
h(HTheme, { tokens: themeStyle({ '--h-accent': '#ff7a2f' }) });
registerElements('my-app');
`,
  );
  execFileSync(
    process.execPath,
    [
      join(root, "node_modules/typescript/bin/tsc"),
      "--noEmit",
      "--strict",
      "--module",
      "esnext",
      "--moduleResolution",
      "bundler",
      "--target",
      "es2022",
      "--lib",
      "ES2022,DOM",
      "consumer.ts",
    ],
    { cwd: work, stdio: "inherit" },
  );
  execFileSync(
    process.execPath,
    [
      "--input-type=module",
      "-e",
      `const ui=await import('@samishal1998/hearth-ui');if(!ui.HAuthPage)throw new Error('Missing Vue export');const ce=await import('@samishal1998/hearth-ui/elements');ce.registerElements();console.log('Installed package imports without a browser.');`,
    ],
    { cwd: work, stdio: "inherit" },
  );
  for (const file of [
    "dist/vue/index.js",
    "dist/vue/hearth-ui.css",
    "dist/elements/index.js",
    "dist/elements/auto.js",
    "dist/themes.css",
    "dist/VUE-LICENSE",
    "dist/types/index.d.ts",
  ])
    assert.ok(
      existsSync(join(work, "node_modules/@samishal1998/hearth-ui", file)),
      `Missing package file: ${file}`,
    );
  console.log(
    "Package smoke check passed: tarball install, typed Vue/element APIs, SSR-safe imports, and CSS exports.",
  );
} finally {
  rmSync(work, { recursive: true, force: true });
}
