import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'
import { useCallback, useEffect, useState } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { getFirebaseAuth } from '@/lib/firebase'
import { t } from '@/lib/strings'

export function useEmailAuth() {
  const { loading, user } = useAuthContext()

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<null | string>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    if (!loading) setError(null)
  }, [loading, mode])

  const submit = useCallback(async () => {
    setError(null)
    setPending(true)
    const auth = getFirebaseAuth()
    try {
      if (mode === 'signin') {
        await signInWithEmailAndPassword(auth, email.trim(), password)
      } else {
        await createUserWithEmailAndPassword(auth, email.trim(), password)
      }
      return { ok: true as const }
    } catch {
      setError(t.auth.error)
      return { ok: false as const }
    } finally {
      setPending(false)
    }
  }, [email, mode, password])

  return {
    email,
    error,
    loading,
    mode,
    password,
    pending,
    setEmail,
    setMode,
    setPassword,
    submit,
    user,
  }
}
