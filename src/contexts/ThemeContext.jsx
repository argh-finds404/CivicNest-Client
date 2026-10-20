import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "./theme";

// Only an explicit choice is saved, so everyone else starts in light mode.
// (The old "civicnest-theme" key also stored the device default, so it is ignored.)
const STORAGE_KEY = "civicnest-theme-choice";

/** Saved choice, else light (same rule as the inline script in index.html) */
const initialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // storage blocked: use the default
  }
  return "light";
};

const remember = (theme) => {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // not persisted; the choice still applies for this visit
  }
};

/**
 * One source of truth for light/dark. Applies the theme to <html> (Tailwind
 * `.dark`, daisyUI `data-theme`, native `color-scheme`) and lets every
 * component re-render when it changes.
 */
export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme);
  const isFirst = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    let timer;
    if (!isFirst.current) {
      // Fade colours only during an actual switch (see .theme-switching in index.css)
      root.classList.add("theme-switching");
      timer = setTimeout(() => root.classList.remove("theme-switching"), 450);
    }
    isFirst.current = false;
    root.classList.toggle("dark", theme === "dark");
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    return () => {
      clearTimeout(timer);
      root.classList.remove("theme-switching");
    };
  }, [theme]);

  const setTheme = useCallback((t) => {
    const next = t === "dark" ? "dark" : "light";
    remember(next);
    setThemeState(next);
  }, []);
  const toggle = useCallback(() => {
    setThemeState((t) => {
      const next = t === "dark" ? "light" : "dark";
      remember(next);
      return next;
    });
  }, []);
  const value = useMemo(() => ({ theme, isDark: theme === "dark", toggle, setTheme }), [theme, toggle, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
