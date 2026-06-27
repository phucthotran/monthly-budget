import { useEffect, useMemo, useState } from 'react'

import { currentCalendarYear, statsChartYearRange } from '@/lib/month'

/** Stats chart year filter: current calendar year default; five prior and five upcoming years. */
export function useStatsChartYearState() {
  const [filterYear, setFilterYear] = useState(() => currentCalendarYear())
  const yearOptions = useMemo(() => statsChartYearRange(), [])

  useEffect(() => {
    if (yearOptions.length === 0) return
    setFilterYear((y) => {
      if (yearOptions.includes(y)) return y
      const cy = currentCalendarYear()
      return yearOptions.includes(cy) ? cy : yearOptions[yearOptions.length - 1]!
    })
  }, [filterYear, yearOptions])

  return { filterYear, setFilterYear, yearOptions }
}
