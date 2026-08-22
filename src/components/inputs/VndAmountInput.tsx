import { type ComponentProps, useEffect, useMemo, useState } from 'react'

import { useMoney } from '@/hooks/useMoney'
import { parseMoneyInput } from '@/lib/money'

import { Input } from '../ui'

export function VndAmountInput({
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
  className,
  id,
  invalid,
  onValueChange,
  placeholder,
  value,
}: {
  value: number
  onValueChange: (v: number) => void
  placeholder?: string
  className?: string
  id?: string
  invalid?: boolean
} & Pick<ComponentProps<typeof Input>, 'aria-describedby' | 'aria-invalid' | 'id'>) {
  const { currency, formatNumber } = useMoney()
  const formatted = useMemo(() => formatNumber(value), [formatNumber, value])
  const [text, setText] = useState(formatted)

  useEffect(() => {
    setText(formatted)
  }, [formatted])

  const showInvalid = invalid || ariaInvalid === true

  return (
    <Input
      aria-describedby={ariaDescribedBy}
      aria-invalid={showInvalid || undefined}
      className={className}
      id={id}
      inputMode={currency === 'USD' ? 'decimal' : 'numeric'}
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const n = parseMoneyInput(raw, currency)
        if (n != null) onValueChange(n)
      }}
      onBlur={() => {
        setText(formatNumber(value))
      }}
    />
  )
}
