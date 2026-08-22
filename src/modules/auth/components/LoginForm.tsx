import { useTranslation } from 'react-i18next'

import { LocaleToggle } from '@/components/LocaleToggle'
import { AuthCard } from '@/components/patterns'
import { Button } from '@/components/ui'

export function LoginForm({ googlePending, onGoogleSignIn }: { googlePending: boolean; onGoogleSignIn: () => void }) {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('auth')

  return (
    <div className="min-h-dvh flex items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      <AuthCard title={t('appName')}>
        <div className="space-y-4">
          <div className="flex justify-center">
            <LocaleToggle />
          </div>
          <Button type="button" className="w-full" onClick={onGoogleSignIn} disabled={googlePending}>
            {ta('googleSignIn')}
          </Button>
        </div>
      </AuthCard>
    </div>
  )
}
