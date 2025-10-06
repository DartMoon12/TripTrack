import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/home'
  const { login, loginWithGoogle } = useAuth()

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 text-center mb-4">Přihlášení</h1>
              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}
              <form onSubmit={handleEmailLogin}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Heslo</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>Přihlásit se</button>
              </form>
              <div className="text-center text-muted my-3">nebo</div>
              <button onClick={handleGoogleLogin} className="btn btn-outline-secondary w-100" disabled={loading}>Přihlásit se přes Google</button>
              <p className="text-center mt-4 mb-0">
                Nemáte účet? <Link to="/register">Vytvořit účet</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


