"use client";

import { useTheme } from "./ThemeProvider";

const NEXT: Record<string, "light" | "dark" | "system"> = {
  light: "dark",
  dark: "system",
  system: "light",
};
const ICON: Record<string, string> = { light: "☀️", dark: "🌙", system: "🖥️" };

/** Cycles light → dark → system. Labeled for screen readers. */
export function ThemeToggle() {
  const { mode, setMode } = useTheme();
  return (
    <button
      type="button"
      className="icon-btn"
      onClick={() => setMode(NEXT[mode])}
      aria-label={`Theme: ${mode}. Switch to ${NEXT[mode]}.`}
      title={`Theme: ${mode}`}
    >
      <span aria-hidden>{ICON[mode]}</span>
    </button>
  );
}
