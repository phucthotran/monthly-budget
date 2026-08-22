import { useTranslation } from 'react-i18next'

import { VndAmountQuickPick } from '@/components/inputs'

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
  const { t } = useTranslation('budget')
  const remainingUnspent = plannedAmountVnd - spentInMonthVnd

  return (
    <VndAmountQuickPick
      currentAmountVnd={currentAmountVnd}
      plannedHintVnd={plannedAmountVnd}
      remainingChipTitle={t('actualAmountQuickPickRemainingTitle')}
      remainingUnspentVnd={remainingUnspent}
      onPick={onPick}
    />
  )
}
