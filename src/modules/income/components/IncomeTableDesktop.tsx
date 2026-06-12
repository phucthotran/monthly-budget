import type { MonthKey } from '@/lib/month'
import type { IncomePeriod } from '@/lib/types'

import { Pencil, Trash2 } from 'lucide-react'

import { ActionTooltipButton } from '@/components/patterns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel, isPeriodClosedBefore } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

export type IncomeTableProps = {
  asOfMonth: MonthKey
  rows: IncomePeriod[]
  onEdit: (row: IncomePeriod) => void
  onDelete: (row: IncomePeriod) => void
}

export function IncomeTableDesktop({ asOfMonth, onDelete, onEdit, rows }: IncomeTableProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4">
      <Table className="min-w-[720px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">{t.income.label}</TableHead>
            <TableHead className="text-right whitespace-nowrap">{t.income.amount}</TableHead>
            <TableHead className="whitespace-nowrap">{t.common.period}</TableHead>
            <TableHead className="w-[96px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const locked = isPeriodClosedBefore(row.validTo, asOfMonth)
            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium max-w-[18rem] truncate">
                  <span className="block truncate">{row.label}</span>
                </TableCell>
                <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(row.amountVnd)}</TableCell>
                <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                  {formatMonthLabel(row.validFrom)} → {row.validTo ? formatMonthLabel(row.validTo) : '…'}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap">
                  <div className="inline-flex items-center justify-end gap-1">
                    <ActionTooltipButton
                      variant="outline"
                      disabled={locked}
                      onClick={() => onEdit(row)}
                      label={locked ? t.common.periodEndedLocked : t.income.editAction}
                    >
                      <Pencil className="h-4 w-4" />
                    </ActionTooltipButton>
                    <ActionTooltipButton
                      variant="ghost"
                      disabled={locked}
                      onClick={() => onDelete(row)}
                      label={locked ? t.common.periodEndedLocked : t.income.deleteAction}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </ActionTooltipButton>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
