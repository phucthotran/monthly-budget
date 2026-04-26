import { PiggyBank, Receipt, TrendingUp, Wallet } from 'lucide-react'

import { MetricTile } from '@/components/patterns'
import { t } from '@/lib/strings'

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
    <div className="grid grid-cols-2 gap-4">
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            {t.home.income}
          </span>
        }
      >
        {incomeLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            {t.home.plannedBudget}
          </span>
        }
      >
        {plannedBudgetLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            {t.home.actualSpent}
          </span>
        }
      >
        {actualSpentLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            {t.home.plannedSurplus}
          </span>
        }
      >
        {plannedSurplusLabel}
      </MetricTile>
      <MetricTile
        title={
          <span className="inline-flex items-center gap-2">
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
            {t.home.savingsToDatePlanned}
          </span>
        }
      >
        {plannedSavingsToDateLabel}
      </MetricTile>
    </div>
  )
}
