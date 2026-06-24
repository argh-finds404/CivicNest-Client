import { useEffect, useLayoutEffect, useMemo } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';

/** Routes where smooth scroll conflicts with maps / heavy UIs */
const HEAVY_ROUTES = ['/map', '/ai-assistant'];

export function useLenis(options = {}) {
  const location = useLocation();

  const isHeavyRoute = useMemo(
    () => HEAVY_ROUTES.some((path) => location.pathname.startsWith(path)),
    [location.pathname]
  );

  useLayoutEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion || isHeavyRoute) {
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
      if (window.lenis) {
        window.lenis.destroy();
        delete window.lenis;
      }
      return undefined;
    }

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.2,
      autoRaf: true,
      ...options,
    });

    window.lenis = lenis;
    document.documentElement.classList.add('lenis', 'lenis-smooth');

    return () => {
      lenis.destroy();
      delete window.lenis;
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [isHeavyRoute]);
}

/** Read scroll position from Lenis when active, otherwise native scroll */
export function getScrollY() {
  return window.lenis?.scroll ?? window.scrollY;
}
