"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const THEME_ORDER = ["light", "dark", "system"] as const;

function getNextTheme(theme: string | undefined) {
  const currentIndex = THEME_ORDER.indexOf((theme as (typeof THEME_ORDER)[number]) ?? "system");
  const safeIndex = currentIndex === -1 ? 2 : currentIndex;
  return THEME_ORDER[(safeIndex + 1) % THEME_ORDER.length];
}

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, resolvedTheme, setTheme } = useTheme();

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by rendering a generic placeholder button with the exact same dimensions
  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition-colors dark:border-neutral-800 dark:text-neutral-200"
      >
        <div className="h-4 w-4" /> {/* Placeholder for the icon */}
      </button>
    );
  }

  const activeTheme = theme ?? "system";
  const effectiveTheme = activeTheme === "system" ? (resolvedTheme ?? "light") : activeTheme;
  const isDark = effectiveTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(getNextTheme(activeTheme))}
      aria-label={`Theme: ${activeTheme}. Click to switch theme.`}
      title={`Theme: ${activeTheme}`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 transition-colors hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-900"
    >
      {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
    </button>
  );
}