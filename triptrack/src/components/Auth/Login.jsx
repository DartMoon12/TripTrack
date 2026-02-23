import React, { useState } from 'react'
// Importujeme nástroje pro navigaci (přesměrování)
import { Link, useLocation, useNavigate } from 'react-router-dom'
// Importujeme náš vlastní Hook, abychom se dostali k přihlašovacím funkcím
import { useAuth } from './AuthContext'

export default function Login() {
  // --- 1. STAVY (Paměť formuláře) ---
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // Stav pro chybovou hlášku (když se splete heslo)
  const [error, setError] = useState('')
  
  // Stav pro načítání (aby uživatel neklikal 10x na tlačítko, když to pracuje)
  const [loading, setLoading] = useState(false)

  // --- 2. NAVIGACE A DATA ---
  const navigate = useNavigate() // Tohle je naše "GPS" pro změnu stránky
  const location = useLocation() // Tohle nám řekne, odkud uživatel přišel
  const { login, loginWithGoogle } = useAuth() // Vytáhneme si funkce z našeho Contextu

  // 3. CHYTRÉ PŘESMĚROVÁNÍ
  // Tady zjišťujeme, kam uživatele poslat po přihlášení.
  // Pokud se snažil jít na "Zamčenou stránku", Router si tu adresu uložil do "location.state.from".
  // Takže ho tam vrátíme. Pokud ne, pošleme ho na '/home'.
  const from = location.state?.from?.pathname || '/home'

  // --- 4. FUNKCE PRO PŘIHLÁŠENÍ EMAILEM ---
  async function handleEmailLogin(e) {
    // DŮLEŽITÉ: Zastavíme "klasické" odeslání formuláře, které by obnovilo celou stránku.
    // My chceme vše řešit v Reactu bez bliknutí obrazovky.
    e.preventDefault()

    // Vyčistíme staré chyby a zapneme točící kolečko (nebo zablokujeme tlačítka)
    setError('')
    setLoading(true)

    try {
      // 1. Zkusíme se přihlásit přes Firebase (čekáme na výsledek - await)
      await login(email, password)
      
      // 2. Když to projde (nespadne do catch), přesměrujeme uživatele.
      // { replace: true } znamená, že Login zmizí z historie tlačítka "Zpět".
      navigate(from, { replace: true })
      
    } catch (err) {
      // 3. Když se to nepovede (špatné heslo, neexistující uživatel...)
      console.error("Chyba při přihlášení:", err)
      // Tip: Tady by šlo udělat hezčí překlad chyb (např. 'auth/wrong-password' -> 'Špatné heslo')
      setError('Nepodařilo se přihlásit. Zkontrolujte údaje.')
      
    } finally {
      // 4. Tohle se stane VŽDYCKY (úspěch i chyba).
      // Vypneme načítání, aby tlačítka zase fungovala.
      setLoading(false)
    }
  }

  // --- 5. FUNKCE PRO PŘIHLÁŠENÍ GOOGLEM ---
  async function handleGoogleLogin() {
    // Tady nepotřebujeme e.preventDefault(), protože to není "submit" formuláře, ale jen kliknutí.
    setError('')
    setLoading(true)

    try {
      await loginWithGoogle()
      navigate(from, { replace: true })
    } catch (err) {
      setError('Přihlášení přes Google selhalo.')
    } finally {
      setLoading(false)
    }
  }

  // --- 6. VYKRESLENÍ (UI) ---
  return (
    <div className="container" style={{ minHeight: '80vh' }}>
      {/* Bootstrap třídy pro vycentrování karty na střed obrazovky */}
      <div className="row justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          
          <div className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4 p-md-5">
              <h1 className="h3 text-center mb-4">Přihlášení</h1>
              
              {/* Podmíněné vykreslení: Chybovou hlášku ukážeme, jen když nějaká je */}
              {error && (
                <div className="alert alert-danger" role="alert">{error}</div>
              )}

              <form onSubmit={handleEmailLogin}>
                <div className="mb-3">
                  <label className="form-label">E-mail</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    // Propojíme input se stavem (Two-way binding)
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
                    required 
                  />
                </div>
                {/* Tlačítko zakážeme (disabled), pokud se zrovna načítá */}
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Načítám...' : 'Přihlásit se'}
                </button>
              </form>

              <div className="text-center text-muted my-3">nebo</div>
              
              <button onClick={handleGoogleLogin} className="btn btn-outline-secondary w-100" disabled={loading}>
                Přihlásit se přes Google
              </button>

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