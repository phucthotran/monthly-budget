import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { useMemo } from 'react'

import { buildMonthSnapshots } from '@/lib/budget/aggregate'
import { currentMonthKey, statsMonthKeys } from '@/lib/month'

export function useHomeData({
  actuals,
  budget,
  income,
}: {
  income: IncomePeriod[]
  budget: BudgetItem[]
  actuals: { spentMonth: MonthKey; amountVnd: number }[]
}) {
  return useMemo(() => {
    const month = currentMonthKey()
    const months = statsMonthKeys()
    const snaps = buildMonthSnapshots(months, income, budget, actuals)
    const cur = snaps.find((s) => s.month === month) ?? snaps[0]
    return { cur, month }
  }, [income, budget, actuals])
}
