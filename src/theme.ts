export type Theme = "dark" | "light";

const STORAGE_KEY = "fightcalendar.theme";

// Same precedence as language: explicit choice (localStorage) wins, then
// fall back to the OS/browser preference, then default to dark since
// that's the theme every screen was actually designed against.
export function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  if (window.matchMedia("(prefers-color-scheme: light)").matches) return "light";
  return "dark";
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.bsTheme = theme;
  localStorage.setItem(STORAGE_KEY, theme);
}
