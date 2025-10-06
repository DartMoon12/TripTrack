import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute() {
  const { currentUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
        <div className="text-muted">Načítání…</div>
      </div>
    )
  }

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}


