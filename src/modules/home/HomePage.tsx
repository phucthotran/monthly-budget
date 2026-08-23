import { CalendarDays, LayoutDashboard } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useAuthContext } from '@/components/AuthProvider'
import { IncomeSplitChart, PageHeading, PageLoadingSkeleton } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { useMoney } from '@/hooks/useMoney'
import { usePreferencesMutations } from '@/hooks/usePreferencesMutations'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { buildHomeMonthLineItems } from '@/lib/budget/homeMonthBreakdown'
import { incomeSplit, overspentSharePercent } from '@/lib/budget/incomeSplit'
import { DEFAULT_CURRENCY } from '@/lib/money'
import { formatMonthLabel } from '@/lib/month'

import { HomeIncomeTile } from './components/HomeIncomeTile'
import { HomeSummaryTiles } from './components/HomeSummaryTiles'
import { OnboardingCard } from './components/OnboardingCard'
import { useHomeData } from './hooks/useHomeData'

export function HomePage() {
  const { t } = useTranslation('home')
  const { user } = useAuthContext()
  const uid = user?.uid
  const { format } = useMoney()
  const { isHydrated: prefsReady, isLocked } = useUserPreferences(uid)
  const mutations = usePreferencesMutations(uid)

  const { data: income = [], isHydrated: incomeReady } = useIncomePeriods(uid)
  const { data: budget = [], isHydrated: budgetReady } = useBudgetItems(uid)
  const { data: actuals = [], isHydrated: actualsReady } = useActualExpenses(uid)
  const dataLoading = !incomeReady || !budgetReady || !actualsReady

  const { cur, currentMonth, next, nextMonth } = useHomeData({ actuals, budget, income })

  const isNewUser = income.length === 0 && budget.length === 0

  useEffect(() => {
    if (!prefsReady || isLocked || isNewUser || !mutations) return
    void mutations.setCurrencyOnce(DEFAULT_CURRENCY).catch(() => {
      // Already locked or offline — display stays on VND fallback.
    })
  }, [isLocked, isNewUser, mutations, prefsReady])

  const breakdownThisMonth = useMemo(
    () => buildHomeMonthLineItems(currentMonth, income, budget, actuals, t('orphanedBudgetActual')),
    [actuals, budget, currentMonth, income, t],
  )

  const breakdownNextMonth = useMemo(
    () => (nextMonth ? buildHomeMonthLineItems(nextMonth, income, budget, actuals, t('orphanedBudgetActual')) : null),
    [actuals, budget, income, nextMonth, t],
  )

  const split = useMemo(() => incomeSplit(cur ? [cur] : []), [cur])

  return (
    <RequireAuth>
      {dataLoading ? (
        <PageLoadingSkeleton variant="home" />
      ) : (
        <div className="space-y-6">
          <PageHeading
            icon={<LayoutDashboard />}
            title={t('title')}
            description={
              <div className="space-y-2 text-pretty text-base">
                <p>{t('subtitle')}</p>
                <p className="text-sm text-muted-foreground">{t('subtitleDetail')}</p>
              </div>
            }
            descriptionClassName="text-base"
          />

          {isNewUser ? <OnboardingCard /> : null}

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div className="text-base font-semibold tracking-tight">{t('thisMonth')}</div>
              </div>
              <div className="rounded-full border border-border bg-gray-50 dark:bg-gray-800 px-3 py-1 text-sm text-muted-foreground tabular-nums">
                {formatMonthLabel(currentMonth)}
              </div>
            </div>
            {!isNewUser ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <IncomeSplitChart
                  actualLabel={t('actualSpent')}
                  centerLabel={t('chartIncomeSplitCenter')}
                  centerOverspentLabel={t('chartIncomeSplitCenterOver')}
                  className="h-full"
                  empty={t('chartIncomeSplitEmpty')}
                  leftoverLabel={t('chartLeftover')}
                  overspent={t('chartIncomeSplitOverspent', {
                    amount: format(split.overspentVnd),
                    percent: overspentSharePercent(split),
                  })}
                  split={split}
                  title={t('chartTitleIncomeSplit')}
                />
                <HomeIncomeTile
                  className="h-full"
                  incomeLabel={cur ? format(cur.incomeVnd) : '—'}
                  incomeLines={breakdownThisMonth.incomeLines}
                />
              </div>
            ) : null}
            <HomeSummaryTiles
              actualSavingsToDateLabel={cur ? format(cur.actualSavingsToDateVnd) : '—'}
              actualSpentLabel={cur ? format(cur.actualSpentVnd) : '—'}
              actualSurplusLabel={cur ? format(cur.actualSurplusVnd) : '—'}
              breakdown={breakdownThisMonth}
              incomeLabel={cur ? format(cur.incomeVnd) : '—'}
              omitIncome={!isNewUser}
              plannedBudgetLabel={cur ? format(cur.plannedVnd) : '—'}
              plannedSavingsToDateLabel={cur ? format(cur.plannedSavingsToDateVnd) : '—'}
              plannedSurplusLabel={cur ? format(cur.plannedSurplusVnd) : '—'}
            />
          </div>

          {next && nextMonth ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-primary" />
                  <div className="text-base font-semibold tracking-tight">{t('nextMonth')}</div>
                </div>
                <div className="rounded-full border border-border bg-gray-50 dark:bg-gray-800 px-3 py-1 text-sm text-muted-foreground tabular-nums">
                  {formatMonthLabel(nextMonth)}
                </div>
              </div>
              <p className="text-sm text-muted-foreground text-pretty">{t('nextMonthPlannedOnlyNote')}</p>
              <HomeSummaryTiles
                breakdown={breakdownNextMonth!}
                incomeLabel={format(next.incomeVnd)}
                plannedBudgetLabel={format(next.plannedVnd)}
                plannedOverviewOnly
                plannedSavingsComposition={
                  cur
                    ? {
                        amountLabel: format(next.plannedSurplusVnd),
                        monthLabel: formatMonthLabel(nextMonth),
                        priorAmountLabel: format(cur.actualSavingsToDateVnd),
                        priorBasis: 'actual',
                        priorMonthLabel: formatMonthLabel(currentMonth),
                      }
                    : undefined
                }
                plannedSavingsHint={t('nextMonthPlannedAccumulationHint')}
                plannedSavingsToDateLabel={
                  cur
                    ? format(cur.actualSavingsToDateVnd + next.plannedSurplusVnd)
                    : format(next.plannedSavingsToDateVnd)
                }
                plannedSurplusLabel={format(next.plannedSurplusVnd)}
              />
            </div>
          ) : null}
        </div>
      )}
    </RequireAuth>
  )
}
