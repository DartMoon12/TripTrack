import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar/navbar'
import Footer from './components/Footer/Footer'
import Main from './components/Main/MainPage'
import PrivateRoute from './routes/PrivateRoute'
import { RouteStorageProvider } from './Hooks/RouteStorageContext'
import { useTheme } from './components/Theme/ThemeContext'

// Stránky načítáme až ve chvíli, kdy je uživatel otevře (code splitting).
// Úvodní stránka se tak načte rychleji – nemusí stahovat Google Maps ani formuláře.
const Login = lazy(() => import('./components/Auth/Login'))
const Register = lazy(() => import('./components/Auth/Register'))
const TripMap = lazy(() => import('./components/Map/TripMap'))
const RoutesPage = lazy(() => import('./components/RoutesPage/RoutesPage'))
const Favorite = lazy(() => import('./components/Favorite/Favorite'))
const Terms = lazy(() => import('./components/Legal/Terms'))
const Privacy = lazy(() => import('./components/Legal/Privacy'))

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="spinner" />
      <span className="visually-hidden">Načítám…</span>
    </div>
  )
}

// Po přechodu na jinou stránku vyroluje nahoru (React Router to sám nedělá).
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  const { theme } = useTheme()
  const { pathname } = useLocation()
  // Na mapě je patička zbytečná – mapa zabírá celou obrazovku.
  const isMapPage = pathname.startsWith('/mapa')

  return (
    <div className="app-root d-flex flex-column min-vh-100">
      <RouteStorageProvider>
        <ScrollToTop />
        <Toaster
          position="top-center"
          toastOptions={{
            className: 'app-toast',
            style: theme === 'dark' ? { background: '#1f242d', color: '#e6e8ec' } : undefined,
          }}
        />

        <Navbar />

        <main className="flex-grow-1 d-flex flex-column">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Veřejné stránky */}
              <Route path="/" element={<Main />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/podminky" element={<Terms />} />
              <Route path="/ochrana-soukromi" element={<Privacy />} />

              {/* Stránky jen pro přihlášené */}
              <Route element={<PrivateRoute />}>
                <Route path="/mapa" element={<TripMap />} />
                <Route path="/trasa" element={<RoutesPage />} />
                <Route path="/oblibene" element={<Favorite />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>

        {!isMapPage && <Footer />}
      </RouteStorageProvider>
    </div>
  )
}

export default App
