import { useState } from 'react'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; 
import Navbar from './components/Navbar/navbar'
import Main from './components/Main/MainPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute' 
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import TripMap from './components/Map/TripMap'
import RoutesPage from './components/RoutesPage/RoutesPage' 
import { RouteStorageProvider } from './Hooks/RouteStorageContext'; 

function App() {
  const [count, setCount] = useState(0)
  // ... (useState a další věci zůstávají) ...

  return (
    <div className="app-root">
      <RouteStorageProvider>
      <Navbar />
      <Routes>
        
        {/* ==================================== */}
        {/* VEŘEJNÉ ROUTY (Není potřeba login) */}
        {/* ==================================== */}
        
        {/* 1. Hlavní (DOMŮ) stránka je vždy veřejná */}
        <Route path="/" element={<Main />} />
        <Route path="/home" element={<Main />} />
        
        {/* 2. Login a Registrace jsou vždy veřejné */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ==================================== */}
        {/* CHRÁNĚNÉ ROUTY (Vyžadují login) */}
        {/* ==================================== */}

        <Route element={<PrivateRoute />}>
          {/* Všechny vnořené routy se zobrazí, jen když je uživatel přihlášen */}
          <Route path="/mapa" element={<TripMap />} />
          
          {/* 💥 NOVÁ CHRÁNĚNÁ ROUTA pro Trasy */}
          <Route path="/trasa" element={<RoutesPage />} />
          
          {/* Přidej sem další chráněné routy: /oblibene, /profile, atd. */}
        </Route>

        {/* Pokud se router nedostane na žádnou shodu, přesměrujeme na veřejnou domovskou stránku */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </RouteStorageProvider>
    </div>
  )
}

export default App