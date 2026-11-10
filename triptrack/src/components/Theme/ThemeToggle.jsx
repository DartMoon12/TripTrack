// src/components/Theme/ThemeToggle.jsx

import React from 'react';
import { useTheme } from './ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="icon-btn"
      aria-label={isLight ? 'Přepnout na tmavý režim' : 'Přepnout na světlý režim'}
      title={isLight ? 'Tmavý režim' : 'Světlý režim'}
    >
      {isLight ? <FaMoon size={16} /> : <FaSun size={16} />}
    </button>
  );
}
