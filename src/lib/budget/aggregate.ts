import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { buildActualByMonth, incomeForMonth, plannedBudgetForMonth } from '@/lib/budget/apply'

export interface MonthSnapshot {
  month: MonthKey
  incomeVnd: number
  plannedVnd: number
  actualSpentVnd: number
  /** Income minus planned budget (planned surplus). */
  plannedSurplusVnd: number
  /** Income minus actual spend (actual surplus). */
  actualSurplusVnd: number
  /** Cumulative planned savings from the start of the range. */
  plannedSavingsToDateVnd: number
}

export function buildMonthSnapshots(
  months: MonthKey[],
  income: IncomePeriod[],
  budget: BudgetItem[],
  expenses: { spentMonth: MonthKey; amountVnd: number }[],
): MonthSnapshot[] {
  const actualByMonth = buildActualByMonth(expenses)
  let plannedToDate = 0

  return months.map((month) => {
    const incomeVnd = incomeForMonth(month, income)
    const plannedVnd = plannedBudgetForMonth(month, budget)
    const actualSpentVnd = actualByMonth.get(month) ?? 0

    const plannedSurplusVnd = incomeVnd - plannedVnd
    const actualSurplusVnd = incomeVnd - actualSpentVnd

    plannedToDate += plannedSurplusVnd

    return {
      actualSpentVnd,
      actualSurplusVnd,
      incomeVnd,
      month,
      plannedSavingsToDateVnd: plannedToDate,
      plannedSurplusVnd,
      plannedVnd,
    }
  })
}
