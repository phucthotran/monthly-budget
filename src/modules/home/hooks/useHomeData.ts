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
    const months = statsMonthKeys()
    const snaps = buildMonthSnapshots(months, income, budget, actuals)
    const currentMonth = currentMonthKey()
    const cur = snaps.find((s) => s.month === currentMonth) ?? snaps[0]
    const nextMonth = months[0] === currentMonth ? months[1] : months[months.indexOf(currentMonth) + 1]
    const next = nextMonth ? snaps.find((s) => s.month === nextMonth) : undefined
    return { cur, currentMonth, next, nextMonth }
  }, [income, budget, actuals])
}
