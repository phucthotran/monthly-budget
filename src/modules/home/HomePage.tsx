import { CalendarDays, LayoutDashboard } from 'lucide-react'

import { useAuthContext } from '@/components/AuthProvider'
import { PageHeading } from '@/components/patterns'
import { RequireAuth } from '@/components/RequireAuth'
import { useActualExpenses, useBudgetItems, useIncomePeriods } from '@/hooks/useUserCollections'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

import { HomeSummaryTiles } from './components/HomeSummaryTiles'
import { useHomeData } from './hooks/useHomeData'

export function HomePage() {
  const { user } = useAuthContext()
  const uid = user?.uid

  const { data: income = [] } = useIncomePeriods(uid)
  const { data: budget = [] } = useBudgetItems(uid)
  const { data: actuals = [] } = useActualExpenses(uid)

  const { cur, currentMonth, next, nextMonth } = useHomeData({ actuals, budget, income })

  return (
    <RequireAuth>
      <div className="space-y-6">
        <PageHeading
          icon={<LayoutDashboard />}
          title={t.home.title}
          description={t.home.subtitle}
          descriptionClassName="text-base"
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-primary" />
              <div className="text-base font-semibold tracking-tight">{t.home.thisMonth}</div>
            </div>
            <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground tabular-nums">
              {formatMonthLabel(currentMonth)}
            </div>
          </div>
          <HomeSummaryTiles
            incomeLabel={cur ? formatVnd(cur.incomeVnd) : '—'}
            plannedBudgetLabel={cur ? formatVnd(cur.plannedVnd) : '—'}
            actualSpentLabel={cur ? formatVnd(cur.actualSpentVnd) : '—'}
            plannedSurplusLabel={cur ? formatVnd(cur.plannedSurplusVnd) : '—'}
            plannedSavingsToDateLabel={cur ? formatVnd(cur.plannedSavingsToDateVnd) : '—'}
          />
        </div>

        {next && nextMonth ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />
                <div className="text-base font-semibold tracking-tight">{t.home.nextMonth}</div>
              </div>
              <div className="rounded-full border border-border bg-muted px-3 py-1 text-sm text-muted-foreground tabular-nums">
                {formatMonthLabel(nextMonth)}
              </div>
            </div>
            <HomeSummaryTiles
              incomeLabel={formatVnd(next.incomeVnd)}
              plannedBudgetLabel={formatVnd(next.plannedVnd)}
              actualSpentLabel={formatVnd(next.actualSpentVnd)}
              plannedSurplusLabel={formatVnd(next.plannedSurplusVnd)}
              plannedSavingsToDateLabel={formatVnd(next.plannedSavingsToDateVnd)}
            />
          </div>
        ) : null}
      </div>
    </RequireAuth>
  )
}
