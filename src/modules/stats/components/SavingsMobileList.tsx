import type { SavingsTableProps } from './SavingsTableDesktop'

import { ChevronDown } from 'lucide-react'

import { formatMonthLabelShort } from '@/lib/month'
import { t } from '@/lib/strings'
import { currencyClass } from '@/lib/style-classes'
import { cn } from '@/lib/utils'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'

export function SavingsMobileList({ formatVnd, isYearOpen, rows, toggleYear }: SavingsTableProps) {
  const byYear = groupSnapshotsByYear(rows)

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
              {yearRows.map((s) => (
                <div key={s.month} className="rounded-lg border border-border bg-card p-3.5 space-y-2.5">
                  <p className="font-semibold text-sm">{formatMonthLabelShort(s.month)}</p>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">{t.stats.plannedSurplus}</p>
                      <p className={currencyClass({ positive: s.plannedSurplusVnd >= 0, primary: true })}>
                        {formatVnd(s.plannedSurplusVnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.stats.actualMonthlySurplus}</p>
                      <p className={currencyClass({ positive: s.actualSurplusVnd >= 0, primary: true })}>
                        {formatVnd(s.actualSurplusVnd)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border/60 pt-2.5 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">{t.stats.savingsAccumulatedMonthly}</p>
                      <p className={currencyClass({ positive: s.plannedSavingsToDateVnd >= 0 })}>
                        {formatVnd(s.plannedSavingsToDateVnd)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">{t.stats.actualAccumulatedMonthly}</p>
                      <p className={currencyClass({ positive: s.actualSavingsToDateVnd >= 0 })}>
                        {formatVnd(s.actualSavingsToDateVnd)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
