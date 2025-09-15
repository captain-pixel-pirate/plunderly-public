"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { ThemeProvider, CssBaseline } from "@mui/material";

import {
  THEMES,
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type ThemeKey,
} from "@theme/theme";

type Ctx = {
  mode: ThemeKey;
  setMode: (m: ThemeKey) => void;
};
const ThemeModeContext = createContext<Ctx | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeKey>(DEFAULT_THEME);

  useEffect(() => {
    const saved = (typeof window !== "undefined" &&
      localStorage.getItem(THEME_STORAGE_KEY)) as ThemeKey | null;
    if (saved && saved in THEMES) setMode(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(THEME_STORAGE_KEY, mode);
  }, [mode]);

  const theme = useMemo(() => THEMES[mode], [mode]);

  const value = useMemo(() => ({ mode, setMode }), [mode]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx)
    throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}
