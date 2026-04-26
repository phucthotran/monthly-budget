import type { IncomePeriod } from '@/lib/types'

import { Trash2 } from 'lucide-react'

import { Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

export function IncomeTable({
  onDelete,
  onEdit,
  rows,
}: {
  rows: IncomePeriod[]
  onEdit: (row: IncomePeriod) => void
  onDelete: (row: IncomePeriod) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t.income.label}</TableHead>
          <TableHead className="text-right">{t.income.amount}</TableHead>
          <TableHead>Kỳ áp dụng</TableHead>
          <TableHead className="w-[140px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-medium">{row.label}</TableCell>
            <TableCell className="text-right tabular-nums">{formatVnd(row.amountVnd)}</TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatMonthLabel(row.validFrom)} → {row.validTo ? formatMonthLabel(row.validTo) : '…'}
            </TableCell>
            <TableCell className="text-right space-x-2">
              <Button size="sm" variant="outline" type="button" onClick={() => onEdit(row)}>
                Sửa
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => onDelete(row)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
