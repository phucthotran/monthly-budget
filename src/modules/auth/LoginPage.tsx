import { useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

import { LoginForm } from './components/LoginForm'
import { useGoogleAuth } from './hooks/useGoogleAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const google = useGoogleAuth()

  const handleGoogleSignIn = useCallback(async () => {
    const result = await google.submitGoogle()
    if (result.ok) {
      void navigate({ to: '/' })
    }
  }, [google])

  return <LoginForm googlePending={google.pending} onGoogleSignIn={handleGoogleSignIn} />
}
