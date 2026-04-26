import { MetricTile } from '@/components/patterns'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

export function HomeSummaryTiles({
  actualSpentLabel,
  incomeLabel,
  month,
  plannedBudgetLabel,
  plannedSurplusLabel,
}: {
  month: string
  incomeLabel: string
  plannedBudgetLabel: string
  actualSpentLabel: string
  plannedSurplusLabel: string
}) {
  const monthLabel = formatMonthLabel(month)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile title={t.home.income} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {incomeLabel}
      </MetricTile>
      <MetricTile title={t.home.plannedBudget} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {plannedBudgetLabel}
      </MetricTile>
      <MetricTile title={t.home.actualSpent} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {actualSpentLabel}
      </MetricTile>
      <MetricTile title={t.home.plannedSurplus} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {plannedSurplusLabel}
      </MetricTile>
    </div>
  )
}
