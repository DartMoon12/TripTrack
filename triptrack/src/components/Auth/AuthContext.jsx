import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
// Importujeme funkce přímo z Firebase, které budeme potřebovat
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth'
// Načteme naši nastavenou 'auth' a 'googleProvider' z firebase.js
import { auth, googleProvider } from '../../firebase'

// 1. Vytvoříme si "Kontext"
// Představ si to jako globální krabici, do které uložíme informace o uživateli,
// aby k nim měl přístup celý zbytek aplikace.
const AuthContext = createContext()

// 2. Hlavní komponenta Provider (Poskytovatel)
// Tahle komponenta obalí celou naši aplikaci a bude jí "poskytovat" data o přihlášení.
export function AuthProvider({ children }) {
  
  // --- STAVY (Proměnné, které se mohou měnit) ---
  
  // Tady si pamatujeme, kdo je zrovna přihlášený. Na začátku nevíme (null).
  const [currentUser, setCurrentUser] = useState(null)
  
  // Tady si pamatujeme, jestli Firebase ještě zjišťuje stav (načítání).
  // Na začátku je true, protože hned po spuštění aplikace se musíme zeptat Firebase.
  const [loading, setLoading] = useState(true)

  // --- EFEKT (Co se stane po načtení stránky) ---
  
  useEffect(() => {
    // Tohle je náš "hlídač". Firebase má funkci onAuthStateChanged, 
    // která se spustí pokaždé, když se někdo přihlásí nebo odhlásí.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // 1. Uložíme uživatele do stavu (buď tam bude objekt uživatele, nebo null)
      setCurrentUser(user)
      
      // 2. Řekneme aplikaci: "Hotovo, už víme, kdo tu je, přestaň načítat."
      setLoading(false)
    })

    // Úklid: Když se tato komponenta vypne (což se u AuthProvideru stane málokdy, ale je to slušnost),
    // přestaneme poslouchat změny, abychom nezpomalovali aplikaci.
    return () => {
      unsubscribe()
    }
  }, []) // Prázdné pole [] znamená: "Spusť to jen jednou při startu".

  // --- POMOCNÉ FUNKCE (Mosty k Firebase) ---
  // Vytváříme si vlastní funkce, které jen zavolají ty složité z Firebase.
  // Díky tomu v komponentách (třeba v Login.jsx) voláme jen "login(email, heslo)".

  // Funkce pro klasické přihlášení emailem
  async function login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password)
  }

  // Funkce pro přihlášení přes Google (vyskakovací okno)
  async function loginWithGoogle() {
    return await signInWithPopup(auth, googleProvider)
  }

  // Funkce pro registraci nového uživatele
  async function register(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password)
  }

  // Funkce pro odhlášení
  async function logout() {
    return await signOut(auth)
  }

  // --- ZABALENÍ DAT (Abychom je mohli poslat dál) ---
  
  // Tady si připravíme balíček 'value', který pošleme do celé aplikace.
  // Používáme useMemo, což je optimalizace - říkáme tím:
  // "Tento balíček přebal jen tehdy, když se změní uživatel (currentUser) nebo stav načítání (loading)."
  // Kdybychom to neudělali, balíček by se vytvářel zbytečně při každém kliknutí v aplikaci.
  const value = useMemo(() => {
    return {
      currentUser,
      loading,
      login,
      logout,
      register,
      loginWithGoogle
    }
  }, [currentUser, loading])

  // --- VYKRESLENÍ ---
  return (
    <AuthContext.Provider value={value}>
      {/*{children} zobrazíme až ve chvíli, 
        kdy loading už NENÍ true. Tím zabráníme tomu, aby aplikace problikla 
        v "nepřihlášeném" stavu, než Firebase zjistí, že už jsme vlastně přihlášení.
      */}
      {!loading && children}
    </AuthContext.Provider>
  )
}

// 3. Vlastní Hook (Zkratka)
// Abychom v ostatních souborech nemuseli psát `useContext(AuthContext)`,
// vytvoříme si tuhle jednoduchou funkci `useAuth`.
export function useAuth() {
  return useContext(AuthContext)
}