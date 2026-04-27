import { AuthCard } from '@/components/patterns'
import { Button } from '@/components/ui'
import { t } from '@/lib/strings'

export function LoginForm({ googlePending, onGoogleSignIn }: { googlePending: boolean; onGoogleSignIn: () => void }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-background">
      <AuthCard title={t.appName} description={t.nav.login}>
        <Button type="button" variant="outline" className="w-full" onClick={onGoogleSignIn} disabled={googlePending}>
          {t.auth.googleSignIn}
        </Button>
      </AuthCard>
    </div>
  )
}
