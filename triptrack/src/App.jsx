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
import Favorite from './components/Favorite/Favorite';
// 💥 1. Import Footeru
import Footer from './components/Footer/Footer';

function App() {
  const [count, setCount] = useState(0)

  return (
    // 💥 2. Změna hlavního divu: Přidány třídy pro Flexbox layout na celou výšku
    <div className="app-root d-flex flex-column min-vh-100">
      <RouteStorageProvider>
        <Toaster position="top-center" reverseOrder={false} />
        
        <Navbar />

        {/* 💥 3. Wrapper obsahu: 'flex-grow-1' zajistí, že tento div zabere veškeré volné místo */}
        {/* Tím se Footer automaticky posune až na úplný spodek stránky */}
        <div className="flex-grow-1">
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
              <Route path="/oblibene" element={<Favorite />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* 💥 4. Vložení Footeru nakonec */}
        <Footer />

      </RouteStorageProvider>
    </div>
  )
}

export default App