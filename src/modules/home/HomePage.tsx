import { CalendarDays, LayoutDashboard } from 'lucide-react'
import { useMemo } from 'react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading, PageLoadingSkeleton } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { buildHomeMonthLineItems } from '@/lib/budget/homeMonthBreakdown'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { HomeSummaryTiles } from './components/HomeSummaryTiles'
import { useHomeData } from './hooks/useHomeData'

export function HomePage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: income = [], isHydrated: incomeReady } = useIncomePeriods(uid)
  const { data: budget = [], isHydrated: budgetReady } = useBudgetItems(uid)
  const { data: actuals = [], isHydrated: actualsReady } = useActualExpenses(uid)
  const dataLoading = !incomeReady || !budgetReady || !actualsReady

  const { cur, currentMonth, next, nextMonth } = useHomeData({ actuals, budget, income })

  const breakdownThisMonth = useMemo(
    () => buildHomeMonthLineItems(currentMonth, income, budget, actuals, t.home.orphanedBudgetActual),
    [actuals, budget, currentMonth, income],
  )

  const breakdownNextMonth = useMemo(
    () => (nextMonth ? buildHomeMonthLineItems(nextMonth, income, budget, actuals, t.home.orphanedBudgetActual) : null),
    [actuals, budget, income, nextMonth],
  )

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton variant="home" />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<LayoutDashboard />}
            title={t.home.title}
            description={
              <div className="space-y-2 text-pretty text-base">
                <p>{t.home.subtitle}</p>
                <p className="text-sm text-muted-foreground">{t.home.subtitleDetail}</p>
              </div>
            }
            descriptionClassName="text-base"
          />

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div className="text-base font-semibold tracking-tight">{t.home.thisMonth}</div>
              </div>
              <div className="rounded-full border border-border bg-gray-50 dark:bg-gray-800 px-3 py-1 text-sm text-muted-foreground tabular-nums">
                {formatMonthLabel(currentMonth)}
              </div>
            </div>
            <HomeSummaryTiles
              actualSpentLabel={cur ? formatVnd(cur.actualSpentVnd) : '—'}
              breakdown={breakdownThisMonth}
              incomeLabel={cur ? formatVnd(cur.incomeVnd) : '—'}
              plannedBudgetLabel={cur ? formatVnd(cur.plannedVnd) : '—'}
              plannedSavingsToDateLabel={cur ? formatVnd(cur.plannedSavingsToDateVnd) : '—'}
              plannedSurplusLabel={cur ? formatVnd(cur.plannedSurplusVnd) : '—'}
            />
          </div>

          {next && nextMonth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div className="text-base font-semibold tracking-tight">{t.home.nextMonth}</div>
                </div>
                <div className="rounded-full border border-border bg-gray-50 dark:bg-gray-800 px-3 py-1 text-sm text-muted-foreground tabular-nums">
                  {formatMonthLabel(nextMonth)}
                </div>
              </div>
              <HomeSummaryTiles
                actualSpentLabel={formatVnd(next.actualSpentVnd)}
                breakdown={breakdownNextMonth!}
                incomeLabel={formatVnd(next.incomeVnd)}
                plannedBudgetLabel={formatVnd(next.plannedVnd)}
                plannedSavingsComposition={
                  cur
                    ? {
                        amountLabel: formatVnd(next.plannedSurplusVnd),
                        monthLabel: formatMonthLabel(nextMonth),
                        priorAmountLabel: formatVnd(cur.plannedSavingsToDateVnd),
                        priorMonthLabel: formatMonthLabel(currentMonth),
                      }
                    : undefined
                }
                plannedSavingsToDateLabel={formatVnd(next.plannedSavingsToDateVnd)}
                plannedSurplusLabel={formatVnd(next.plannedSurplusVnd)}
              />
            </div>
          ) : null}
        </div>
      )}
    </RequireAuth>
  )
}
