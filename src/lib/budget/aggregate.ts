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
  /** Tiết kiệm tích lũy (kế hoạch) từ đầu phạm vi. */
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
