import React, { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { sendEmailVerification } from 'firebase/auth'
import toast from 'react-hot-toast'
import { useAuth } from './AuthContext'
import AuthLayout, { Divider, GoogleButton } from './AuthLayout'
import PasswordInput from './PasswordInput'
import { authErrorMessage, isUserCancel } from './authErrors'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, register, loginWithGoogle } = useAuth()
  const from = location.state?.from?.pathname || '/mapa'

  if (currentUser && !loading) return <Navigate to={from} replace />

  async function handleRegister(e) {
    e.preventDefault()
    if (password.length < 8) return setError('Heslo musí mít alespoň 8 znaků.')
    if (password !== confirm) return setError('Hesla se neshodují.')

    setError('')
    setLoading(true)
    try {
      const { user } = await register(email.trim(), password)
      // Ověřovací e-mail je bonus – když se nepovede odeslat, registrace i tak proběhla
      try { await sendEmailVerification(user) } catch (err) { console.warn('Ověřovací e-mail se neodeslal:', err) }
      toast.success('Účet vytvořen! Poslali jsme vám potvrzovací e-mail.')
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Chyba registrace:', err)
      setError(authErrorMessage(err, 'Účet se nepodařilo vytvořit'))
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setError('')
    setLoading(true)
    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      console.error('Chyba registrace přes Google:', err)
      if (!isUserCancel(err)) setError(authErrorMessage(err, 'Registrace přes Google selhala'))
      setLoading(false)
    }
  }

  const passwordsMismatch = confirm.length > 0 && confirm !== password

  return (
    <AuthLayout
      title="Vytvoř si účet"
      subtitle="Zdarma. Trasy se ti uloží do cloudu."
      footer={<>Už máš účet? <Link to="/login" state={location.state}>Přihlas se</Link></>}
    >
      {error && <div className="auth-alert error" role="alert">{error}</div>}

      <GoogleButton onClick={handleGoogle} disabled={loading}>Registrovat přes Google</GoogleButton>
      <Divider />

      <form onSubmit={handleRegister}>
        <div className="mb-3">
          <label className="form-label" htmlFor="reg-email">E-mail</label>
          <input
            id="reg-email"
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label" htmlFor="reg-password">Heslo</label>
          <PasswordInput
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            minLength={8}
          />
          <div className="form-text">Alespoň 8 znaků.</div>
        </div>

        <div className="mb-4">
          <label className="form-label" htmlFor="reg-confirm">Heslo znovu</label>
          <PasswordInput
            id="reg-confirm"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
          />
          {passwordsMismatch && <div className="form-text text-danger">Hesla se zatím neshodují.</div>}
        </div>

        <button type="submit" className="btn btn-accent w-100 py-2" disabled={loading}>
          {loading ? 'Vytvářím účet…' : 'Vytvořit účet'}
        </button>
        <p className="small text-muted text-center mt-3 mb-0">
          Registrací souhlasíte s <Link to="/podminky">podmínkami použití</Link>.
        </p>
      </form>
    </AuthLayout>
  )
}
