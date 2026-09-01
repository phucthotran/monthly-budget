import { GoogleAuthProvider, reauthenticateWithPopup, reauthenticateWithRedirect } from 'firebase/auth'
import { useCallback, useState } from 'react'

import i18n from '@/i18n'
import { getFirebaseAuth } from '@/lib/firebase'

function shouldUseRedirect() {
  const ua = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}

export function useGoogleReauth() {
  const [error, setError] = useState<null | string>(null)
  const [pending, setPending] = useState(false)

  const reauthenticate = useCallback(async () => {
    setError(null)
    setPending(true)
    const auth = getFirebaseAuth()
    const user = auth.currentUser
    const provider = new GoogleAuthProvider()
    try {
      if (!user) return { ok: false as const }
      if (shouldUseRedirect()) {
        await reauthenticateWithRedirect(user, provider)
        return { ok: true as const }
      }
      await reauthenticateWithPopup(user, provider)
      return { ok: true as const }
    } catch {
      setError(i18n.t('errorGoogle', { ns: 'auth' }))
      return { ok: false as const }
    } finally {
      setPending(false)
    }
  }, [])

  return { error, pending, reauthenticate }
}
