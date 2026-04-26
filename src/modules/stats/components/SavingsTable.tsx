import type { MonthSnapshot } from '@/lib/budget/aggregate'

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
            <TableHead className="text-right whitespace-nowrap">{t.stats.plannedSurplus}</TableHead>
            <TableHead className="text-right whitespace-nowrap">Tích lũy tiết kiệm (Từng tháng)</TableHead>
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
