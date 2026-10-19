import React, { createContext, useContext, useRef } from 'react';

const LenisContext = createContext(null);

/**
 * Smooth-scroll (Lenis) is intentionally disabled.
 *
 * Lenis replaces native scrolling with a JS-driven animation on the main thread,
 * so every wheel/touch scroll was eased over several frames (felt slow/floaty) and
 * stuttered whenever React, framer-motion or the hero shader were busy. Native
 * scrolling runs on the compositor thread and stays smooth regardless.
 *
 * All callers already fall back to window.scrollTo when window.lenis is absent,
 * so the provider is kept as a no-op to avoid touching every consumer.
 */
export function LenisProvider({ children }) {
  const lenisRef = useRef(null);
  return <LenisContext.Provider value={lenisRef}>{children}</LenisContext.Provider>;
}

export const useLenisInstance = () => useContext(LenisContext);
