import { GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { useCallback, useState } from 'react'

import i18n from '@/i18n'
import { getFirebaseAuth } from '@/lib/firebase'

function shouldUseRedirect() {
  // Popup is blocked on iOS Safari (including installed PWAs). Android/desktop PWAs
  // should use popup — redirect breaks when authDomain differs from the app origin.
  const ua = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(ua)
}

export function useGoogleAuth() {
  const [error, setError] = useState<null | string>(null)
  const [pending, setPending] = useState(false)

  const submitGoogle = useCallback(async () => {
    setError(null)
    setPending(true)
    const auth = getFirebaseAuth()
    const provider = new GoogleAuthProvider()
    try {
      if (shouldUseRedirect()) {
        await signInWithRedirect(auth, provider)
        return { ok: true as const }
      }

      await signInWithPopup(auth, provider)
      return { ok: true as const }
    } catch {
      setError(i18n.t('errorGoogle', { ns: 'auth' }))
      return { ok: false as const }
    } finally {
      setPending(false)
    }
  }, [])

  return { error, pending, submitGoogle }
}
