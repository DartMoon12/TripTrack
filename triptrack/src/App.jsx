import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Navbar from './componets/navbar/navbar'
import Main from './componets/main/MainPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Login from './pages/Login'
import Register from './pages/Register'
// Firestore test code removed to avoid 400 errors when unauthenticated
import MapPage from './pages/MapPage'

function App() {
  const [count, setCount] = useState(0)

  // Removed Firestore write/read side-effect during app load

  return (
    <div className="app-root">
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<PrivateRoute />}>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Main />} />
          <Route path="/mapa" element={<MapPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export default App
