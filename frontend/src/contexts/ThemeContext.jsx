// filepath: c:\Users\ahmad\Documents\JavaScript Playground\cfm_starter\frontend\src\contexts\ThemeContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext();

const THEME_KEY = "cfm-theme";
const THEMES = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(THEMES.SYSTEM);
  const [actualTheme, setActualTheme] = useState(THEMES.LIGHT);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      setTheme(savedTheme);
    } else {
      // Default to system preference
      setTheme(THEMES.SYSTEM);
    }
  }, []);

  // Update actual theme based on theme setting and system preference
  useEffect(() => {
    const updateActualTheme = () => {
      let newActualTheme;

      if (theme === THEMES.SYSTEM) {
        // Follow system preference
        newActualTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? THEMES.DARK
          : THEMES.LIGHT;
      } else {
        newActualTheme = theme;
      }

      setActualTheme(newActualTheme);

      // Apply theme to document root using data-theme attribute
      document.documentElement.setAttribute("data-theme", newActualTheme);

      // Also add/remove class for compatibility with your existing dark-mode class
      if (newActualTheme === THEMES.DARK) {
        document.documentElement.classList.add("dark-mode");
        document.documentElement.classList.remove("light-mode");
      } else {
        document.documentElement.classList.add("light-mode");
        document.documentElement.classList.remove("dark-mode");
      }

      // Update meta theme-color for mobile browsers
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute(
          "content",
          newActualTheme === THEMES.DARK ? "#0f172a" : "#ffffff"
        );
      }
    };

    updateActualTheme();

    // Listen for system theme changes only if using system theme
    if (theme === THEMES.SYSTEM) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateActualTheme);

      return () => {
        mediaQuery.removeEventListener("change", updateActualTheme);
      };
    }
  }, [theme]);

  const setThemeMode = (newTheme) => {
    if (Object.values(THEMES).includes(newTheme)) {
      setTheme(newTheme);
      localStorage.setItem(THEME_KEY, newTheme);
    }
  };

  const toggleTheme = () => {
    if (actualTheme === THEMES.LIGHT) {
      setThemeMode(THEMES.DARK);
    } else {
      setThemeMode(THEMES.LIGHT);
    }
  };

  const value = {
    theme,
    actualTheme,
    isDark: actualTheme === THEMES.DARK,
    isLight: actualTheme === THEMES.LIGHT,
    isSystem: theme === THEMES.SYSTEM,
    setTheme: setThemeMode,
    toggleTheme,
    themes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
