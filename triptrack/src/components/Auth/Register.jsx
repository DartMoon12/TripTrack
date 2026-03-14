import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
// 💥 PŘIDÁNO: Importujeme funkci pro odeslání ověřovacího e-mailu z Firebase
import { sendEmailVerification } from 'firebase/auth'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // 💥 PŘIDÁNO: Stav pro zobrazení zprávy o úspěchu
  const [successMsg, setSuccessMsg] = useState('')

  const navigate = useNavigate()
  // 💥 PŘIDÁNO: Vytáhneme si i samotného currentUser z kontextu, 
  // abychom věděli, na koho ten ověřovací e-mail poslat
  const { register, currentUser } = useAuth() 

  async function handleRegister(e) {
    e.preventDefault()

    // 💥 PŘIDÁNO: Vlastní validace na délku hesla
    if (password.length < 8) {
        return setError('Heslo musí obsahovat alespoň 8 znaků.')
    }

    if (password !== confirm) {
      return setError('Hesla se neshodují! Zkuste to znovu.')
    }

    setError('')
    setSuccessMsg('')
    setLoading(true)

    try {
      // Založíme uživatele
      const userCredential = await register(email, password)
      
      // 💥 PŘIDÁNO: Odešleme uživateli na e-mail potvrzovací zprávu od Firebase
      if (userCredential && userCredential.user) {
         await sendEmailVerification(userCredential.user);
      }
      
      // Ukážeme uživateli zelenou hlášku
      setSuccessMsg('Účet vytvořen! Odeslali jsme vám potvrzovací e-mail.')
      
      // Počkáme 3 vteřiny, aby si to mohl přečíst, a pak ho hodíme na mapu
      setTimeout(() => {
          navigate('/home', { replace: true })
      }, 3000)

    } catch (err) {
      console.error("Chyba registrace:", err)
      setError('Nepodařilo se vytvořit účet. (Možná už tento email existuje?)')
      setLoading(false) // Vypneme loading jen u chyby, při úspěchu to necháme točit, než ho to přesměruje
    } 
  }

  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 text-center mb-4">Vytvořit účet</h1>
              
              {error && <div className="alert alert-danger" role="alert">{error}</div>}
              {/* 💥 PŘIDÁNO: Zelená hláška při úspěchu */}
              {successMsg && <div className="alert alert-success" role="alert">{successMsg}</div>}

              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="mb-3">
                  <label className="form-label">Heslo</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    // 💥 PŘIDÁNO: Atribut minLength
                    minLength={8}
                    required 
                  />
                  {/* 💥 PŘIDÁNO: Informační text o podmínkách hesla pod políčkem */}
                  <div className="form-text" style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Heslo musí obsahovat alespoň 8 znaků.
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label">Potvrzení hesla</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100 py-2" disabled={loading}>
                  {loading ? 'Zpracovávám...' : 'Vytvořit účet'}
                </button>
              </form>

              <p className="text-center mt-4 mb-0">
                Máte už účet? <Link to="/login" className="text-decoration-none">Přihlásit se</Link>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}