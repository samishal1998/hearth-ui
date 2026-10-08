import { nextTick, onBeforeUnmount, watch, type Ref } from "vue";
import { positionPopup, focusComposed } from "./primitives";

/** The native top layer keeps overlays out of clipped ancestors without losing theme inheritance. */
export function useFloating(
  anchor: Ref<HTMLElement | undefined>,
  panel: Ref<HTMLElement | undefined>,
  open: Ref<boolean>,
  placement: () => "top" | "bottom" | "left" | "right",
  docked: () => boolean = () => false,
) {
  let observer: ResizeObserver | undefined;
  let frame = 0;
  let disposed = false;
  function position() {
    const a = anchor.value,
      p = panel.value;
    if (!a || !p || !open.value) return;
    if (docked()) {
      p.style.removeProperty("left");
      p.style.removeProperty("top");
      return;
    }
    positionPopup(a, p, { side: placement() });
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
    window.visualViewport?.removeEventListener("resize", schedule);
    window.visualViewport?.removeEventListener("scroll", schedule);
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
      if (disposed || !open.value) return;
      stop();
      position();
      observer = new ResizeObserver(schedule);
      if (anchor.value) observer.observe(anchor.value);
      if (panel.value) observer.observe(panel.value);
      window.addEventListener("resize", schedule);
      window.addEventListener("scroll", schedule, true);
      window.visualViewport?.addEventListener("resize", schedule);
      window.visualViewport?.addEventListener("scroll", schedule);
    },
    { flush: "post" },
  );
  watch(
    docked,
    () => {
      if (open.value) position();
    },
    { flush: "post" },
  );
  onBeforeUnmount(() => {
    disposed = true;
    stop();
  });
  return { position };
}

/** Include slotted content and open custom-element roots when finding a focus target. */
export function focusFirst(root: HTMLElement) {
  focusComposed(root);
}
