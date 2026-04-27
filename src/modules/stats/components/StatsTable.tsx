import type { MonthSnapshot } from '@/lib/budget/aggregate'
import type { ReactNode } from 'react'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabelShort } from '@/lib/month'
import { t } from '@/lib/strings'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'

import { StatsYearHeaderRow } from './StatsYearHeaderRow'

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

export function StatsTable({
  formatVnd,
  isYearOpen,
  rows,
  toggleYear,
}: {
  formatVnd: (n: number) => string
  isYearOpen: (year: string) => boolean
  rows: MonthSnapshot[]
  toggleYear: (year: string) => void
}) {
  const byYear = groupSnapshotsByYear(rows)
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[760px]">
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
          </TableRow>
        </TableHeader>
        {byYear.map(({ rows: yearRows, year }) => (
          <TableBody key={year}>
            <StatsYearHeaderRow
              colSpan={5}
              isOpen={isYearOpen(year)}
              year={year}
              onToggle={() => {
                toggleYear(year)
              }}
            />
            {isYearOpen(year)
              ? yearRows.map((s) => (
                  <TableRow key={s.month}>
                    <TableCell className="whitespace-nowrap font-medium">{formatMonthLabelShort(s.month)}</TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatVnd(s.incomeVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatVnd(s.plannedVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums">
                      {formatVnd(s.actualSpentVnd)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right tabular-nums text-primary">
                      {formatVnd(s.plannedSurplusVnd)}
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
