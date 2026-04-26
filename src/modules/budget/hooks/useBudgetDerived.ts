import type { ActualExpense } from '@/lib/types'

import { useMemo } from 'react'

import { actualByBudgetItemMonth } from '@/lib/budget/apply'
import { currentMonthKey } from '@/lib/month'

export function useBudgetDerived(actuals: ActualExpense[]) {
  const month = currentMonthKey()
  const actualMap = useMemo(
    () =>
      actualByBudgetItemMonth(
        actuals.map((a) => ({ amountVnd: a.amountVnd, budgetItemId: a.budgetItemId, spentMonth: a.spentMonth })),
      ),
    [actuals],
  )

  return { actualMap, month }
}
