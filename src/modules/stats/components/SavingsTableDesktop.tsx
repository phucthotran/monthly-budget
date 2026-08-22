import type { MonthSnapshot } from '@/lib/budget/aggregate'

import { useTranslation } from 'react-i18next'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabelShort } from '@/lib/month'
import { currencyClass } from '@/lib/style-classes'
import { cn } from '@/lib/utils'

import { groupSnapshotsByYear } from '../groupSnapshotsByYear'

import { StatsYearHeaderRow } from './StatsYearHeaderRow'

export type SavingsTableProps = {
  formatVnd: (n: number) => string
  isYearOpen: (year: string) => boolean
  rows: MonthSnapshot[]
  toggleYear: (year: string) => void
}

export function SavingsTableDesktop({ formatVnd, isYearOpen, rows, toggleYear }: SavingsTableProps) {
  const { t } = useTranslation('stats')
  const byYear = groupSnapshotsByYear(rows)

  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[880px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t('month')}</TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t('plannedSurplus')}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('plannedSurplusColumnHint')}</p>}
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t('actualMonthlySurplus')}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t('actualMonthlySurplusColumnHint')}</p>
                  }
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t('savingsAccumulatedMonthly')}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t('savingsAccumulatedColumnHint')}</p>
                  }
                />
              </span>
            </TableHead>
            <TableHead className="text-right whitespace-nowrap">
              <span className="inline-flex w-full items-center justify-end gap-0.5">
                {t('actualAccumulatedMonthly')}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t('actualAccumulatedColumnHint')}</p>
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
                    <TableCell
                      className={cn(
                        'whitespace-nowrap text-right',
                        currencyClass({ positive: s.plannedSavingsToDateVnd >= 0 }),
                      )}
                    >
                      {formatVnd(s.plannedSavingsToDateVnd)}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'whitespace-nowrap text-right',
                        currencyClass({ positive: s.actualSavingsToDateVnd >= 0 }),
                      )}
                    >
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
