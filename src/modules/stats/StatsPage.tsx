import { PiggyBank, Table2 } from 'lucide-react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { SavingsTable } from './components/SavingsTable'
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

        <Panel title={t.stats.tabsTitle} description={t.stats.tabsDescription}>
          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="detail" className="gap-2">
                <Table2 className="h-4 w-4" />
                {t.stats.tabDetail}
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-2">
                <PiggyBank className="h-4 w-4" />
                {t.stats.tabSavings}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail" className="mt-4">
              <div className="text-sm text-muted-foreground mb-3">{months.length} tháng</div>
              <StatsTable rows={snaps} formatVnd={formatVnd} />
            </TabsContent>

            <TabsContent value="savings" className="mt-4">
              <SavingsTable rows={snaps} formatVnd={formatVnd} />
            </TabsContent>
          </Tabs>
        </Panel>
      </div>
    </RequireAuth>
  )
}
