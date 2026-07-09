import type { MonthSnapshot } from '@/lib/budget/aggregate'
import type { ActualExpense, BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'
import type { ReactNode } from 'react'

import { Fragment, useMemo } from 'react'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { buildHomeMonthLineItems } from '@/lib/budget/homeMonthBreakdown'
import { formatMonthLabelShort } from '@/lib/month'
import { t } from '@/lib/strings'
import { currencyClass } from '@/lib/style-classes'
import { cn } from '@/lib/utils'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'
import { StatsTableColgroup } from '../statsTableColgroup'

import { StatsMonthDetailRows } from './StatsMonthBreakdown'
import { StatsYearHeaderRow } from './StatsYearHeaderRow'

export type StatsTableProps = {
  actuals: ActualExpense[]
  budget: BudgetItem[]
  formatVnd: (n: number) => string
  income: IncomePeriod[]
  isYearOpen: (year: string) => boolean
  rows: MonthSnapshot[]
  toggleYear: (year: string) => void
}

function HeadWithHint({
  align = 'right',
  className,
  content,
  label,
}: {
  align?: 'left' | 'right'
  className?: string
  content: ReactNode
  label: string
}) {
  return (
    <TableHead className={className ?? (align === 'right' ? 'text-right whitespace-nowrap' : 'whitespace-nowrap')}>
      <span
        className={
          align === 'right' ? 'inline-flex w-full items-center justify-end gap-0.5' : 'inline-flex items-center gap-0.5'
        }
      >
        {label}
        <InfoTooltip className="h-4 w-4 shrink-0" content={content} />
      </span>
    </TableHead>
  )
}

export function StatsTableDesktop({
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
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[920px] w-full table-fixed">
        <StatsTableColgroup />
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t.stats.month}</TableHead>
            <HeadWithHint
              label={t.stats.income}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.incomeColumnHint}</p>}
            />
            <HeadWithHint
              label={t.stats.planned}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedHintColumn}</p>}
            />
            <HeadWithHint
              label={t.stats.actual}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.actualColumnHint}</p>}
            />
            <HeadWithHint
              label={t.stats.plannedSurplus}
              content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedSurplusColumnHint}</p>}
            />
            <HeadWithHint
              label={t.stats.actualMonthlySurplus}
              content={
                <p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.actualMonthlySurplusColumnHint}</p>
              }
            />
          </TableRow>
        </TableHeader>
        {byYear.map(({ rows: yearRows, year }) => (
          <TableBody key={year}>
            <StatsYearHeaderRow colSpan={6} isOpen={isYearOpen(year)} year={year} onToggle={() => toggleYear(year)} />
            {isYearOpen(year)
              ? yearRows.map((s) => {
                  const bd = breakdownByMonth.get(s.month)!
                  const hasBreakdownLines = bd.plannedLines.length > 0
                  return (
                    <Fragment key={s.month}>
                      <TableRow className="border-b border-border">
                        <TableCell className="whitespace-nowrap font-medium">
                          {formatMonthLabelShort(s.month)}
                        </TableCell>
                        <TableCell
                          className={cn('whitespace-nowrap text-right', currencyClass({ positive: s.incomeVnd >= 0 }))}
                        >
                          {formatVnd(s.incomeVnd)}
                        </TableCell>
                        <TableCell
                          className={cn('whitespace-nowrap text-right', currencyClass({ positive: s.plannedVnd >= 0 }))}
                        >
                          {formatVnd(s.plannedVnd)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'whitespace-nowrap text-right',
                            currencyClass({ positive: s.actualSpentVnd >= 0 }),
                          )}
                        >
                          {formatVnd(s.actualSpentVnd)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'whitespace-nowrap text-right',
                            currencyClass({ positive: s.plannedSurplusVnd >= 0, primary: true }),
                          )}
                        >
                          {formatVnd(s.plannedSurplusVnd)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            'whitespace-nowrap text-right',
                            currencyClass({ positive: s.actualSurplusVnd >= 0, primary: true }),
                          )}
                        >
                          {formatVnd(s.actualSurplusVnd)}
                        </TableCell>
                      </TableRow>
                      {hasBreakdownLines ? (
                        <StatsMonthDetailRows
                          formatVnd={formatVnd}
                          plannedLines={bd.plannedLines}
                          actualLines={bd.actualLines}
                        />
                      ) : null}
                    </Fragment>
                  )
                })
              : null}
          </TableBody>
        ))}
      </Table>
    </div>
  )
}
