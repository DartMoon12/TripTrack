// src/components/Routes/RouteStorageContext.jsx

import React, { createContext, useContext, useState } from 'react';

// Mock data (pro start)
const initialMockRoutes = [
  {
    id: 'r1',
    name: 'Pražský okruh (Autem)',
    distance: '35 km',
    duration: '45 min',
    savedDate: '15. 10. 2025',
    points: [{ lat: 50.08, lng: 14.4 }, { lat: 50.1, lng: 14.5 }], // Zkrácené body
  },
  {
    id: 'r2',
    name: 'Vltavská cyklostezka (Kolo)',
    distance: '15.2 km',
    duration: '55 min',
    savedDate: '10. 10. 2025',
    points: [{ lat: 50.05, lng: 14.45 }, { lat: 50.07, lng: 14.5 }],
  },
];

const RouteContext = createContext();

export function useRoutesStorage() {
  return useContext(RouteContext);
}

export function RouteStorageProvider({ children }) {
  const [routes, setRoutes] = useState(initialMockRoutes);

  // Funkce pro uložení nové trasy
  const saveRoute = (routeData) => {
    const newRoute = {
      ...routeData,
      id: `r${Date.now()}`, // Generování unikátního ID
      savedDate: new Date().toLocaleDateString('cs-CZ'),
    };
    setRoutes((prev) => [...prev, newRoute]);
    return newRoute.id;
  };

  // Funkce pro smazání trasy
  const deleteRoute = (id) => {
    setRoutes((prev) => prev.filter(route => route.id !== id));
  };
  
  // Funkce pro získání trasy podle ID
  const getRouteById = (id) => {
    return routes.find(route => route.id === id);
  };

  const value = {
    routes,
    saveRoute,
    deleteRoute,
    getRouteById,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}