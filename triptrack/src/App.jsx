import { useState } from 'react'
import './App.css'
import Navbar from './components/Navbar/navbar'
import Main from './components/Main/MainPage'
import { Routes, Route, Navigate } from 'react-router-dom'
import PrivateRoute from './routes/PrivateRoute'
import Login from './components/Auth/Login'
import Register from './components/Auth/Register'
import TripMap from './components/Map/TripMap'


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
          <Route path="/mapa" element={<TripMap />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </div>
  )
}

export default App
