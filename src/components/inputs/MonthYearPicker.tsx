import { Calendar } from 'lucide-react'
import { useMemo } from 'react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { currentMonthKey, type MonthKey } from '@/lib/month'
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
  maxMonth,
  maxYear,
  maxYears = 5,
  minMonth,
  minYear,
  onChange,
  placeholder = t.common.pickMonth,
  value,
}: {
  value: MonthKey
  onChange: (v: MonthKey) => void
  placeholder?: string
  className?: string
  minMonth?: MonthKey
  maxMonth?: MonthKey
  minYear?: number
  maxYear?: number
  maxYears?: number
}) {
  const trimmed = value?.trim() ?? ''
  const effectiveMonth: MonthKey = /^\d{4}-\d{2}$/.test(trimmed)
    ? (trimmed as MonthKey)
    : minMonth
      ? minMonth
      : maxMonth
        ? maxMonth
        : currentMonthKey()
  const [yStr, mStr] = effectiveMonth.split('-') as [string, string]
  const year = Number(yStr)
  const month = mStr

  const years = useMemo(() => {
    const nowYear = new Date().getFullYear()
    const minMonthYear = minMonth ? Number(minMonth.split('-')[0]) : undefined
    const maxMonthYear = maxMonth ? Number(maxMonth.split('-')[0]) : undefined
    const start = minYear ?? minMonthYear ?? nowYear - 2
    let end = maxYear ?? maxMonthYear ?? nowYear + 2
    if (end < start) end = start + Math.max(0, maxYears - 1)
    const ys: number[] = []
    for (let y = start; y <= end; y++) ys.push(y)
    return clampYearRange(ys, { centerYear: year, maxYears: Math.max(1, maxYears) })
  }, [minMonth, minYear, maxMonth, maxYear, maxYears, year])

  const availableMonths = useMemo(
    () =>
      MONTHS.filter((mm) => {
        const candidate = `${yStr}-${mm}` as MonthKey
        if (minMonth && candidate < minMonth) return false
        if (maxMonth && candidate > maxMonth) return false
        return true
      }),
    [maxMonth, minMonth, yStr],
  )

  function monthForYear(nextYear: string): string {
    const candidate = `${nextYear}-${month}` as MonthKey
    if (minMonth && candidate < minMonth) return minMonth.split('-')[1] ?? month
    if (maxMonth && candidate > maxMonth) return maxMonth.split('-')[1] ?? month
    return month
  }

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
            {availableMonths.map((mm) => (
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
          onChange(`${y}-${monthForYear(y)}` as MonthKey)
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
