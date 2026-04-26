import { useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'

import { LoginForm } from './components/LoginForm'
import { useEmailAuth } from './hooks/useEmailAuth'

export function LoginPage() {
  const navigate = useNavigate()
  const { email, error, loading, mode, password, pending, setEmail, setMode, setPassword, submit, user } =
    useEmailAuth()

  useEffect(() => {
    if (!loading && user) void navigate({ to: '/' })
  }, [loading, user, navigate])

  return (
    <LoginForm
      mode={mode}
      email={email}
      password={password}
      error={error}
      pending={pending}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onToggleMode={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      onSubmit={() => void submit()}
    />
  )
}
