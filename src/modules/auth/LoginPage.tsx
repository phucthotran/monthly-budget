import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { LoginForm } from './components/LoginForm'
import { useEmailAuth } from './hooks/useEmailAuth'
import { useGoogleAuth } from './hooks/useGoogleAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { email, error, loading, mode, password, pending, setEmail, setMode, setPassword, submit, user } =
    useEmailAuth()
  const google = useGoogleAuth()

  useEffect(() => {
    if (!loading && user) void navigate({ to: '/' })
  }, [loading, user, navigate])

  return (
    <LoginForm
      mode={mode}
      email={email}
      password={password}
      error={error ?? google.error}
      pending={pending}
      googlePending={google.pending}
      onEmailChange={setEmail}
      onGoogleSignIn={() => void google.submitGoogle()}
      onPasswordChange={setPassword}
      onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      onSubmit={() => void submit()}
    />
  )
}
