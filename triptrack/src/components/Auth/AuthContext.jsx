import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from '../../firebase'

const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  loginWithGoogle: async () => {},
})

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  async function login(email, password) {
    await signInWithEmailAndPassword(auth, email, password)
  }

  async function loginWithGoogle() {
    await signInWithPopup(auth, googleProvider)
  }

  async function register(email, password) {
    await createUserWithEmailAndPassword(auth, email, password)
  }

  async function logout() {
    await signOut(auth)
  }

  const value = useMemo(() => ({ currentUser, loading, login, logout, register, loginWithGoogle }), [currentUser, loading])
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}


