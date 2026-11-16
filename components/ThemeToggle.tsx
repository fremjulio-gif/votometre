"use client";

import { useTheme } from "./theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-1.5 rounded-lg bg-secondary hover:bg-muted text-foreground transition-colors border border-border"
      aria-label="Basculer le thème"
      title="Basculer le thème"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-sky-400" />
      )}
    </button>
  );
}
