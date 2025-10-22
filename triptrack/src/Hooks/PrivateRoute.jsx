// src/routes/PrivateRoute.jsx

import React from 'react';
// Předpokládáme, že cesta je správná, např. 'cesta/k/AuthContext'
import { useAuth } from '../components/Auth/AuthContext'; 
import { Navigate, Outlet, useLocation } from 'react-router-dom';

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth(); // 💥 Využití hooku
  const location = useLocation();

  // Během načítání stavu (AuthContext.loading je true), zobrazíme Načítání
  if (loading) {
    // Můžeš zde vrátit spinner nebo prázdný div, aby se netřepal layout
    return <div>Načítání autentizace...</div>; 
  }

  // Hlavní logika: Je uživatel přihlášený?
  if (currentUser) {
    // Ano: Povolíme renderovat vnořené routy (pomocí <Outlet />)
    return <Outlet />;
  } else {
    // Ne: Přesměrujeme ho na login a uložíme jeho cílovou URL do state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
}