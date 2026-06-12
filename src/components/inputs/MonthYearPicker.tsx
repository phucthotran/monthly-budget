import { Calendar } from 'lucide-react'
import { useLayoutEffect, useMemo, useRef } from 'react'

import { compareMonthKeys, currentCalendarYear, currentMonthKey, MONTH_KEY_REGEX, type MonthKey } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui'

const MONTHS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))

/** When the allowed year range is wider than `maxYears` (e.g. actual spend on a long budget item), show a centered window. */
function visibleYearsAsc(yearsAsc: number[], centerYear: number, maxYears: number): number[] {
  if (yearsAsc.length <= maxYears) return yearsAsc
  const idx = Math.max(
    0,
    yearsAsc.findIndex((y) => y === centerYear),
  )
  const half = Math.floor(maxYears / 2)
  let start = Math.max(0, idx - half)
  let end = start + maxYears
  if (end > yearsAsc.length) {
    end = yearsAsc.length
    start = Math.max(0, end - maxYears)
  }
  return yearsAsc.slice(start, end)
}

export function MonthYearPicker({
  className,
  invalid,
  maxMonth,
  maxYear,
  maxYears = 5,
  minMonth,
  minYear,
  onChange,
  /**
   * When the stored `value` is before `minMonth` (e.g. "from" moved forward) or after `maxMonth`, re-sync
   * the parent. Use `empty` for optional end date (`''` in form); `minMonth` clamps to the lower bound.
   */
  outOfMinSync = 'minMonth',
  placeholder = t.common.pickMonth,
  value,
}: {
  value: MonthKey
  onChange: (v: MonthKey) => void
  placeholder?: string
  className?: string
  invalid?: boolean
  minMonth?: MonthKey
  maxMonth?: MonthKey
  minYear?: number
  maxYear?: number
  maxYears?: number
  outOfMinSync?: 'empty' | 'minMonth'
}) {
  const trimmed = value?.trim() ?? ''
  const isValidKey = MONTH_KEY_REGEX.test(trimmed)
  /** When outOfMinSync='empty' and value is '', show placeholder in selects rather than minMonth fallback. */
  const displayEmpty = outOfMinSync === 'empty' && !trimmed

  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  useLayoutEffect(() => {
    if (!isValidKey || !trimmed) return
    const v = trimmed as MonthKey
    if (minMonth && compareMonthKeys(v, minMonth) < 0) {
      if (outOfMinSync === 'empty') onChangeRef.current('' as MonthKey)
      else onChangeRef.current(minMonth)
      return
    }
    if (maxMonth && compareMonthKeys(v, maxMonth) > 0) {
      onChangeRef.current(maxMonth)
    }
  }, [isValidKey, maxMonth, minMonth, outOfMinSync, trimmed])

  const effectiveMonth: MonthKey = (() => {
    if (isValidKey) {
      const parsed = trimmed as MonthKey
      if (minMonth && compareMonthKeys(parsed, minMonth) < 0) return minMonth
      if (maxMonth && compareMonthKeys(parsed, maxMonth) > 0) return maxMonth
      return parsed
    }
    if (minMonth) return minMonth
    if (maxMonth) return maxMonth
    return currentMonthKey()
  })()
  const [yStr, mStr] = effectiveMonth.split('-') as [string, string]
  const year = Number(yStr)
  const month = mStr

  const years = useMemo(() => {
    const nowYear = currentCalendarYear()
    const minMonthYear = minMonth ? Number(minMonth.split('-')[0]) : undefined
    const maxMonthYear = maxMonth ? Number(maxMonth.split('-')[0]) : undefined
    // When both are set, the year list must not start below `minMonth`'s year (e.g. end month after start month).
    const fromPropMin = minYear != null && minMonthYear != null ? Math.max(minYear, minMonthYear) : undefined
    const start = fromPropMin ?? minYear ?? minMonthYear ?? nowYear - 2
    let end = maxYear ?? maxMonthYear ?? nowYear + 2
    if (end < start) end = start + Math.max(0, maxYears - 1)
    const ys: number[] = []
    for (let y = start; y <= end; y++) ys.push(y)
    return visibleYearsAsc(ys, year, Math.max(1, maxYears))
  }, [minMonth, minYear, maxMonth, maxYear, maxYears, year])

  const availableMonths = useMemo(
    () =>
      MONTHS.filter((mm) => {
        const candidate = `${yStr}-${mm}` as MonthKey
        if (minMonth && compareMonthKeys(candidate, minMonth) < 0) return false
        if (maxMonth && compareMonthKeys(candidate, maxMonth) > 0) return false
        return true
      }),
    [maxMonth, minMonth, yStr],
  )

  function monthForYear(nextYear: string): string {
    const candidate = `${nextYear}-${month}` as MonthKey
    if (minMonth && compareMonthKeys(candidate, minMonth) < 0) return minMonth.split('-')[1] ?? month
    if (maxMonth && compareMonthKeys(candidate, maxMonth) > 0) return maxMonth.split('-')[1] ?? month
    return month
  }

  return (
    <div className={cn('grid grid-cols-1 gap-2 sm:grid-cols-2', className)}>
      <div className="relative min-w-0">
        <Calendar className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Select
          value={displayEmpty ? '' : month}
          onValueChange={(mm) => {
            onChange(`${yStr}-${mm}` as MonthKey)
          }}
        >
          <SelectTrigger aria-invalid={invalid || undefined} className="pl-8">
            <SelectValue placeholder={placeholder}>{displayEmpty ? null : `T${Number(month)}`}</SelectValue>
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
        value={displayEmpty ? '' : String(year)}
        onValueChange={(y) => {
          onChange(`${y}-${monthForYear(y)}` as MonthKey)
        }}
      >
        <SelectTrigger aria-invalid={invalid || undefined}>
          <SelectValue placeholder={placeholder} />
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
