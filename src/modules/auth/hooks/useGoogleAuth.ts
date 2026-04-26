import { getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect } from 'firebase/auth'
import { useCallback, useEffect, useState } from 'react'

import { getFirebaseAuth } from '@/lib/firebase'
import { t } from '@/lib/strings'

function shouldUseRedirect() {
  // Popup is flaky on iOS Safari / installed PWAs.
  const ua = navigator.userAgent.toLowerCase()
  const isIOS = /iphone|ipad|ipod/.test(ua)
  const isStandalone = window.matchMedia?.('(display-mode: standalone)')?.matches ?? false
  return isIOS || isStandalone
}

export function useGoogleAuth() {
  const [error, setError] = useState<null | string>(null)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    // If we previously used redirect, consume the result once.
    const auth = getFirebaseAuth()
    void getRedirectResult(auth).catch(() => {
      // Ignore: user may land here without redirect auth.
    })
  }, [])

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
      setError(t.auth.errorGoogle)
      return { ok: false as const }
    } finally {
      setPending(false)
    }
  }, [])

  return { error, pending, submitGoogle }
}
