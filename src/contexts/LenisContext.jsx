import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import Lenis from 'lenis';

const LenisContext = createContext(null);

const HEAVY_ROUTES = ['/map', '/ai-assistant'];

export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  const location = useLocation();
  const isHeavy = HEAVY_ROUTES.some((path) => location.pathname.startsWith(path));

  useEffect(() => {
    let lenis = null;
    let rafId = null;
    let resizeObserver = null;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (!prefersReducedMotion && !isHeavy) {
      // Initialize Lenis only on non-heavy routes
      lenis = new Lenis({ 
        lerp: 0.1,              // Responsive deceleration factor
        duration: 1.2,          // Ideal animation length
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
      });
      
      lenisRef.current = lenis;
      window.lenis = lenis;

      // Apply the recommended classes to html root
      document.documentElement.classList.add('lenis', 'lenis-smooth');

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);

      // Setup ResizeObserver to handle dynamic height changes
      resizeObserver = new ResizeObserver(() => {
        lenis.resize();
      });
      if (document.body) {
        resizeObserver.observe(document.body);
      }
    } else {
      // Ensure Lenis reference and window object are cleared on heavy routes
      lenisRef.current = null;
      if (window.lenis) {
        delete window.lenis;
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (resizeObserver) resizeObserver.disconnect();
      if (lenis) {
        lenis.destroy();
        delete window.lenis;
      }
      document.documentElement.classList.remove('lenis', 'lenis-smooth');
    };
  }, [isHeavy]);

  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

export const useLenisInstance = () => useContext(LenisContext);
