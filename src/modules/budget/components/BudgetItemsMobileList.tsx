import type { BudgetItemsTableProps } from './BudgetItemsTableDesktop'

import { HandCoinsIcon, Pencil, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { Badge, Button } from '@/components/ui'
import { canRecordActualExpenseForBudgetItem } from '@/lib/budget/apply'
import { formatMonthLabel, isPeriodClosedBefore } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'
import { formatVnd } from '@/lib/vnd'

export function BudgetItemsMobileList({
  actualMap,
  categories,
  items,
  month,
  onAddActual,
  onDelete,
  onEdit,
}: BudgetItemsTableProps) {
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]))
  }, [categories])

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const cat = categoryMap.get(item.categoryId)
        const spent = actualMap.get(`${item.id}|${month}`) ?? 0
        const remaining = item.amountVnd - spent
        const locked = isPeriodClosedBefore(item.validTo, month)
        const canAddActual = canRecordActualExpenseForBudgetItem(item, month)
        return (
          <div key={item.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-semibold leading-snug truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatMonthLabel(item.validFrom)} → {item.validTo ? formatMonthLabel(item.validTo) : '…'}
                </p>
              </div>
              {cat && (
                <Badge variant="secondary" className="shrink-0 max-w-[8rem] truncate">
                  <span className="block truncate">{cat.name}</span>
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">{t.budget.amount}</p>
                <p className="font-medium tabular-nums">{formatVnd(item.amountVnd)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{t.budget.termRemaining}</p>
                <p className={cn('font-medium tabular-nums', remaining < 0 ? 'text-destructive' : 'text-primary')}>
                  {formatVnd(remaining)}
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-0.5">
              <Button
                size="sm"
                variant="secondary"
                className="flex-1 gap-1.5"
                disabled={!canAddActual}
                onClick={() => onAddActual(item)}
              >
                <HandCoinsIcon className="h-3.5 w-3.5" />
                {t.budget.actuals}
              </Button>
              <Button size="sm" variant="outline" disabled={locked} onClick={() => onEdit(item)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={locked}
                onClick={() => onDelete(item)}
                aria-label={t.budget.deleteAction}
              >
                <Trash2 className="h-3.5 w-3.5 text-destructive" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
