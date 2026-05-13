import type { ActualExpense, MonthKey } from '@/lib/types'

import { Button } from '@/components/ui'
import { compareMonthKeys } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'
import { coerceVndQuickPickCandidate, formatVndNumber, vndQuickAmountSuggestions } from '@/lib/vnd'

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
  const remainingChipAmount = coerceVndQuickPickCandidate(remainingUnspent)
  const chips = vndQuickAmountSuggestions(currentAmountVnd, plannedAmountVnd, remainingUnspent)

  return (
    <div aria-label={t.budget.actualAmountQuickPickLabel} className="flex flex-wrap gap-1.5" role="group">
      {chips.map((n) => {
        const isRemainingChip = remainingChipAmount != null && n === remainingChipAmount
        return (
          <Button
            key={n}
            aria-label={
              isRemainingChip ? `${formatVndNumber(n)}, ${t.budget.actualAmountQuickPickRemainingTitle}` : undefined
            }
            className={cn(
              'h-8 px-2.5 font-normal tabular-nums text-xs',
              isRemainingChip &&
                'border-2 border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )}
            title={isRemainingChip ? t.budget.actualAmountQuickPickRemainingTitle : undefined}
            type="button"
            variant="outline"
            onClick={() => onPick(n)}
          >
            {formatVndNumber(n)}
          </Button>
        )
      })}
    </div>
  )
}
