import { useEffect, useMemo, useState } from 'react'

import { currentCalendarYear, type PeriodStatusFilter, yearFilterRange } from '@/lib/month'

/** Shared year + period-status filters for budget / income list pages. */
export function usePeriodListPageState() {
  const [filterYear, setFilterYear] = useState(() => currentCalendarYear())
  const [periodStatus, setPeriodStatus] = useState<PeriodStatusFilter>('active')
  const yearOptions = useMemo(() => yearFilterRange(), [])

  useEffect(() => {
    if (yearOptions.length === 0) return
    setFilterYear((y) => {
      if (yearOptions.includes(y)) return y
      const cy = currentCalendarYear()
      return yearOptions.includes(cy) ? cy : yearOptions[0]!
    })
  }, [filterYear, yearOptions])

  return { filterYear, periodStatus, setFilterYear, setPeriodStatus, yearOptions }
}
