"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type Mode = "light" | "dark" | "system";

interface ThemeState {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeState>({
  mode: "system",
  setMode: () => {},
});

const STORAGE_KEY = "cfm-theme";

/** Inline pre-paint script: apply the stored theme before first paint (no FOUC). */
export const themeInitScript = `(function(){try{var m=localStorage.getItem('${STORAGE_KEY}');if(m&&m!=='system'){document.documentElement.setAttribute('data-theme',m);}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("system");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Mode | null;
    if (saved) setModeState(saved);
  }, []);

  const apply = useCallback((m: Mode) => {
    const root = document.documentElement;
    if (m === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", m);
  }, []);

  useEffect(() => {
    apply(mode);
  }, [mode, apply]);

  const setMode = useCallback((m: Mode) => {
    try {
      localStorage.setItem(STORAGE_KEY, m);
    } catch {
      /* ignore */
    }
    setModeState(m);
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
