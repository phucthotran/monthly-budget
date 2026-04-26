import { MetricTile } from '@/components/patterns'
import { t } from '@/lib/strings'

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
        title={t.home.plannedSurplus}
        description="Tổng theo các tháng trong phạm vi (kế hoạch)."
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>Trung bình / tháng</span>
          <span className="font-medium text-foreground tabular-nums">{plannedAvgLabel}</span>
        </div>
      </MetricTile>
      <MetricTile
        title={t.home.actualSurplus}
        description="Dựa trên chi thực tế đã ghi."
        contentClassName="text-sm text-muted-foreground space-y-1 font-normal"
      >
        <div className="flex justify-between">
          <span>Trung bình / tháng</span>
          <span className="font-medium text-foreground tabular-nums">{actualAvgLabel}</span>
        </div>
      </MetricTile>
    </div>
  )
}
