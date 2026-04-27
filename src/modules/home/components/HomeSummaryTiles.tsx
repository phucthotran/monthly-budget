import { PiggyBank, Receipt, TrendingUp, Wallet } from 'lucide-react'
import { type ReactNode } from 'react'

import { InfoTooltip, MetricTile } from '@/components/patterns'
import { t } from '@/lib/strings'

function TileTitleWithHint({ content, label }: { content: ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 min-w-0">
      {label}
      <InfoTooltip content={content} className="h-5 w-5 shrink-0" />
    </span>
  )
}

export function HomeSummaryTiles({
  actualSpentLabel,
  incomeLabel,
  plannedBudgetLabel,
  plannedSavingsToDateLabel,
  plannedSurplusLabel,
}: {
  incomeLabel: string
  plannedBudgetLabel: string
  actualSpentLabel: string
  plannedSavingsToDateLabel: string
  plannedSurplusLabel: string
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.incomeHint}</p>}
              label={t.home.income}
            />
          </span>
        }
      >
        {incomeLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedBudgetHint}</p>}
              label={t.home.plannedBudget}
            />
          </span>
        }
      >
        {plannedBudgetLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.actualSpentHint}</p>}
              label={t.home.actualSpent}
            />
          </span>
        }
      >
        {actualSpentLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedSurplusHint}</p>}
              label={t.home.plannedSurplus}
            />
          </span>
        }
      >
        {plannedSurplusLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground shrink-0" />
            <TileTitleWithHint
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.home.plannedSavingsHint}</p>}
              label={t.home.savingsToDatePlanned}
            />
          </span>
        }
      >
        {plannedSavingsToDateLabel}
      </MetricTile>
    </div>
  )
}
