import type { PinGateMode } from './pinGateTypes'

import { useId } from 'react'
import { useTranslation } from 'react-i18next'

import { LocaleToggle } from '@/components/LocaleToggle'
import { AuthCard } from '@/components/patterns'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'

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
  useLockBodyScroll(mode !== 'hydrating')

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden overscroll-none scrollbar-none bg-slate-100 p-4 pb-[max(1rem,var(--keyboard-inset,0px))] dark:bg-slate-900">
      <AuthCard compact title={title}>
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
