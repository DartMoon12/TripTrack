// src/components/Theme/ThemeToggle.jsx

import React from 'react';
import { useTheme } from './ThemeContext'; // Napojíme se na náš kontext
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  // Vytáhneme si aktuální téma a funkci na přepnutí
  const { theme, toggleTheme } = useTheme();

  return (
    <button 
      onClick={toggleTheme} 
      className={`btn btn-sm border-0 rounded-circle d-flex align-items-center justify-content-center ${theme === 'light' ? 'btn-outline-dark' : 'btn-outline-light'}`}
      style={{ width: '38px', height: '38px' }}
      title={theme === 'light' ? "Přepnout na tmavý režim" : "Přepnout na světlý režim"}
    >
      {/* Podmínka: Je světlo? Ukaž Měsíc. Je tma? Ukaž Slunce. */}
      {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
    </button>
  );
}