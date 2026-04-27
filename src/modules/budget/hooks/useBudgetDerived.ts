import type { ActualExpense } from '@/lib/types'

import { useMemo } from 'react'

import { actualByBudgetItemMonth } from '@/lib/budget/apply'

export function useBudgetDerived(actuals: ActualExpense[]) {
  const actualMap = useMemo(
    () =>
      actualByBudgetItemMonth(
        actuals.map((a) => ({ amountVnd: a.amountVnd, budgetItemId: a.budgetItemId, spentMonth: a.spentMonth })),
      ),
    [actuals],
  )

  return { actualMap }
}
