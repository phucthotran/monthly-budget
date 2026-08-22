import { type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { InfoTooltip, MetricTile } from '@/components/patterns'

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
  const { t } = useTranslation('stats')

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <MetricTile
        title={
          <TileTitleWithHint
            content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('plannedSurplusHint')}</p>}
            label={t('plannedSurplus')}
          />
        }
        description={t('plannedAvgTagline')}
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>{t('averagePerMonth')}</span>
          <span className="font-medium text-foreground tabular-nums">{plannedAvgLabel}</span>
        </div>
      </MetricTile>
      <MetricTile
        title={
          <TileTitleWithHint
            content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('actualSurplusHint')}</p>}
            label={t('actualSurplus')}
          />
        }
        description={t('actualAvgTagline')}
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>{t('averagePerMonth')}</span>
          <span className="font-medium text-foreground tabular-nums">{actualAvgLabel}</span>
        </div>
      </MetricTile>
    </div>
  )
}
