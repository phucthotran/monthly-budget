import { useNavigate } from '@tanstack/react-router'
import { useCallback, useEffect } from 'react'
import { toast } from 'sonner'

import { useAuthContext } from '@/components/AuthProvider'

import { LoginForm } from './components/LoginForm'
import { useGoogleAuth } from './hooks/useGoogleAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { authError, loading, user } = useAuthContext()
  const google = useGoogleAuth()

  useEffect(() => {
    if (google.error) {
      toast.error(google.error)
    }
  }, [google.error])

  useEffect(() => {
    if (authError) {
      toast.error(authError)
    }
  }, [authError])

  useEffect(() => {
    if (!loading && user) {
      void navigate({ to: '/' })
    }
  }, [loading, user, navigate])

  const handleGoogleSignIn = useCallback(async () => {
    const result = await google.submitGoogle()
    if (result.ok) {
      void navigate({ to: '/' })
    }
  }, [google, navigate])

  return <LoginForm googlePending={google.pending} onGoogleSignIn={handleGoogleSignIn} />
}
