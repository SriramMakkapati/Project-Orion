import { create } from "zustand";

export const useThemeStore = create((set, get) => ({
  theme: "dark", // "dark" | "light" | "midnight"

  setTheme: (theme) => {
    set({ theme });
    if (typeof window !== "undefined") {
      localStorage.setItem("research-agent-theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
    }
  },

  initTheme: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("research-agent-theme") || "dark";
      set({ theme: saved });
      document.documentElement.setAttribute("data-theme", saved);
    }
  },
}));
