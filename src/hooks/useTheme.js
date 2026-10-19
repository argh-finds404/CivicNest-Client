import { useContext } from 'react';
import { ThemeContext } from '../contexts/theme';

/** { theme, isDark, toggle, setTheme } from the app-wide ThemeProvider */
export function useTheme() {
  return useContext(ThemeContext);
}
