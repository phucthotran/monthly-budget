import { useEffect, useMemo, useState } from 'react'

import { currentCalendarYear, yearFilterRange } from '@/lib/month'

/** Shared year filter for budget / income pages: options from `yearFilterRange`, state clamped to allowed years. */
export function useYearFilterPageState() {
  const [filterYear, setFilterYear] = useState(() => currentCalendarYear())
  const yearOptions = useMemo(() => yearFilterRange(), [])

  useEffect(() => {
    if (yearOptions.length === 0) return
    setFilterYear((y) => {
      if (yearOptions.includes(y)) return y
      const cy = currentCalendarYear()
      return yearOptions.includes(cy) ? cy : yearOptions[0]!
    })
  }, [filterYear, yearOptions])

  return { filterYear, setFilterYear, yearOptions }
}
