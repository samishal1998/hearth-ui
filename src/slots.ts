import { ref, useSlots, onMounted, onUpdated, onBeforeUnmount } from "vue";

/** Native slot presence belongs to the custom-element host; Vue slot functions remain the first source. */
export function useSlotPresence(root: () => HTMLElement | undefined) {
  const slots = useSlots(),
    native = ref(new Set<string>());
  let host: Element | undefined, observer: MutationObserver | undefined;
  function connect() {
    const element = root(),
      tree = element?.getRootNode();
    const next =
      tree instanceof ShadowRoot && element?.parentNode === tree
        ? tree.host
        : undefined;
    if (next === host) return;
    observer?.disconnect();
    host = next;
    if (!host) {
      native.value = new Set();
      return;
    }
    const sync = () => {
      const names = new Set<string>();
      for (const child of host!.childNodes) {
        if (child instanceof Element)
          names.add(child.getAttribute("slot") || "default");
        else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim())
          names.add("default");
      }
      if (
        names.size !== native.value.size ||
        [...names].some((name) => !native.value.has(name))
      )
        native.value = names;
    };
    observer = new MutationObserver(sync);
    observer.observe(host, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["slot"],
    });
    sync();
  }
  onMounted(connect);
  onUpdated(connect);
  onBeforeUnmount(() => observer?.disconnect());
  return (name: string) => !!slots[name] || native.value.has(name);
}
