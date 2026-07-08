import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type ThemeMode = 'light' | 'dark' | 'system';
type AccentColor = 'emerald' | 'blue' | 'purple' | 'orange';

interface ThemeContextType {
  mode: ThemeMode;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>('light');
  const [accent, setAccent] = useState<AccentColor>('emerald');

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (mode === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      // System mode logic (optional, defaults to light for now)
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, accent, setMode, setAccent }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};
