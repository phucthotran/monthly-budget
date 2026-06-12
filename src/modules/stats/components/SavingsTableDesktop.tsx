import type { MonthSnapshot } from '@/lib/budget/aggregate'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabelShort } from '@/lib/month'
import { t } from '@/lib/strings'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'

import { StatsYearHeaderRow } from './StatsYearHeaderRow'

export type SavingsTableProps = {
  formatVnd: (n: number) => string
  isYearOpen: (year: string) => boolean
  rows: MonthSnapshot[]
  toggleYear: (year: string) => void
}

export function SavingsTableDesktop({ formatVnd, isYearOpen, rows, toggleYear }: SavingsTableProps) {
  const byYear = groupSnapshotsByYear(rows)

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t.stats.month}</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t.stats.plannedSurplus}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.plannedSurplusColumnHint}</p>
                  }
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t.stats.actualMonthlySurplus}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">
                      {t.stats.actualMonthlySurplusColumnHint}
                    </p>
                  }
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t.stats.savingsAccumulatedMonthly}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.savingsAccumulatedColumnHint}</p>
                  }
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t.stats.actualAccumulatedMonthly}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.actualAccumulatedColumnHint}</p>
                  }
                />
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        {byYear.map(({ rows: yearRows, year }) => (
          <TableBody key={year}>
            <StatsYearHeaderRow colSpan={5} isOpen={isYearOpen(year)} year={year} onToggle={() => toggleYear(year)} />
            {isYearOpen(year)
              ? yearRows.map((s) => (
                  <TableRow key={s.month}>
                    <TableCell className="whitespace-nowrap font-medium">{formatMonthLabelShort(s.month)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums text-primary">
                      {formatVnd(s.plannedSurplusVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums text-primary">
                      {formatVnd(s.actualSurplusVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatVnd(s.plannedSavingsToDateVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatVnd(s.actualSavingsToDateVnd)}
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        ))}
      </Table>
    </div>
  )
}
