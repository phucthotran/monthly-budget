import type { MonthSnapshot } from '@/lib/budget/aggregate'

import { InfoTooltip } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

export function SavingsTable({ formatVnd, rows }: { rows: MonthSnapshot[]; formatVnd: (n: number) => string }) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[520px]">
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
                {t.stats.savingsAccumulatedMonthly}
                <InfoTooltip
                  className="h-4 w-4 shrink-0"
                  content={
                    <p className="max-w-xs text-pretty text-sm leading-snug">{t.stats.savingsAccumulatedColumnHint}</p>
                  }
                />
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((s) => (
            <TableRow key={s.month}>
              <TableCell className="font-medium whitespace-nowrap">{formatMonthLabel(s.month)}</TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap text-primary">
                {formatVnd(s.plannedSurplusVnd)}
              </TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">
                {formatVnd(s.plannedSavingsToDateVnd)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
