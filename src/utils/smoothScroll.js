// The running Lenis instance, set by <SmoothScroll /> (null on touch devices
// or with reduced motion). Lenis itself only puts an info object on
// window.lenis, so callers use these helpers instead.
let activeLenis = null;

export const setActiveLenis = (lenis) => {
  activeLenis = lenis;
};

/** Scroll the page to the top, smoothly when smooth scrolling is on */
export function scrollToTop({ immediate = false } = {}) {
  if (activeLenis) activeLenis.scrollTo(0, { immediate, force: true });
  else window.scrollTo({ top: 0, behavior: immediate ? "auto" : "smooth" });
}
