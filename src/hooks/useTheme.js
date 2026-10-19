import { useState, useEffect, useRef } from 'react';

export function useTheme() {
  const [isDark, setIsDark] = useState(() => {
    // 1. Check localStorage first
    const saved = localStorage.getItem('civicnest-theme');
    if (saved) return saved === 'dark';
    // 2. Default to light mode (false) by default
    return false;
  });

  const isFirstRun = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    let timer;
    // Fade colours only on a real toggle, not on mount
    if (!isFirstRun.current && root.classList.contains('dark') !== isDark) {
      root.classList.add('theme-switching');
      timer = setTimeout(() => root.classList.remove('theme-switching'), 450);
    }
    isFirstRun.current = false;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('civicnest-theme', isDark ? 'dark' : 'light');
    return () => {
      clearTimeout(timer);
      root.classList.remove('theme-switching');
    };
  }, [isDark]);

  const toggle = () => setIsDark(prev => !prev);

  return { isDark, toggle };
}
