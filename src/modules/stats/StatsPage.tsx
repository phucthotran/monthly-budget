import { PiggyBank, Table2, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { InfoTooltip, PageHeading, PageLoadingSkeleton } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { SavingsTable } from './components/SavingsTable'
import { StatsCharts } from './components/StatsCharts'
import { StatsSummaryTiles } from './components/StatsSummaryTiles'
import { StatsTable } from './components/StatsTable'
import { groupSnapshotsByYear } from './groupSnapshotsByYear'
import { useStatsData } from './hooks/useStatsData'
import { useStatsYearCollapse } from './hooks/useStatsYearCollapse'

export function StatsPage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: budget = [], isHydrated: budgetReady } = useBudgetItems(uid)
  const { data: income = [], isHydrated: incomeReady } = useIncomePeriods(uid)
  const { data: actuals = [], isHydrated: actualsReady } = useActualExpenses(uid)
  const dataLoading = !budgetReady || !incomeReady || !actualsReady

  const { actualAvg, plannedAvg, snaps } = useStatsData({ actuals, budget, income })
  const byYear = useMemo(() => groupSnapshotsByYear(snaps), [snaps])
  const { isYearOpen, toggleYear } = useStatsYearCollapse(byYear)

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton variant="stats" />
      ) : (
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

          <StatsCharts actuals={actuals} budget={budget} income={income} />

          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="flex flex-col sm:grid w-full sm:grid-cols-2 h-20 gap-2 sm:h-10">
              <TabsTrigger value="detail" className="gap-2 whitespace-nowrap min-w-52 w-full sm:w-auto">
                <Table2 className="size-4 shrink-0" />
                <span className="truncate">{t.stats.tabDetail}</span>
                <InfoTooltip content={t.stats.tabDetailTooltip} htmlTag="span" />
              </TabsTrigger>
              <TabsTrigger value="savings" className="gap-2 whitespace-nowrap min-w-52 w-full sm:w-auto">
                <PiggyBank className="size-4 shrink-0" />
                <span className="truncate">{t.stats.tabSavings}</span>
                <InfoTooltip content={t.stats.tabSavingsTooltip} htmlTag="span" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail" className="mt-4">
              <StatsTable
                actuals={actuals}
                budget={budget}
                formatVnd={formatVnd}
                income={income}
                isYearOpen={isYearOpen}
                rows={snaps}
                toggleYear={toggleYear}
              />
            </TabsContent>

            <TabsContent value="savings" className="mt-4">
              <SavingsTable formatVnd={formatVnd} isYearOpen={isYearOpen} rows={snaps} toggleYear={toggleYear} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </RequireAuth>
  )
}
