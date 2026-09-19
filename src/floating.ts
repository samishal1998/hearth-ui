import { nextTick, onBeforeUnmount, watch, type Ref } from "vue";

/** The native top layer keeps overlays out of clipped ancestors without losing theme inheritance. */
export function useFloating(
  anchor: Ref<HTMLElement | undefined>,
  panel: Ref<HTMLElement | undefined>,
  open: Ref<boolean>,
  placement: () => "top" | "bottom" | "left" | "right",
) {
  let observer: ResizeObserver | undefined;
  let frame = 0;
  function position() {
    const a = anchor.value,
      p = panel.value;
    if (!a || !p || !open.value) return;
    const r = a.getBoundingClientRect(),
      box = p.getBoundingClientRect(),
      gap = 8,
      pad = 12;
    const vw = document.documentElement.clientWidth,
      vh = window.innerHeight;
    let side = placement();
    if (
      side === "bottom" &&
      r.bottom + gap + box.height > vh - pad &&
      r.top > box.height + gap
    )
      side = "top";
    else if (
      side === "top" &&
      r.top - gap - box.height < pad &&
      vh - r.bottom > box.height + gap
    )
      side = "bottom";
    else if (side === "right" && r.right + gap + box.width > vw - pad)
      side = "left";
    else if (side === "left" && r.left - gap - box.width < pad) side = "right";
    let x =
      side === "left"
        ? r.left - box.width - gap
        : side === "right"
          ? r.right + gap
          : r.left;
    let y =
      side === "top"
        ? r.top - box.height - gap
        : side === "bottom"
          ? r.bottom + gap
          : r.top;
    x = Math.max(pad, Math.min(x, vw - box.width - pad));
    y = Math.max(pad, Math.min(y, vh - box.height - pad));
    p.style.left = `${Math.round(x)}px`;
    p.style.top = `${Math.round(y)}px`;
  }
  function schedule() {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(position);
  }
  function stop() {
    observer?.disconnect();
    observer = undefined;
    window.removeEventListener("resize", schedule);
    window.removeEventListener("scroll", schedule, true);
    cancelAnimationFrame(frame);
  }
  watch(
    open,
    async (value) => {
      if (!value) {
        stop();
        return;
      }
      await nextTick();
      position();
      observer = new ResizeObserver(schedule);
      if (anchor.value) observer.observe(anchor.value);
      if (panel.value) observer.observe(panel.value);
      window.addEventListener("resize", schedule);
      window.addEventListener("scroll", schedule, true);
    },
    { flush: "post" },
  );
  onBeforeUnmount(stop);
  return { position };
}

/** Include slotted content and open custom-element roots when finding a focus target. */
export function focusFirst(root: HTMLElement) {
  function find(node: Node): HTMLElement | undefined {
    if (
      node instanceof HTMLElement &&
      node.matches(
        'button:not(:disabled),input:not(:disabled):not([type=hidden]),select:not(:disabled),textarea:not(:disabled),a[href],[tabindex="0"]',
      ) &&
      node.getClientRects().length
    )
      return node;
    const children =
      node instanceof HTMLSlotElement
        ? node.assignedNodes({ flatten: true }).length
          ? node.assignedNodes({ flatten: true })
          : [...node.childNodes]
        : node instanceof HTMLElement && node.shadowRoot
          ? [...node.shadowRoot.childNodes]
          : [...node.childNodes];
    for (const child of children) {
      const target = find(child);
      if (target) return target;
    }
  }
  const target = [...root.childNodes].map(find).find(Boolean);
  (target || root).focus();
}
