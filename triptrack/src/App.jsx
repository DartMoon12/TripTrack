// src/App.jsx

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
import { Toaster } from 'react-hot-toast';

// 💥 OPRAVA IMPORTU: Použij název 'Favorite' (nebo jak se jmenuje tvůj export)
// a správnou cestu k souboru Favorite.jsx
import Favorite from './components/Favorite/Favorite'; // Zkontroluj cestu!

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-root">
      <RouteStorageProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <Routes>

          {/* VEŘEJNÉ ROUTY */}
          <Route path="/" element={<Main />} />
          <Route path="/home" element={<Main />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* CHRÁNĚNÉ ROUTY */}
          <Route element={<PrivateRoute />}>
            <Route path="/mapa" element={<TripMap />} />
            <Route path="/trasa" element={<RoutesPage />} />

            {/* 💥 OPRAVA ROUTY: Použij správný název komponenty */}
            <Route path="/oblibene" element={<Favorite />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RouteStorageProvider>
    </div>
  )
}

export default App