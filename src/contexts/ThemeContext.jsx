import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ThemeContext } from "./theme";

const STORAGE_KEY = "civicnest-theme";

/** Saved choice, else the device setting (same rule as the inline script in index.html) */
const initialTheme = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // storage blocked: fall through to the device setting
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
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
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // not persisted; the choice still applies for this visit
    }
    return () => {
      clearTimeout(timer);
      root.classList.remove("theme-switching");
    };
  }, [theme]);

  const setTheme = useCallback((t) => setThemeState(t === "dark" ? "dark" : "light"), []);
  const toggle = useCallback(() => setThemeState((t) => (t === "dark" ? "light" : "dark")), []);
  const value = useMemo(() => ({ theme, isDark: theme === "dark", toggle, setTheme }), [theme, toggle, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
