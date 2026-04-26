import type { MonthSnapshot } from '@/lib/budget/aggregate'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'

export function StatsTable({ formatVnd, rows }: { rows: MonthSnapshot[]; formatVnd: (n: number) => string }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.stats.month}</TableHead>
          <TableHead className="text-right">{t.stats.income}</TableHead>
          <TableHead className="text-right">{t.stats.planned}</TableHead>
          <TableHead className="text-right">{t.stats.actual}</TableHead>
          <TableHead className="text-right">{t.stats.plannedSurplus}</TableHead>
          <TableHead className="text-right">{t.stats.actualSurplus}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((s) => (
          <TableRow key={s.month}>
            <TableCell className="font-medium">{formatMonthLabel(s.month)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatVnd(s.incomeVnd)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatVnd(s.plannedVnd)}</TableCell>
            <TableCell className="text-right tabular-nums">{formatVnd(s.actualSpentVnd)}</TableCell>
            <TableCell className="text-right tabular-nums text-primary">{formatVnd(s.plannedSurplusVnd)}</TableCell>
            <TableCell className="text-right tabular-nums text-primary">{formatVnd(s.actualSurplusVnd)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
