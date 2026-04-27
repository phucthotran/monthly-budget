import { onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase'
import { ensureDefaultCategories } from '@/lib/seed-defaults'

type AuthContextValue = {
  user: null | User
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<null | User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let unsub = () => {}
    try {
      const auth = getFirebaseAuth()
      unsub = onAuthStateChanged(auth, async (u) => {
        if (cancelled) return
        setUser(u)
        setLoading(false)
        if (u) {
          try {
            await ensureDefaultCategories(getFirestoreDb(), u.uid)
          } catch {
            // Offline or rules: seed will retry when possible.
          }
        }
      })
    } catch {
      setLoading(false)
    }
    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const value = useMemo(() => ({ loading, user }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
