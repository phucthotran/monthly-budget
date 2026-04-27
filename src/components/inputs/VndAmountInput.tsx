import { useEffect, useMemo, useState } from 'react'

import { formatVndNumber, parseVndInput } from '@/lib/vnd'

import { Input } from '../ui'

export function VndAmountInput({
  onValueChange,
  placeholder,
  value,
}: {
  value: number
  onValueChange: (v: number) => void
  placeholder?: string
}) {
  const formatted = useMemo(() => formatVndNumber(value), [value])
  const [text, setText] = useState(formatted)

  useEffect(() => {
    setText(formatted)
  }, [formatted])

  return (
    <Input
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
