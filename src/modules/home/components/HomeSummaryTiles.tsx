import { MetricTile } from '@/components/patterns'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

export function HomeSummaryTiles({
  actualSurplusLabel,
  month,
  plannedSurplusLabel,
}: {
  month: string
  plannedSurplusLabel: string
  actualSurplusLabel: string
}) {
  const monthLabel = formatMonthLabel(month)

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <MetricTile title={t.home.plannedSurplus} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {plannedSurplusLabel}
      </MetricTile>
      <MetricTile title={t.home.actualSurplus} description={`${t.home.thisMonth}: ${monthLabel}`}>
        {actualSurplusLabel}
      </MetricTile>
    </div>
  )
}
