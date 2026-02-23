// src/components/Theme/ThemeContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';

// 1. Vytvoříme "krabici" pro téma
const ThemeContext = createContext();

// 2. Vlastní Hook, abychom mohli téma používat všude (např. v Navbaru)
export function useTheme() {
  return useContext(ThemeContext);
}

// 3. Poskytovatel (Provider) - ten obalí celou aplikaci
export function ThemeProvider({ children }) {
  
  // --- STAV ---
  // Tady zjistíme, jestli už uživatel někdy na webu byl a co si nastavil.
  // Pokud nic v 'localStorage' není, dáme základní 'light' (světlý).
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('app-theme');
    return savedTheme || 'light';
  });

  // --- EFEKT: ZMĚNA VZHLEDU ---
  // Tohle se spustí vždy, když se změní proměnná 'theme'.
  useEffect(() => {
    // A) Nastavíme atribut přímo na hlavní element HTML.
    // Bootstrap se podle toho zařídí a přebarví své komponenty.
    document.documentElement.setAttribute('data-bs-theme', theme);
    
    // B) Uložíme volbu do prohlížeče, aby to vydrželo i po obnovení stránky (F5).
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // --- FUNKCE PRO PŘEPÍNÁNÍ ---
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // --- ODESLÁNÍ DÁL ---
  const value = { theme, toggleTheme };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}