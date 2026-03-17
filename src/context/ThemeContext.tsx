"use client";
import React, { createContext, useContext } from "react";
import { useLocalStorageContext } from "@/context/LocalStorageContext";

export const Themes = ["light", "dark"] as const;
export type Theme = (typeof Themes)[number];

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useLocalStorageContext();

  const theme: Theme = settings.theme as Theme;
  const setTheme = (theme: Theme) => updateSettings({ theme });
  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};