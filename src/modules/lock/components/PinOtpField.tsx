import { REGEXP_ONLY_DIGITS } from 'input-otp'

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
  return (
    <InputOTP
      aria-describedby={ariaDescribedBy}
      aria-invalid={invalid}
      autoComplete="one-time-code"
      autoFocus={autoFocus}
      containerClassName={cn('justify-center', className)}
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
        <InputOTPSlot aria-invalid={invalid} index={0} />
        <InputOTPSlot aria-invalid={invalid} index={1} />
        <InputOTPSlot aria-invalid={invalid} index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot aria-invalid={invalid} index={3} />
        <InputOTPSlot aria-invalid={invalid} index={4} />
        <InputOTPSlot aria-invalid={invalid} index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}
