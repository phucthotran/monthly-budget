import { AuthCard } from '@/components/patterns'
import { Button, Input, Label } from '@/components/ui'
import { t } from '@/lib/strings'

export function LoginForm({
  email,
  error,
  googlePending,
  mode,
  onEmailChange,
  onGoogleSignIn,
  onPasswordChange,
  onSubmit,
  onToggleMode,
  password,
  pending,
}: {
  mode: 'signin' | 'signup'
  email: string
  password: string
  error: null | string
  pending: boolean
  googlePending: boolean
  onEmailChange: (v: string) => void
  onGoogleSignIn: () => void
  onPasswordChange: (v: string) => void
  onToggleMode: () => void
  onSubmit: () => void
}) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <AuthCard title={t.appName} description={mode === 'signin' ? t.nav.login : t.auth.signUp}>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onGoogleSignIn}
            disabled={pending || googlePending}
          >
            {t.auth.googleSignIn}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">{t.common.orSeparator}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{t.auth.email}</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t.auth.password}</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {mode === 'signin' ? t.auth.signIn : t.auth.signUp}
          </Button>
          <Button type="button" variant="ghost" className="w-full" onClick={onToggleMode}>
            {mode === 'signin' ? t.auth.switchToSignUp : t.auth.switchToSignIn}
          </Button>
        </form>
      </AuthCard>
    </div>
  )
}
