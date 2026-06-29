export type AppTheme = "default" | "light" | "dark";

const STORAGE_KEY = "athletigolf-theme";

export function applyTheme(theme: string | null | undefined) {
  const nextTheme = normalizeTheme(theme);
  const root = document.documentElement;

  if (nextTheme === "default") {
    root.removeAttribute("data-theme");
  } else {
    root.setAttribute("data-theme", nextTheme);
  }

  localStorage.setItem(STORAGE_KEY, nextTheme);
  return nextTheme;
}

export function getStoredTheme() {
  return normalizeTheme(localStorage.getItem(STORAGE_KEY));
}

export function normalizeTheme(theme: string | null | undefined): AppTheme {
  return theme === "light" || theme === "dark" ? theme : "default";
}
