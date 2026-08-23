import { useCallback, useEffect, useMemo, useState } from 'react'

import { currentCalendarYear, currentMonthKey, statsChartYearRange } from '@/lib/month'

export const PIE_MONTH_SCOPE_ALL = 'all'

export type PieMonthScope =
  | '01'
  | '02'
  | '03'
  | '04'
  | '05'
  | '06'
  | '07'
  | '08'
  | '09'
  | '10'
  | '11'
  | '12'
  | typeof PIE_MONTH_SCOPE_ALL

const MONTH_SCOPE_RE = /^(0[1-9]|1[0-2])$/

export function isPieMonthScope(value: string): value is PieMonthScope {
  return value === PIE_MONTH_SCOPE_ALL || MONTH_SCOPE_RE.test(value)
}

/** Current month in the current year; whole year otherwise. */
export function defaultPieMonthScope(year: number, now = new Date()): PieMonthScope {
  if (year === currentCalendarYear(now)) {
    const mm = currentMonthKey(now).slice(5, 7)
    return isPieMonthScope(mm) ? mm : PIE_MONTH_SCOPE_ALL
  }
  return PIE_MONTH_SCOPE_ALL
}

/** Stats chart year filter: current calendar year default; five prior and five upcoming years. */
export function useStatsChartYearState() {
  const [filterYear, setFilterYearState] = useState(() => currentCalendarYear())
  const [monthScope, setMonthScopeState] = useState<PieMonthScope>(() => defaultPieMonthScope(currentCalendarYear()))
  const yearOptions = useMemo(() => statsChartYearRange(), [])

  useEffect(() => {
    if (yearOptions.length === 0) return
    setFilterYearState((y) => {
      if (yearOptions.includes(y)) return y
      const cy = currentCalendarYear()
      return yearOptions.includes(cy) ? cy : yearOptions[yearOptions.length - 1]!
    })
  }, [filterYear, yearOptions])

  useEffect(() => {
    setMonthScopeState(defaultPieMonthScope(filterYear))
  }, [filterYear])

  const setFilterYear = useCallback((year: number) => {
    setFilterYearState(year)
  }, [])

  const setMonthScope = useCallback((scope: PieMonthScope) => {
    setMonthScopeState(scope)
  }, [])

  return { filterYear, monthScope, setFilterYear, setMonthScope, yearOptions }
}
