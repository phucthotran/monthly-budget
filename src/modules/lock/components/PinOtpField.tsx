import { REGEXP_ONLY_DIGITS } from 'input-otp'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionTooltipButton } from '@/components/patterns'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui'
import { PIN_LENGTH } from '@/lib/pinCrypto'
import { cn } from '@/lib/utils'

export function PinOtpField({
  'aria-describedby': ariaDescribedBy,
  autoFocus,
  className,
  disabled,
  id,
  invalid,
  onChange,
  onComplete,
  value,
}: {
  'aria-describedby'?: string
  autoFocus?: boolean
  className?: string
  disabled?: boolean
  id?: string
  invalid?: boolean
  onChange: (value: string) => void
  onComplete?: (value: string) => void
  value: string
}) {
  const { t: ta } = useTranslation('auth')
  const [masked, setMasked] = useState(true)
  const toggleLabel = masked ? ta('showPin') : ta('hidePin')

  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      <InputOTP
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid}
        autoComplete="one-time-code"
        autoFocus={autoFocus}
        containerClassName="justify-center"
        disabled={disabled}
        id={id}
        inputMode="numeric"
        maxLength={PIN_LENGTH}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={(next) => {
          onChange(next)
          if (next.length === PIN_LENGTH) onComplete?.(next)
        }}
      >
        <InputOTPGroup>
          <InputOTPSlot aria-invalid={invalid} index={0} masked={masked} />
          <InputOTPSlot aria-invalid={invalid} index={1} masked={masked} />
          <InputOTPSlot aria-invalid={invalid} index={2} masked={masked} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot aria-invalid={invalid} index={3} masked={masked} />
          <InputOTPSlot aria-invalid={invalid} index={4} masked={masked} />
          <InputOTPSlot aria-invalid={invalid} index={5} masked={masked} />
        </InputOTPGroup>
      </InputOTP>
      <ActionTooltipButton disabled={disabled} label={toggleLabel} variant="ghost" onClick={() => setMasked((v) => !v)}>
        {masked ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
      </ActionTooltipButton>
    </div>
  )
}
