import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeMode } from "@/types";

const THEME_KEY = "webpros-theme";

function getInitialTheme(): ThemeMode {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

function applyTheme(themeMode: ThemeMode) {
  document.documentElement.setAttribute("data-theme", themeMode);
  localStorage.setItem(THEME_KEY, themeMode);
}

interface AppState {
  themeMode: ThemeMode;
  collapsed: boolean;
  primaryColor: string;
  locked: boolean;
  setThemeMode: (themeMode: ThemeMode) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setPrimaryColor: (primaryColor: string) => void;
  lock: () => void;
  unlock: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      themeMode: getInitialTheme(),
      collapsed: false,
      primaryColor: "#165dff",
      locked: false,
      setThemeMode: (themeMode) => {
        applyTheme(themeMode);
        set({ themeMode });
      },
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setPrimaryColor: (primaryColor) => set({ primaryColor }),
      lock: () => set({ locked: true }),
      unlock: () => set({ locked: false }),
    }),
    {
      name: "webpros-app",
      partialize: (state) => ({
        themeMode: state.themeMode,
        collapsed: state.collapsed,
        primaryColor: state.primaryColor,
        locked: state.locked,
      }),
    },
  ),
);
