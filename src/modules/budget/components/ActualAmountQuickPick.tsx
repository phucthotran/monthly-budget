import { VndAmountQuickPick } from '@/components/inputs'
import { t } from '@/lib/strings'

export function ActualAmountQuickPick({
  currentAmountVnd,
  onPick,
  plannedAmountVnd,
  spentInMonthVnd,
}: {
  currentAmountVnd: number
  plannedAmountVnd: number
  spentInMonthVnd: number
  onPick: (amountVnd: number) => void
}) {
  const remainingUnspent = plannedAmountVnd - spentInMonthVnd

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
