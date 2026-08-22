import { getRedirectResult, onAuthStateChanged, type User } from 'firebase/auth'
import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import i18n from '@/i18n'
import { getFirebaseAuth, getFirestoreDb } from '@/lib/firebase'
import { ensureDefaultCategories } from '@/lib/seed-defaults'

type AuthContextValue = {
  authError: null | string
  user: null | User
  loading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authError, setAuthError] = useState<null | string>(null)
  const [user, setUser] = useState<null | User>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    let unsub = () => {}

    void (async () => {
      try {
        const auth = getFirebaseAuth()
        try {
          await getRedirectResult(auth)
        } catch {
          if (!cancelled) {
            setAuthError(i18n.t('errorGoogle', { ns: 'auth' }))
          }
        }

        if (cancelled) return

        unsub = onAuthStateChanged(auth, async (u) => {
          if (cancelled) return
          setUser(u)
          setLoading(false)
          if (u) {
            setAuthError(null)
            try {
              await ensureDefaultCategories(getFirestoreDb(), u.uid)
            } catch {
              // Offline or rules: seed will retry when possible.
            }
          }
        })
      } catch {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
      unsub()
    }
  }, [])

  const value = useMemo(() => ({ authError, loading, user }), [authError, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
