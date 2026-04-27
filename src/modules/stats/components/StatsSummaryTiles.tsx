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

export function StatsSummaryTiles({
  actualAvgLabel,
  plannedAvgLabel,
}: {
  plannedAvgLabel: string
  actualAvgLabel: string
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricTile
        title={
          <TileTitleWithHint
            content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedSurplusHint}</p>}
            label={t.stats.plannedSurplus}
          />
        }
        description={t.stats.plannedAvgTagline}
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>{t.stats.averagePerMonth}</span>
          <span className="font-medium text-foreground tabular-nums">{plannedAvgLabel}</span>
        </div>
      </MetricTile>
      <MetricTile
        title={
          <TileTitleWithHint
            content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.actualSurplusHint}</p>}
            label={t.stats.actualSurplus}
          />
        }
        description={t.stats.actualAvgTagline}
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>{t.stats.averagePerMonth}</span>
          <span className="font-medium text-foreground tabular-nums">{actualAvgLabel}</span>
        </div>
      </MetricTile>
    </div>
  )
}
