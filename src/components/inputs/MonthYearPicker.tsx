import { Calendar } from 'lucide-react'
import { useMemo } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { type MonthKey } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

function clampYearRange(years: number[], { centerYear, maxYears }: { maxYears: number; centerYear: number }): number[] {
  if (years.length <= maxYears) return years

  const idx = Math.max(
    0,
    years.findIndex((y) => y === centerYear),
  )
  const half = Math.floor(maxYears / 2)
  let start = Math.max(0, idx - half)
  let end = start + maxYears
  if (end > years.length) {
    end = years.length
    start = Math.max(0, end - maxYears)
  }
  return years.slice(start, end)
}

export function MonthYearPicker({
  className,
  maxYear,
  maxYears = 5,
  minYear,
  onChange,
  placeholder = t.common.pickMonth,
  value,
}: {
  value: MonthKey
  onChange: (v: MonthKey) => void
  placeholder?: string
  className?: string
  minYear?: number
  maxYear?: number
  maxYears?: number
}) {
  const [yStr, mStr] = value.split('-') as [string, string]
  const year = Number(yStr)
  const month = mStr

  const years = useMemo(() => {
    const nowYear = new Date().getFullYear()
    const start = minYear ?? nowYear - 2
    const end = maxYear ?? nowYear + 2
    const ys: number[] = []
    for (let y = start; y <= end; y++) ys.push(y)
    return clampYearRange(ys, { centerYear: year, maxYears: Math.max(1, maxYears) })
  }, [minYear, maxYear, maxYears, year])

  return (
    <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2', className)}>
      <div className="relative min-w-0">
        <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select
          value={month}
          onValueChange={(mm) => {
            onChange(`${yStr}-${mm}` as MonthKey)
          }}
        >
          <SelectTrigger className="pl-8">
            <SelectValue placeholder={placeholder}>{`T${Number(month)}`}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((mm) => (
              <SelectItem key={mm} value={mm}>
                {`T${Number(mm)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Select
        value={String(year)}
        onValueChange={(y) => {
          onChange(`${y}-${month}` as MonthKey)
        }}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
