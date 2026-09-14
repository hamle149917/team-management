'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

export const defaultAppearance = {
  theme: 'dark',
  accent: '#4f8cff',
  sidebar: '#111827',
  panel: '#111827',
  font: 'Manrope',
  density: 'comfortable',
};

const fontStacks = {
  Manrope: 'Manrope, sans-serif',
  Outfit: 'Outfit, sans-serif',
  'IBM Plex Sans': 'IBM Plex Sans, sans-serif',
};

export function ThemeProvider({ children }) {
  const [appearance, setAppearance] = useState(defaultAppearance);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    queueMicrotask(() => {
      if (!active) return;

      try {
        const savedAppearance = localStorage.getItem('team-appearance');
        if (savedAppearance) {
          setAppearance({ ...defaultAppearance, ...JSON.parse(savedAppearance) });
        }
      } catch {
        localStorage.removeItem('team-appearance');
      }

      setHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    root.setAttribute('data-theme', appearance.theme);
    root.style.setProperty('--accent', appearance.accent);
    root.style.setProperty('--accent-soft', `${appearance.accent}22`);
    root.style.setProperty('--sidebar-custom', appearance.sidebar);
    root.style.setProperty('--panel-custom', appearance.panel);
    root.style.setProperty('--font-custom', fontStacks[appearance.font] || fontStacks.Manrope);
    root.setAttribute('data-density', appearance.density);
    localStorage.setItem('team-appearance', JSON.stringify(appearance));
  }, [appearance, hydrated]);

  const updateAppearance = (changes) => {
    setAppearance((current) => ({ ...current, ...changes }));
  };

  const value = useMemo(() => ({
    ...appearance,
    appearance,
    setTheme: (theme) => updateAppearance({ theme }),
    updateAppearance,
    resetAppearance: () => setAppearance(defaultAppearance),
  }), [appearance]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
