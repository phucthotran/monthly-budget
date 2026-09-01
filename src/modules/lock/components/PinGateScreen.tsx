import type { PinGateMode } from './pinGateTypes'

import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { LocaleToggle } from '@/components/LocaleToggle'
import { AuthCard } from '@/components/patterns'

import { pinGateCopy } from './pinGateCopy'
import { PinSetupFields } from './PinSetupFields'
import { PinUnlockFields } from './PinUnlockFields'

export type { PinGateMode } from './pinGateTypes'

export function PinGateScreen({
  backoffRemainingMs,
  mode,
  onForgotPin,
  onSkip,
  onSubmitSetup,
  onUnlock,
  pending,
  unlockError,
}: {
  backoffRemainingMs: number
  mode: PinGateMode
  onForgotPin?: () => void
  onSkip?: () => void
  onSubmitSetup: (pin: string) => Promise<void>
  onUnlock: (pin: string) => Promise<void>
  pending: boolean
  unlockError: null | string
}) {
  const { t } = useTranslation()
  const { t: ta } = useTranslation('auth')
  const formId = useId()
  const { description, title } = pinGateCopy(mode, t, ta)

  return (
    <div className="flex min-h-dvh items-center justify-center p-4 bg-slate-100 dark:bg-slate-900">
      <AuthCard title={title}>
        <div className="space-y-4">
          <div className="flex justify-center">
            <LocaleToggle />
          </div>
          <p className="text-sm text-muted-foreground text-pretty text-center">{description}</p>
          {mode === 'hydrating' ? null : mode === 'unlock' ? (
            <PinUnlockFields
              backoffRemainingMs={backoffRemainingMs}
              disabled={pending}
              error={unlockError}
              formId={formId}
              onForgotPin={onForgotPin}
              onUnlock={onUnlock}
            />
          ) : (
            <PinSetupFields
              disabled={pending}
              formId={formId}
              showSkip={mode === 'setup'}
              onSkip={onSkip}
              onSubmitSetup={onSubmitSetup}
            />
          )}
        </div>
      </AuthCard>
    </div>
  )
}
