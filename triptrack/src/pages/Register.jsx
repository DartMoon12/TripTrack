import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { register } = useAuth()

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    if (password !== confirm) {
      setError('Hesla se neshodují')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/home', { replace: true })
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
              <h1 className="h3 text-center mb-4">Vytvořit účet</h1>
              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Heslo</label>
                  <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Potvrzení hesla</label>
                  <input type="password" className="form-control" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>Vytvořit účet</button>
              </form>
              <p className="text-center mt-4 mb-0">
                Máte už účet? <Link to="/login">Přihlásit se</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


