import { ref, watch, onMounted, onBeforeUnmount, type Ref } from "vue";

// Shared by native Vue and the independently bundled custom-element runtime.
const scrollKey: unique symbol = Symbol.for("hearth-ui.mobile-scroll-lock");
type ScrollDocument = Document & {
  [scrollKey]?: { owners: Set<HTMLElement>; previous: string };
};

/** CSS inheritance also crosses custom-element roots, unlike Vue injection. */
export function useMobileLayout(
  target: Ref<HTMLElement | undefined>,
  breakpoint: () => number | undefined = () => undefined,
) {
  const mobile = ref(false);
  let media: MediaQueryList | undefined, observer: MutationObserver | undefined;
  let ancestors: Element[] = [];
  let locked: HTMLElement | undefined;
  function release() {
    if (!locked) return;
    const doc = locked.ownerDocument as ScrollDocument,
      state = doc[scrollKey];
    if (state) {
      state.owners.delete(locked);
      if (!state.owners.size) {
        if (doc.documentElement.style.overflow === "hidden")
          doc.documentElement.style.overflow = state.previous;
        delete doc[scrollKey];
      }
    }
    locked = undefined;
  }
  function scrollLock() {
    const element = target.value;
    if (
      !mobile.value ||
      !(element instanceof HTMLDialogElement) ||
      !element.open
    ) {
      release();
      return;
    }
    if (locked === element) return;
    release();
    const doc = element.ownerDocument as ScrollDocument;
    const state = (doc[scrollKey] ??= {
      owners: new Set(),
      previous: doc.documentElement.style.overflow,
    });
    state.owners.add(element);
    doc.documentElement.style.overflow = "hidden";
    locked = element;
  }
  function match() {
    mobile.value = !!media?.matches;
    scrollLock();
  }
  function update() {
    const element = target.value;
    if (!element) return;
    const inherited = Number(
      getComputedStyle(element)
        .getPropertyValue("--h-mobile-breakpoint")
        .trim()
        .replace(/px$/, ""),
    );
    const configured = breakpoint();
    const value =
      configured !== undefined && Number.isFinite(configured) && configured >= 0
        ? configured
        : getComputedStyle(element)
              .getPropertyValue("--h-mobile-breakpoint")
              .trim() &&
            Number.isFinite(inherited) &&
            inherited >= 0
          ? inherited
          : 640;
    const query = value === 0 ? "not all" : `(max-width: ${value}px)`;
    if (media?.media !== query) {
      media?.removeEventListener("change", match);
      media = window.matchMedia(query);
      media.addEventListener("change", match);
    }
    match();
    const viewport = window.visualViewport;
    const values = {
      "--h-overlay-width": `${viewport?.width ?? document.documentElement.clientWidth}px`,
      "--h-overlay-left": `${viewport?.offsetLeft ?? 0}px`,
      "--h-overlay-height": `${viewport?.height ?? window.innerHeight}px`,
      "--h-overlay-bottom": `${Math.max(0, window.innerHeight - (viewport?.offsetTop ?? 0) - (viewport?.height ?? window.innerHeight))}px`,
    };
    for (const [name, value] of Object.entries(values))
      if (element.style.getPropertyValue(name) !== value)
        element.style.setProperty(name, value);
  }
  function observe() {
    observer?.disconnect();
    ancestors = [];
    let element: Element | null = target.value ?? null;
    while (element) {
      ancestors.push(element);
      element =
        element.assignedSlot ||
        element.parentElement ||
        (element.getRootNode() as ShadowRoot).host ||
        null;
    }
    observer = new MutationObserver(update);
    for (const ancestor of ancestors)
      observer.observe(ancestor, {
        attributes: true,
        attributeFilter: ["style", "class", "open"],
      });
    update();
  }
  onMounted(() => {
    observe();
    window.addEventListener("resize", update);
    window.visualViewport?.addEventListener("resize", update);
    window.visualViewport?.addEventListener("scroll", update);
  });
  watch(breakpoint, () => {
    if (media) update();
  });
  watch(
    target,
    () => {
      if (media) observe();
    },
    { flush: "post" },
  );
  onBeforeUnmount(() => {
    release();
    observer?.disconnect();
    media?.removeEventListener("change", match);
    window.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("resize", update);
    window.visualViewport?.removeEventListener("scroll", update);
  });
  return mobile;
}
