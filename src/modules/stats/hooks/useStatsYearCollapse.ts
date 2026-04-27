import { useCallback, useMemo, useState } from 'react'

import { currentMonthKey } from '@/lib/month'

export function useStatsYearCollapse(byYear: { year: string }[]) {
  const defaultOpenYear = useMemo(() => {
    const y = currentMonthKey().slice(0, 4)
    return byYear.some((b) => b.year === y) ? y : (byYear[0]?.year ?? '')
  }, [byYear])

  const [overrides, setOverrides] = useState<Record<string, boolean>>({})

  const isYearOpen = useCallback(
    (year: string) => {
      if (Object.hasOwn(overrides, year)) return overrides[year]!
      return year === defaultOpenYear
    },
    [defaultOpenYear, overrides],
  )

  const toggleYear = useCallback(
    (year: string) => {
      setOverrides((o) => {
        const prev = Object.hasOwn(o, year) ? o[year]! : year === defaultOpenYear
        return { ...o, [year]: !prev }
      })
    },
    [defaultOpenYear],
  )

  return { isYearOpen, toggleYear }
}
