import { onMounted, onUpdated } from "vue";

export function safeHref(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value, "https://hearth.invalid");
    return ["http:", "https:"].includes(url.protocol) ? value : undefined;
  } catch {
    return undefined;
  }
}

export function controlSync(emit: (event: "control-sync") => void) {
  onMounted(() => emit("control-sync"));
  onUpdated(() => emit("control-sync"));
}
export function describedBy(
  external: unknown,
  own?: string,
): string | undefined {
  const ids = [
    ...(typeof external === "string" ? external.split(/\s+/) : []),
    ...(own ? [own] : []),
  ].filter(Boolean);
  return ids.length ? [...new Set(ids)].join(" ") : undefined;
}
