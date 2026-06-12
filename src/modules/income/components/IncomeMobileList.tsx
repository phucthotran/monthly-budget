import type { IncomeTableProps } from './IncomeTableDesktop'

import { Pencil, Trash2 } from 'lucide-react'

import { Button } from '@/components/ui'
import { formatMonthLabel, isPeriodClosedBefore } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

export function IncomeMobileList({ asOfMonth, onDelete, onEdit, rows }: IncomeTableProps) {
  return (
    <div className="space-y-3">
      {rows.map((row) => {
        const locked = isPeriodClosedBefore(row.validTo, asOfMonth)
        return (
          <div key={row.id} className="rounded-lg border border-border bg-card p-4 space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug truncate">{row.label}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMonthLabel(row.validFrom)} → {row.validTo ? formatMonthLabel(row.validTo) : '…'}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <Button size="sm" variant="outline" disabled={locked} onClick={() => onEdit(row)}>
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={locked}
                  onClick={() => onDelete(row)}
                  aria-label={t.income.deleteAction}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </div>
            </div>
            <p className="text-base font-semibold tabular-nums">{formatVnd(row.amountVnd)}</p>
          </div>
        )
      })}
    </div>
  )
}
