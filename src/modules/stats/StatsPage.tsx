import { PiggyBank, Table2, TrendingUp } from 'lucide-react'

import { useAuthContext } from '@/components/AuthProvider'
import { InfoTooltip, PageHeading, Panel } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { monthCountLabel, t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { SavingsTable } from './components/SavingsTable'
import { StatsSummaryTiles } from './components/StatsSummaryTiles'
import { StatsTable } from './components/StatsTable'
import { useStatsData } from './hooks/useStatsData'

export function StatsPage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: budget = [] } = useBudgetItems(uid)
  const { data: income = [] } = useIncomePeriods(uid)
  const { data: actuals = [] } = useActualExpenses(uid)

  const { actualAvg, months, plannedAvg, snaps } = useStatsData({ actuals, budget, income })

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading
          icon={<TrendingUp />}
          title={t.stats.title}
          description={
            <div className="space-y-2 text-pretty">
              <p>{t.stats.pageLead}</p>
              <p className="text-sm text-muted-foreground">{t.stats.pageDetail}</p>
            </div>
          }
        />

        <StatsSummaryTiles plannedAvgLabel={formatVnd(plannedAvg)} actualAvgLabel={formatVnd(actualAvg)} />

        <Panel title={<></>}>
          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-10">
              <TabsTrigger value="detail" className="gap-2">
                <Table2 className="h-4 w-4" />
                {t.stats.tabDetail} <InfoTooltip content={t.stats.tabDetailTooltip} />
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-2">
                <PiggyBank className="h-4 w-4" /> {t.stats.tabSavings}{' '}
                <InfoTooltip content={t.stats.tabSavingsTooltip} />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail" className="mt-4">
              <div className="text-sm text-muted-foreground mb-3">{monthCountLabel(months.length)}</div>
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
