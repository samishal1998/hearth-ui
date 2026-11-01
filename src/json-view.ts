import type { TreeItem } from "./themes";
export function jsonTree(value: unknown, maxDepth: number, maxEntries: number) {
  const nodes = new Map<
      string,
      { path: string; value: unknown; copyable: boolean }
    >(),
    ancestors = new WeakSet<object>();
  let remaining = maxEntries,
    truncated = false;
  function walk(
    value: unknown,
    key: string,
    path: string,
    depth: number,
  ): TreeItem {
    remaining--;
    const id = `json:${path}`;
    nodes.set(id, {
      path,
      value,
      copyable: !["function", "symbol", "undefined", "bigint"].includes(
        typeof value,
      ),
    });
    if (value === null || typeof value !== "object") {
      const text =
        typeof value === "string"
          ? JSON.stringify(
              value.length > 200 ? value.slice(0, 200) + "…" : value,
            )
          : String(value);
      return { id, label: `${key}: ${text}` };
    }
    if (ancestors.has(value)) return { id, label: `${key}: [Circular]` };
    const keys = Object.keys(value),
      label = `${key}: ${Array.isArray(value) ? "Array" : "Object"} (${keys.length})`;
    if (depth >= maxDepth) {
      truncated ||= keys.length > 0;
      return { id, label: label + (keys.length ? " — depth limit" : "") };
    }
    ancestors.add(value);
    const children: TreeItem[] = [];
    for (const child of keys) {
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      const descriptor = Object.getOwnPropertyDescriptor(value, child);
      const pointer =
        path + "/" + child.replace(/~/g, "~0").replace(/\//g, "~1");
      if (descriptor && "value" in descriptor)
        children.push(walk(descriptor.value, child, pointer, depth + 1));
      else {
        remaining--;
        const childId = `json:${pointer}`;
        nodes.set(childId, {
          path: pointer,
          value: undefined,
          copyable: false,
        });
        children.push({ id: childId, label: `${child}: [Accessor]` });
      }
    }
    ancestors.delete(value);
    return { id, label, children };
  }
  const root = walk(value, "Root", "", 0);
  return { items: [root], nodes, truncated };
}
