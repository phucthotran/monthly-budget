import { useTranslation } from 'react-i18next'

import { Button } from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { coerceMoneyQuickPickCandidate, moneyQuickAmountSuggestions } from '@/lib/money'
import { cn } from '@/lib/utils'

export function VndAmountQuickPick({
  currentAmountVnd,
  onPick,
  plannedHintVnd,
  remainingChipTitle,
  remainingUnspentVnd,
}: {
  currentAmountVnd: number
  onPick: (amountVnd: number) => void
  plannedHintVnd?: number
  remainingChipTitle?: string
  remainingUnspentVnd?: number
}) {
  const { t } = useTranslation()
  const { currency, formatNumber } = useMoney()
  const remainingChipAmount =
    remainingUnspentVnd != null ? coerceMoneyQuickPickCandidate(remainingUnspentVnd, currency) : null
  const chips = moneyQuickAmountSuggestions(currentAmountVnd, currency, plannedHintVnd, remainingUnspentVnd)

  return (
    <div
      aria-label={t('amountQuickPickLabel')}
      className={cn(
        'flex w-full min-w-0 max-w-full gap-1.5',
        'flex-nowrap overflow-x-auto overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        'touch-pan-x md:touch-auto',
        'md:flex-wrap md:overflow-x-visible md:overscroll-auto',
      )}
      role="group"
    >
      {chips.map((n) => {
        const isRemainingChip = remainingChipTitle != null && remainingChipAmount != null && n === remainingChipAmount
        return (
          <Button
            key={n}
            aria-label={isRemainingChip ? `${formatNumber(n)}, ${remainingChipTitle}` : undefined}
            className={cn(
              'h-8 shrink-0 px-2.5 font-normal tabular-nums text-xs',
              isRemainingChip &&
                'border-2 border-primary bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary',
            )}
            title={isRemainingChip ? remainingChipTitle : undefined}
            type="button"
            variant="outline"
            onClick={() => onPick(n)}
          >
            {formatNumber(n)}
          </Button>
        )
      })}
    </div>
  )
}
