// src/components/Theme/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

// Výchozí téma: uložená volba uživatele, jinak nastavení systému.
function getInitialTheme() {
  try {
    const saved = localStorage.getItem('app-theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Bootstrap i naše CSS proměnné se řídí atributem data-bs-theme
    document.documentElement.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('app-theme', theme);
    } catch {
      // Soukromé okno / zablokované úložiště – téma jen nepřežije obnovení stránky
    }
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
