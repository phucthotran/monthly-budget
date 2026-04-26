import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { StatsSummaryTiles } from './components/StatsSummaryTiles'
import { StatsTable } from './components/StatsTable'
import { useStatsData } from './hooks/useStatsData'

export function StatsPage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: income = [] } = useIncomePeriods(uid)
  const { data: budget = [] } = useBudgetItems(uid)
  const { data: actuals = [] } = useActualExpenses(uid)

  const { actualAvg, months, plannedAvg, snaps } = useStatsData({ actuals, budget, income })

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading title={t.stats.title} description={t.stats.subtitle} />

        <StatsSummaryTiles plannedAvgLabel={formatVnd(plannedAvg)} actualAvgLabel={formatVnd(actualAvg)} />

        <Panel title="Bảng chi tiết" description={`${months.length} tháng`}>
          <StatsTable rows={snaps} formatVnd={formatVnd} />
        </Panel>
      </div>
    </RequireAuth>
  )
}
