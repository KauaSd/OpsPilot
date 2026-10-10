"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-8 h-8 rounded bg-surface-container-highest/20 animate-pulse" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center w-8 h-8 rounded text-inverse-on-surface/70 hover:text-inverse-on-surface hover:bg-surface-container-highest/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inverse-primary"
      aria-label={isDark ? "Alternar para tema claro" : "Alternar para tema escuro"}
      title={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden="true" />
      )}
    </button>
  );
}
