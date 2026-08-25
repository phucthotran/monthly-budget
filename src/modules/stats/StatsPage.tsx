import { PiggyBank, Table2, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/components/AuthProvider'
import { InfoTooltip, PageHeading, PageLoadingSkeleton } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { useActualExpenses, useBudgetItems, useCategories, useIncomePeriods } from '@/hooks/useUserCollections'

import { SavingsTable } from './components/SavingsTable'
import { StatsCharts } from './components/StatsCharts'
import { StatsSummaryTiles } from './components/StatsSummaryTiles'
import { StatsTable } from './components/StatsTable'
import { groupSnapshotsByYear } from './groupSnapshotsByYear'
import { useStatsData } from './hooks/useStatsData'
import { useStatsYearCollapse } from './hooks/useStatsYearCollapse'

export function StatsPage() {
  const { t } = useTranslation('stats')
  const { format } = useMoney()
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: budget = [], isHydrated: budgetReady } = useBudgetItems(uid)
  const { data: income = [], isHydrated: incomeReady } = useIncomePeriods(uid)
  const { data: actuals = [], isHydrated: actualsReady } = useActualExpenses(uid)
  const { data: categories = [], isHydrated: categoriesReady } = useCategories(uid)
  const dataLoading = !budgetReady || !incomeReady || !actualsReady || !categoriesReady

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
            title={t('title')}
            description={
              <div className="space-y-2 text-pretty">
                <p>{t('pageLead')}</p>
                <p className="text-sm text-muted-foreground">{t('pageDetail')}</p>
              </div>
            }
          />

          <StatsSummaryTiles plannedAvgLabel={format(plannedAvg)} actualAvgLabel={format(actualAvg)} />

          <StatsCharts actuals={actuals} budget={budget} categories={categories} income={income} />

          <Tabs defaultValue="detail" className="w-full">
            <TabsList className="flex flex-col h-auto sm:grid w-full grid-cols-2 gap-1 sm:h-10">
              <TabsTrigger value="detail" className="w-full sm:w-auto min-w-0 gap-1.5 px-2 text-xs sm:px-3 sm:text-sm">
                <Table2 className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{t('tabDetail')}</span>
                <InfoTooltip content={t('tabDetailTooltip')} htmlTag="span" />
              </TabsTrigger>
              <TabsTrigger value="savings" className="w-full sm:w-auto min-w-0 gap-1.5 px-2 text-xs sm:px-3 sm:text-sm">
                <PiggyBank className="size-4 shrink-0" />
                <span className="min-w-0 truncate">{t('tabSavings')}</span>
                <InfoTooltip content={t('tabSavingsTooltip')} htmlTag="span" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="detail" className="mt-4">
              <StatsTable
                actuals={actuals}
                budget={budget}
                formatVnd={format}
                income={income}
                isYearOpen={isYearOpen}
                rows={snaps}
                toggleYear={toggleYear}
              />
            </TabsContent>

            <TabsContent value="savings" className="mt-4">
              <SavingsTable formatVnd={format} isYearOpen={isYearOpen} rows={snaps} toggleYear={toggleYear} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </RequireAuth>
  )
}
