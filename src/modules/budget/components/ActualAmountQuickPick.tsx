import type { ActualExpense, MonthKey } from '@/lib/types'

import { VndAmountQuickPick } from '@/components/inputs'
import { compareMonthKeys } from '@/lib/month'
import { t } from '@/lib/strings'

export function ActualAmountQuickPick({
  actuals,
  budgetItemId,
  currentAmountVnd,
  onPick,
  plannedAmountVnd,
  spentMonth,
}: {
  actuals: ActualExpense[]
  budgetItemId: string
  currentAmountVnd: number
  plannedAmountVnd: number
  spentMonth: MonthKey
  onPick: (amountVnd: number) => void
}) {
  const spentInMonth = actuals
    .filter((a) => a.budgetItemId === budgetItemId && compareMonthKeys(a.spentMonth, spentMonth) === 0)
    .reduce((sum, a) => sum + a.amountVnd, 0)
  const remainingUnspent = plannedAmountVnd - spentInMonth

  return (
    <VndAmountQuickPick
      currentAmountVnd={currentAmountVnd}
      plannedHintVnd={plannedAmountVnd}
      remainingChipTitle={t.budget.actualAmountQuickPickRemainingTitle}
      remainingUnspentVnd={remainingUnspent}
      onPick={onPick}
    />
  )
}
