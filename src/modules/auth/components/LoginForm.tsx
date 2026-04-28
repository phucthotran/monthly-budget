import { AuthCard } from '@/components/patterns'
import { Button } from '@/components/ui'
import { t } from '@/lib/strings'

export function LoginForm({ googlePending, onGoogleSignIn }: { googlePending: boolean; onGoogleSignIn: () => void }) {
  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      <AuthCard title={t.appName}>
        <Button type="button" className="w-full" onClick={onGoogleSignIn} disabled={googlePending}>
          {t.auth.googleSignIn}
        </Button>
      </AuthCard>
    </div>
  )
}
