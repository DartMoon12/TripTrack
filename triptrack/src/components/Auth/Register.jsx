import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function Register() {
  // --- 1. STAVY (Paměť pro formulář) ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Tohle je navíc oproti Loginu - potřebujeme ověřit, že se uživatel nepřepsal
  const [confirm, setConfirm] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // --- 2. NÁSTROJE ---
  const navigate = useNavigate() // Pro přesměrování po úspěšné registraci
  const { register } = useAuth() // Funkce pro vytvoření uživatele (z AuthContextu)

  // --- 3. HLAVNÍ FUNKCE REGISTRACE ---
  async function handleRegister(e) {
    // Zastavíme klasické odeslání formuláře (aby se stránka neobnovila)
    e.preventDefault()

    // 4. VALIDACE (Kontrola před odesláním)
    // Než budeme "otravovat" Firebase, zkontrolujeme základní věci u nás.
    if (password !== confirm) {
      return setError('Hesla se neshodují! Zkuste to znovu.')
      // 'return' je tu důležitý - funkce se okamžitě ukončí a dál nepokračuje.
    }

    // Pokud hesla sedí, vyčistíme chyby a zapneme načítání
    setError('')
    setLoading(true)

    try {
      // 5. KOMUNIKACE S FIREBASE
      // Čekáme, až Firebase vytvoří uživatele (await)
      await register(email, password)
      
      // 6. ÚSPĚCH
      // Uživatel je vytvořený a rovnou přihlášený -> jdeme na hlavní stránku
      navigate('/home', { replace: true })

    } catch (err) {
      // 7. CHYBA
      // Tady chytáme chyby jako "Email už existuje" nebo "Heslo je moc krátké"
      console.error("Chyba registrace:", err)
      setError('Nepodařilo se vytvořit účet. (Možná už tento email existuje?)')

    } finally {
      // 8. ÚKLID
      // Vypneme načítání, ať to dopadne jakkoliv
      setLoading(false)
    }
  }

  // --- 9. VYKRESLENÍ (UI) ---
  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 text-center mb-4">Vytvořit účet</h1>
              
              {/* Zobrazíme chybu, jen když nějaká je */}
              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

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
                    // Tady by šlo přidat minLength={6}, protože Firebase vyžaduje min 6 znaků
                    required 
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Potvrzení hesla</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    value={confirm} 
                    onChange={(e) => setConfirm(e.target.value)} 
                    required 
                  />
                </div>

                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Vytvářím účet...' : 'Vytvořit účet'}
                </button>
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