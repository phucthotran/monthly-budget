import { Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { MetricTile } from '@/components/patterns'
import { type HomeMonthLineItem } from '@/lib/budget/homeMonthBreakdown'
import { cn } from '@/lib/utils'

import { AggregateTileContents } from './AggregateTileContents'
import { BreakdownLines } from './BreakdownLines'
import { TileTitleWithHint } from './TileTitleWithHint'

export type HomeIncomeTileProps = {
  className?: string
  incomeLabel: string
  incomeLines: readonly HomeMonthLineItem[]
}

export function HomeIncomeTile({ className, incomeLabel, incomeLines }: HomeIncomeTileProps) {
  const { t } = useTranslation('home')

  return (
    <MetricTile
      className={cn('min-w-0', className)}
      title={
        <span className="inline-flex items-center gap-2">
          <Wallet className="size-5 text-muted-foreground shrink-0" />
          <TileTitleWithHint
            content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('incomeHint')}</p>}
            label={t('income')}
          />
        </span>
      }
      contentClassName="font-normal"
    >
      <AggregateTileContents footer={<BreakdownLines lines={incomeLines} />}>
        <span className="text-primary">{incomeLabel}</span>
      </AggregateTileContents>
    </MetricTile>
  )
}
