import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { buildActualByMonth, incomeForMonth, plannedBudgetForMonth } from '@/lib/budget/apply'

export interface MonthSnapshot {
  month: MonthKey
  incomeVnd: number
  plannedVnd: number
  actualSpentVnd: number
  /** Thu nhập − dự chi (kế hoạch). */
  plannedSurplusVnd: number
  /** Thu nhập − chi thực tế. */
  actualSurplusVnd: number
}

export function buildMonthSnapshots(
  months: MonthKey[],
  income: IncomePeriod[],
  budget: BudgetItem[],
  expenses: { spentMonth: MonthKey; amountVnd: number }[],
): MonthSnapshot[] {
  const actualByMonth = buildActualByMonth(expenses)
  return months.map((month) => {
    const incomeVnd = incomeForMonth(month, income)
    const plannedVnd = plannedBudgetForMonth(month, budget)
    const actualSpentVnd = actualByMonth.get(month) ?? 0
    return {
      actualSpentVnd,
      actualSurplusVnd: incomeVnd - actualSpentVnd,
      incomeVnd,
      month,
      plannedSurplusVnd: incomeVnd - plannedVnd,
      plannedVnd,
    }
  })
}
