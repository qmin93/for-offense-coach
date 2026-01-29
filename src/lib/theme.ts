// ============================================
// Theme Toggle Utilities
// Manage dark/light theme persistence
// ============================================

export type ThemeMode = "dark" | "light";

const THEME_STORAGE_KEY = "theme";

/**
 * Get current theme from localStorage (defaults to "dark")
 */
export function getTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) || "dark";
}

/**
 * Set theme and persist to localStorage
 */
export function setTheme(mode: ThemeMode): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  document.documentElement.dataset.theme = mode;
}

/**
 * Toggle between dark and light theme
 */
export function toggleTheme(): ThemeMode {
  const current = getTheme();
  const next: ThemeMode = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/**
 * Initialize theme on app load
 * Call this once in the root layout (client-side)
 */
export function initTheme(): void {
  if (typeof window === "undefined") return;

  // Check for stored preference
  const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;

  if (stored) {
    document.documentElement.dataset.theme = stored;
    return;
  }

  // Check system preference
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const mode: ThemeMode = prefersDark ? "dark" : "light";

  document.documentElement.dataset.theme = mode;
  localStorage.setItem(THEME_STORAGE_KEY, mode);
}

/**
 * Subscribe to system theme changes
 */
export function onSystemThemeChange(callback: (mode: ThemeMode) => void): () => void {
  if (typeof window === "undefined") return () => {};

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent) => {
    const mode: ThemeMode = e.matches ? "dark" : "light";
    callback(mode);
  };

  mediaQuery.addEventListener("change", handler);
  return () => mediaQuery.removeEventListener("change", handler);
}
