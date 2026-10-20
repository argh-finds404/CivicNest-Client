import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { setActiveLenis } from "../../utils/smoothScroll";

/** True while a modal, drawer or SweetAlert has locked the page scroll */
const pageScrollLocked = () => {
  const html = getComputedStyle(document.documentElement).overflowY;
  const body = getComputedStyle(document.body).overflowY;
  return html === "hidden" || body === "hidden";
};

/**
 * Smooth, eased wheel scrolling for mouse and trackpad users (Lenis).
 * Touch devices keep native momentum scrolling, and people who prefer
 * reduced motion keep normal scrolling. Inner scroll areas (chat panels,
 * dropdowns, modals) and maps scroll on their own.
 */
export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const touchOnly = window.matchMedia("(pointer: coarse)").matches && !window.matchMedia("(any-pointer: fine)").matches;
    if (reduce || touchOnly) return undefined;

    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1,
      smoothWheel: true,
      syncTouch: false,
      allowNestedScroll: true,
      autoRaf: true,
      prevent: (node) =>
        !!node.closest?.('.leaflet-container, [data-lenis-prevent], [role="dialog"], .modal, .swal2-container, textarea'),
    });
    lenisRef.current = lenis;
    setActiveLenis(lenis);

    // Respect scroll locks set by modals and the mobile menu
    const sync = () => (pageScrollLocked() ? lenis.stop() : lenis.start());
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["style", "class"] });
    observer.observe(document.body, { attributes: true, attributeFilter: ["style", "class"] });
    sync();

    return () => {
      observer.disconnect();
      lenis.destroy();
      lenisRef.current = null;
      setActiveLenis(null);
    };
  }, []);

  // After a route change, ScrollRestoration has already moved the page; make
  // Lenis start from there instead of finishing the old page's glide
  useEffect(() => {
    lenisRef.current?.scrollTo(window.scrollY, { immediate: true, force: true });
  }, [pathname]);

  return null;
}
