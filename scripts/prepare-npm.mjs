import {
  cpSync,
  mkdirSync,
  writeFileSync,
  rmSync,
  existsSync,
} from "node:fs";
import { resolve } from "node:path";
import ts from "typescript";
import {
  root,
  read,
  loadTypeScript,
  apiSource,
  sharedTypes,
  publicType,
  printer,
} from "./component-api.mjs";

export const packageDirectories = ["packages/vue", "packages/elements"];
export function assertVersions() {
  const workspace = JSON.parse(read("package.json"));
  if (!workspace.private)
    throw new Error("The repository root must remain private.");
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(workspace.version))
    throw new Error("Invalid workspace version");
  for (const directory of packageDirectories) {
    const pkg = JSON.parse(read(`${directory}/package.json`));
    if (pkg.version !== workspace.version)
      throw new Error(`Version mismatch: ${pkg.name}`);
    if (pkg.license !== "MIT" || pkg.publishConfig?.access !== "public")
      throw new Error(`Check publishing metadata for ${pkg.name}`);
  }
  return workspace.version;
}
async function elementDeclarations() {
  const { catalog } = await loadTypeScript("site/catalog.ts");
  const shared = sharedTypes();
  const sharedNames = [...shared.keys()].filter((name) => name !== "themes");
  const source = ts.createSourceFile(
    "elements.ts",
    read("src/elements.ts"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const formComponents = new Set();
  let formAPI = "";
  function visit(node) {
    if (ts.isInterfaceDeclaration(node) && node.name.text === "FormControlAPI")
      formAPI = printer.printNode(ts.EmitHint.Unspecified, node, source);
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === "element" &&
      node.initializer.arguments.length === 3
    ) {
      formComponents.add(node.initializer.arguments[0].getText(source));
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!formAPI) throw new Error("Missing form-control API");
  const declarations = [
    "// Generated from the same Vue source; this public API depends only on DOM types.",
    `import type { ${sharedNames.join(", ")} } from './themes.js';\nexport * from './themes.js';`,
    `export interface HearthEventTarget<Events extends Record<string, unknown[]>> {
  addEventListener<K extends keyof Events & string>(type: K, listener: ((event: CustomEvent<Events[K]>) => void) | null, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof Events & string>(type: K, listener: ((event: CustomEvent<Events[K]>) => void) | null, options?: boolean | EventListenerOptions): void;
}
export type HearthElement<Props, Events extends Record<string, unknown[]>> = HearthEventTarget<Events> & HTMLElement & Props;
export type HearthElementConstructor<Props, Element extends HTMLElement> = new (initialProps?: Partial<Props>) => Element;`,
    formAPI,
  ];
  for (const component of catalog) {
    const api = apiSource(component.name, shared);
    const stem = `Hearth${component.name.slice(1)}`;
    declarations.push(
      `export type ${component.name}Props = ${api.props};\nexport type ${component.name}Events = ${api.events};\nexport type ${stem}ElementInstance = HearthElement<${component.name}Props, ${component.name}Events>${formComponents.has(component.name) ? " & FormControlAPI" : ""};\nexport declare const ${stem}Element: HearthElementConstructor<${component.name}Props, ${stem}ElementInstance>;`,
    );
  }
  declarations.push(
    "export declare function registerElements(prefix?: string): void;",
  );
  return declarations.join("\n\n") + "\n";
}
export async function preparePackages() {
  const version = assertVersions();
  for (const directory of packageDirectories) {
    const target = resolve(root, directory);
    // These ignored folders are build products, never hand-authored package source.
    rmSync(resolve(target, "dist"), { recursive: true, force: true });
    rmSync(resolve(target, "docs"), { recursive: true, force: true });
    mkdirSync(resolve(target, "dist/types"), { recursive: true });
    cpSync(resolve(root, "LICENSE"), resolve(target, "LICENSE"));
    cpSync(resolve(root, "llms.txt"), resolve(target, "llms.txt"));
    cpSync(
      resolve(root, "docs/components"),
      resolve(target, "docs/components"),
      { recursive: true },
    );
    cpSync(
      resolve(root, "dist/themes.css"),
      resolve(target, "dist/themes.css"),
    );
  }
  const vue = resolve(root, "packages/vue");
  const elements = resolve(root, "packages/elements");
  cpSync(resolve(root, "dist/vue"), resolve(vue, "dist/vue"), {
    recursive: true,
  });
  cpSync(
    resolve(root, "dist/types/components"),
    resolve(vue, "dist/types/components"),
    { recursive: true },
  );
  for (const name of ["index.d.ts", "themes.d.ts", "internal.d.ts"])
    cpSync(resolve(root, "dist/types", name), resolve(vue, "dist/types", name));
  cpSync(resolve(root, "dist/elements"), resolve(elements, "dist/elements"), {
    recursive: true,
  });
  cpSync(
    resolve(root, "dist/VUE-LICENSE"),
    resolve(elements, "dist/VUE-LICENSE"),
  );
  const sharedFile = ts.createSourceFile(
    "themes.d.ts",
    read("dist/types/themes.d.ts"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const publicShared = ts.factory.updateSourceFile(
    sharedFile,
    sharedFile.statements.map(publicType),
  );
  writeFileSync(
    resolve(elements, "dist/types/themes.d.ts"),
    printer.printFile(publicShared),
  );
  writeFileSync(
    resolve(elements, "dist/types/index.d.ts"),
    await elementDeclarations(),
  );
  writeFileSync(resolve(elements, "dist/types/auto.d.ts"), "export {};\n");
  for (const directory of packageDirectories)
    writeFileSync(
      resolve(root, directory, "dist/build.json"),
      JSON.stringify({ version }) + "\n",
    );
  console.log(`Prepared @hearth-ui/vue and @hearth-ui/elements ${version}.`);
}
export function assertPrepared() {
  const version = assertVersions();
  for (const directory of packageDirectories) {
    for (const file of [
      "dist/build.json",
      "dist/types/index.d.ts",
      "dist/themes.css",
      "llms.txt",
      "docs/components/theme/llms.txt",
      "LICENSE",
      "README.md",
    ])
      if (!existsSync(resolve(root, directory, file)))
        throw new Error(
          `Missing ${directory}/${file}; run npm run build first.`,
        );
    if (JSON.parse(read(`${directory}/dist/build.json`)).version !== version)
      throw new Error(`Stale build in ${directory}; run npm run build.`);
  }
  return version;
}
