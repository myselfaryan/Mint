"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_COOKIE_KEY = "mint-theme-preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Try to get theme from cookie during initialization
    const savedTheme = Cookies.get(THEME_COOKIE_KEY) as Theme | undefined;
    return savedTheme || "system";
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    // Save theme preference to cookie
    Cookies.set(THEME_COOKIE_KEY, newTheme, { expires: 365 }); // Cookie expires in 1 year
  };

  useEffect(() => {
    const root = window.document.documentElement;

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";

      // Remove the opposite theme before adding the system theme
      root.classList.remove(systemTheme === "dark" ? "light" : "dark");
      root.classList.add(systemTheme);
    } else {
      // Remove the opposite theme before adding the new theme
      root.classList.remove(theme === "dark" ? "light" : "dark");
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
