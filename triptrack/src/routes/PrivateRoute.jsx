// src/routes/PrivateRoute.jsx

import React from 'react';
// Importujeme nástroje pro přesměrování a zobrazení obsahu
import { Navigate, Outlet, useLocation } from 'react-router-dom';
// Importujeme náš "mozek", který ví, kdo je přihlášený
import { useAuth } from '../components/Auth/AuthContext'; 

export default function PrivateRoute() {
  // --- 1. ZÍSKÁNÍ DAT ---
  // Ptáme se AuthContextu: "Kdo je tu? A načítáš ještě data z Firebase?"
  const { currentUser, loading } = useAuth(); 
  
  // Zjistíme, kde se uživatel zrovna nachází (na jaké URL chtěl jít)
  const location = useLocation();

  // --- 2. ČEKÁNÍ (LOADING) ---
  // Tohle je SUPER DŮLEŽITÉ. Firebase chvilku trvá, než zjistí, jestli jsi přihlášený.
  // Kdybychom tu tuhle podmínku neměli, aplikace by si myslela, že 'currentUser' je null,
  // a okamžitě by tě vykopla na Login, i když jsi ve skutečnosti přihlášený.
  if (loading) {
    // Zatímco čekáme, ukážeme jen text nebo točící kolečko.
    return <div className="text-center p-5">Ověřuji uživatele...</div>; 
  }

  // --- 3. ROZHODOVÁNÍ (LOGIKA VYHAZOVAČE) ---
  
  if (currentUser) {
    // A) Uživatel JE přihlášený.
    // <Outlet /> je speciální značka React Routeru. 
    // Znamená to: "Vykresli tu stránku, která je schovaná uvnitř této PrivateRoute."
    // (Tzn. pokud jsi šel na /mapa, Outlet vykreslí Mapu).
    return <Outlet />;
    
  } else {
    // B) Uživatel NENÍ přihlášený.
    // Musíme ho přesměrovat na přihlášení.
    
    return <Navigate 
      to="/login" 
      // Tady děláme chytrou věc: Do "batůžku" (state) mu přibalíme informaci,
      // odkud přišel (location). Až se přihlásí, Login.jsx se do batůžku podívá
      // a vrátí ho zpátky sem (třeba na Mapu), místo aby šel na úvodní stránku.
      state={{ from: location }} 
      replace // Nahradí historii, aby šipka "Zpět" nevracela na chráněnou stránku
    />;
  }
}