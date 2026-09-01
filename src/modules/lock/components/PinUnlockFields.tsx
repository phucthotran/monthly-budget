import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Button, Field, FieldError, FieldLabel } from '@/components/ui'
import { PIN_LENGTH } from '@/lib/pinCrypto'

import { PinOtpField } from './PinOtpField'

export function PinUnlockFields({
  backoffRemainingMs,
  disabled,
  error,
  formId,
  onForgotPin,
  onUnlock,
}: {
  backoffRemainingMs: number
  disabled: boolean
  error: null | string
  formId: string
  onForgotPin?: () => void
  onUnlock: (pin: string) => Promise<void>
}) {
  const { t: ta } = useTranslation('auth')
  const [value, setValue] = useState('')
  const backoffActive = backoffRemainingMs > 0
  const backoffSeconds = Math.ceil(backoffRemainingMs / 1000)
  const errId = `${formId}-unlock-err`
  const invalid = !!error
  const inputDisabled = disabled || backoffActive

  return (
    <div className="space-y-3">
      <Field invalid={invalid}>
        <FieldLabel className="w-full justify-center" htmlFor={`${formId}-unlock`}>
          {ta('pinLabel')}
        </FieldLabel>
        <PinOtpField
          autoFocus
          aria-describedby={error || backoffActive ? errId : undefined}
          disabled={inputDisabled}
          id={`${formId}-unlock`}
          invalid={invalid}
          value={value}
          onChange={setValue}
          onComplete={(pin) => {
            if (pin.length !== PIN_LENGTH) return
            void (async () => {
              await onUnlock(pin)
              setValue('')
            })()
          }}
        />
        <FieldError className="text-center" id={errId}>
          {backoffActive ? ta('backoffWait', { seconds: backoffSeconds }) : error}
        </FieldError>
      </Field>
      {onForgotPin ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            disabled={inputDisabled && !backoffActive}
            onClick={onForgotPin}
          >
            {ta('forgotPin')}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
