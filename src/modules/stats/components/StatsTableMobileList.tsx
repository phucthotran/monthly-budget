import type { StatsTableProps } from './StatsTableDesktop'
import type { MonthSnapshot } from '@/lib/budget/aggregate'
import type { MonthKey } from '@/lib/types'

import { ChevronDown } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui'
import { buildHomeMonthLineItems } from '@/lib/budget/homeMonthBreakdown'
import { formatMonthLabelShort } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'

function MobileMonthCard({
  formatVnd,
  lineItems,
  snapshot,
}: {
  snapshot: MonthSnapshot
  formatVnd: (n: number) => string
  lineItems: ReturnType<typeof buildHomeMonthLineItems>
}) {
  const [expanded, setExpanded] = useState(false)
  const hasBreakdown = lineItems.plannedLines.length > 0

  return (
    <div className="rounded-lg border border-border bg-card p-3.5 space-y-3">
      <p className="font-semibold text-sm">{formatMonthLabelShort(snapshot.month)}</p>

      <div className="grid grid-cols-3 gap-x-2 gap-y-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground truncate">{t.stats.income}</p>
          <p className="tabular-nums font-medium">{formatVnd(snapshot.incomeVnd)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground truncate">{t.stats.planned}</p>
          <p className="tabular-nums font-medium">{formatVnd(snapshot.plannedVnd)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground truncate">{t.stats.actual}</p>
          <p className="tabular-nums font-medium">{formatVnd(snapshot.actualSpentVnd)}</p>
        </div>
      </div>

      <div className="border-t border-border/60 pt-2.5 grid grid-cols-2 gap-x-2 text-sm">
        <div>
          <p className="text-xs text-muted-foreground truncate">{t.stats.plannedSurplus}</p>
          <p className="tabular-nums font-semibold text-primary">{formatVnd(snapshot.plannedSurplusVnd)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground truncate">{t.stats.actualMonthlySurplus}</p>
          <p className="tabular-nums font-semibold text-primary">{formatVnd(snapshot.actualSurplusVnd)}</p>
        </div>
      </div>

      {hasBreakdown && (
        <div className="border-t border-border/60 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto w-full justify-start gap-1.5 px-0 py-0.5 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setExpanded((v) => !v)}
          >
            <ChevronDown
              className={cn('h-3.5 w-3.5 shrink-0 transition-transform', expanded && '-rotate-180')}
              aria-hidden
            />
            {expanded ? t.stats.collapseMonthBreakdown : t.stats.expandMonthBreakdown}
            {!expanded && <span className="text-muted-foreground/70">({lineItems.plannedLines.length})</span>}
          </Button>

          {expanded && (
            <div className="mt-2 space-y-1.5">
              {lineItems.plannedLines.map((planned) => {
                const actual = lineItems.actualLines.find((a) => a.id === planned.id)
                return (
                  <div key={planned.id} className="grid grid-cols-3 gap-x-2 text-xs py-1 border-t border-border/40">
                    <div className="col-span-3 text-foreground/80 truncate mb-0.5">{planned.label}</div>
                    <div>
                      <p className="text-muted-foreground">{t.stats.planned}: </p>
                      <p className="tabular-nums">{formatVnd(planned.amountVnd)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.stats.actual}: </p>
                      <p className="tabular-nums">{formatVnd(actual?.amountVnd ?? 0)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">{t.budget.termRemaining}: </p>
                      <p className="tabular-nums">{formatVnd(planned.amountVnd - (actual?.amountVnd ?? 0))}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function StatsTableMobileList({
  actuals,
  budget,
  formatVnd,
  income,
  isYearOpen,
  rows,
  toggleYear,
}: StatsTableProps) {
  const byYear = groupSnapshotsByYear(rows)
  const breakdownByMonth = useMemo(() => {
    const map = new Map<MonthKey, ReturnType<typeof buildHomeMonthLineItems>>()
    for (const s of rows) {
      map.set(s.month, buildHomeMonthLineItems(s.month, income, budget, actuals, t.home.orphanedBudgetActual))
    }
    return map
  }, [actuals, budget, income, rows])

  return (
    <div className="space-y-4">
      {byYear.map(({ rows: yearRows, year }) => (
        <div key={year}>
          <button
            type="button"
            className="flex w-full items-center gap-1.5 rounded-md bg-slate-200 px-3 py-2 text-sm font-semibold text-foreground dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            aria-expanded={isYearOpen(year)}
            onClick={() => toggleYear(year)}
          >
            <ChevronDown className={cn('h-4 w-4 shrink-0 transition-transform', !isYearOpen(year) && '-rotate-90')} />
            {year}
          </button>

          {isYearOpen(year) && (
            <div className="mt-2 space-y-2">
              {yearRows.map((s) => {
                const bd = breakdownByMonth.get(s.month)!
                return <MobileMonthCard key={s.month} formatVnd={formatVnd} lineItems={bd} snapshot={s} />
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
