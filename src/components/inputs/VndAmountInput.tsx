import { type ComponentProps, useEffect, useMemo, useState } from 'react'

import { formatVndNumber, parseVndInput } from '@/lib/vnd'

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
  const formatted = useMemo(() => formatVndNumber(value), [value])
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
      inputMode="numeric"
      placeholder={placeholder}
      value={text}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const n = parseVndInput(raw)
        if (n != null) onValueChange(n)
      }}
      onBlur={() => {
        setText(formatVndNumber(value))
      }}
    />
  )
}
