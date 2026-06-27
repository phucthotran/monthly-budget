import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { buildMonthSnapshots } from '@/lib/budget/aggregate'
import { calendarYearMonthKeys } from '@/lib/month'

export function buildChartYearSnapshots(
  year: number,
  income: IncomePeriod[],
  budget: BudgetItem[],
  actuals: { spentMonth: MonthKey; amountVnd: number }[],
) {
  const months = calendarYearMonthKeys(year)
  return buildMonthSnapshots(months, income, budget, actuals)
}
