import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { parse } from "vue/compiler-sfc";

export const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const read = (path) => readFileSync(resolve(root, path), "utf8");
export const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const internal = new Set(["formDisabled", "control-sync"]);
export async function loadTypeScript(path) {
  const code = ts.transpileModule(read(path), {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
export function memberName(node) {
  return node.name &&
    (ts.isIdentifier(node.name) || ts.isStringLiteral(node.name))
    ? node.name.text
    : "";
}
export function publicType(node) {
  if (ts.isTypeLiteralNode(node))
    return ts.factory.updateTypeLiteralNode(
      node,
      node.members.filter((m) => !internal.has(memberName(m))),
    );
  if (ts.isInterfaceDeclaration(node))
    return ts.factory.updateInterfaceDeclaration(
      node,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      node.members.filter((m) => !internal.has(memberName(m))),
    );
  return node;
}
export function sharedTypes() {
  const file = ts.createSourceFile(
    "src/themes.ts",
    read("src/themes.ts"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const declarations = new Map();
  for (const node of file.statements) {
    if (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
      declarations.set(node.name.text, node);
    if (
      ts.isVariableStatement(node) &&
      node.declarationList.declarations.some(
        (d) => ts.isIdentifier(d.name) && d.name.text === "themes",
      )
    )
      declarations.set("themes", node);
  }
  return declarations;
}
export function apiSource(name, shared = sharedTypes()) {
  const path = `src/components/${name}.vue`;
  const { descriptor, errors } = parse(read(path), { filename: path });
  if (errors.length)
    throw new Error(`Cannot parse ${path}: ${errors.join(", ")}`);
  const source = ts.createSourceFile(
    path,
    descriptor.scriptSetup?.content || "",
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let props, events, defaults, icons;
  function visit(node) {
    if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
      if (node.expression.text === "defineProps")
        props = node.typeArguments?.[0];
      if (node.expression.text === "defineEmits")
        events = node.typeArguments?.[0];
      if (node.expression.text === "withDefaults") defaults = node.arguments[1];
    }
    if (
      name === "HIcon" &&
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "paths" &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    )
      icons = node.initializer.properties.map(memberName);
    ts.forEachChild(node, visit);
  }
  visit(source);
  if (!props) throw new Error(`No typed props found for ${name}`);
  const found = new Map();
  function dependencies(node) {
    if (
      ts.isIdentifier(node) &&
      shared.has(node.text) &&
      !found.has(node.text)
    ) {
      const declaration = shared.get(node.text);
      found.set(node.text, declaration);
      ts.forEachChild(declaration, dependencies);
    }
    ts.forEachChild(node, dependencies);
  }
  dependencies(publicType(props));
  if (events) dependencies(publicType(events));
  return {
    path,
    props: printer.printNode(
      ts.EmitHint.Unspecified,
      publicType(props),
      source,
    ),
    events: events
      ? printer.printNode(ts.EmitHint.Unspecified, publicType(events), source)
      : "{}",
    defaults: defaults
      ? defaults.getText(source)
      : "No component defaults; optional props are undefined (absent boolean props cast to false unless explicitly defaulted).",
    types: [...found.values()]
      .map((node) =>
        printer.printNode(
          ts.EmitHint.Unspecified,
          publicType(node),
          node.getSourceFile(),
        ),
      )
      .join("\n\n"),
    icons,
  };
}
