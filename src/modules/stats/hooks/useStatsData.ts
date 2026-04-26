import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { useMemo } from 'react'

import { buildMonthSnapshots } from '@/lib/budget/aggregate'
import { statsMonthKeys } from '@/lib/month'

export function useStatsData({
  actuals,
  budget,
  income,
}: {
  income: IncomePeriod[]
  budget: BudgetItem[]
  actuals: { spentMonth: MonthKey; amountVnd: number }[]
}) {
  return useMemo(() => {
    const months = statsMonthKeys()
    const snaps = buildMonthSnapshots(months, income, budget, actuals)

    const plannedAvg = snaps.reduce((a, s) => a + s.plannedSurplusVnd, 0) / Math.max(snaps.length, 1)
    const actualAvg = snaps.reduce((a, s) => a + s.actualSurplusVnd, 0) / Math.max(snaps.length, 1)

    return { actualAvg, months, plannedAvg, snaps }
  }, [income, budget, actuals])
}
