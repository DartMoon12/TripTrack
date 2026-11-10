import React, { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getRedirectResult } from 'firebase/auth'
import { auth } from '../../firebase'
import { useAuth } from './AuthContext'
import AuthLayout, { Divider, GoogleButton } from './AuthLayout'
import PasswordInput from './PasswordInput'
import { authErrorMessage, isUserCancel } from './authErrors'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, login, loginWithGoogle, resetPassword } = useAuth()

  // Po přihlášení vrátíme uživatele tam, kam původně chtěl (např. na sdílenou trasu)
  const from = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/mapa'

  // Návrat z přihlášení přes Google přesměrováním (když prohlížeč zablokuje popup)
  useEffect(() => {
    getRedirectResult(auth)
      .then((result) => { if (result?.user) navigate(from, { replace: true }) })
      .catch((err) => {
        console.error('Chyba při přihlášení přes Google (redirect):', err)
        setError(authErrorMessage(err, 'Přihlášení přes Google selhalo'))
      })
  }, [from, navigate])

  // Už přihlášený uživatel na přihlašovací stránce nemá co dělat
  if (currentUser && !loading) return <Navigate to={from} replace />

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError(''); setInfo(''); setLoading(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Chyba při přihlášení:', err)
      setError(authErrorMessage(err, 'Přihlášení se nepovedlo'))
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    setError(''); setInfo(''); setLoading(true)
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Chyba při přihlášení přes Google:', err)
      if (!isUserCancel(err)) setError(authErrorMessage(err, 'Přihlášení přes Google selhalo'))
      setLoading(false)
    }
  }

  async function handleResetPassword() {
    setError(''); setInfo('')
    if (!email.trim()) {
      setError('Nejdřív vyplňte e-mail, na který máme poslat odkaz.')
      return
    }
    try {
      await resetPassword(email.trim())
      setInfo('Pokud účet existuje, poslali jsme na e-mail odkaz pro nastavení nového hesla.')
    } catch (err) {
      setError(authErrorMessage(err, 'Odeslání e-mailu se nepovedlo'))
    }
  }

  return (
    <AuthLayout
      title="Vítej zpátky"
      subtitle="Přihlas se a pokračuj v plánování."
      footer={<>Nemáš účet? <Link to="/register" state={location.state}>Vytvoř si ho</Link></>}
    >
      {error && <div className="auth-alert error" role="alert">{error}</div>}
      {info && <div className="auth-alert success" role="status">{info}</div>}

      <GoogleButton onClick={handleGoogleLogin} disabled={loading} />
      <Divider />

      <form onSubmit={handleEmailLogin}>
        <div className="mb-3">
          <label className="form-label" htmlFor="login-email">E-mail</label>
          <input
            id="login-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <label className="form-label" htmlFor="login-password">Heslo</label>
            <button type="button" className="link-btn mb-1" onClick={handleResetPassword}>Zapomenuté heslo?</button>
          </div>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <button type="submit" className="btn btn-accent w-100 py-2" disabled={loading}>
          {loading ? 'Přihlašuji…' : 'Přihlásit se'}
        </button>
      </form>
    </AuthLayout>
  )
}
