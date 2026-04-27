import type { BudgetItem, Category, MonthKey } from '@/lib/types'

import { Trash2 } from 'lucide-react'

import { InfoTooltip } from '@/components/patterns'
import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'
import { formatVnd } from '@/lib/vnd'

export function BudgetItemsTable({
  actualMap,
  categories,
  items,
  month,
  onAddActual,
  onDelete,
  onEdit,
}: {
  month: MonthKey
  items: BudgetItem[]
  categories: Category[]
  actualMap: Map<string, number>
  onAddActual: (item: BudgetItem) => void
  onEdit: (item: BudgetItem) => void
  onDelete: (item: BudgetItem) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[34%]">{t.budget.titleLabel}</TableHead>
          <TableHead className="w-[18%]">{t.budget.category}</TableHead>
          <TableHead className="text-right whitespace-nowrap">{t.budget.amount}</TableHead>
          <TableHead className="whitespace-nowrap min-w-[8rem]">
            <span className="inline-flex items-center gap-1">
              {t.budget.periodColumn}
              <InfoTooltip
                className="h-4 w-4"
                content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.budget.periodColumnHint}</p>}
              />
            </span>
          </TableHead>
          <TableHead className="text-right whitespace-nowrap min-w-[7rem]">
            <span className="inline-flex w-full items-center justify-end gap-1">
              {t.budget.remaining}
              <InfoTooltip
                className="h-4 w-4"
                content={<p className="max-w-xs text-pretty text-sm leading-snug">{t.budget.remainingHint}</p>}
              />
            </span>
          </TableHead>
          <TableHead className="w-[220px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const cat = categories.find((c) => c.id === item.categoryId)
          const spent = actualMap.get(`${item.id}|${month}`) ?? 0
          const remaining = item.amountVnd - spent
          return (
            <TableRow key={item.id}>
              <TableCell className="font-medium max-w-[12rem] sm:max-w-[18rem] truncate">
                <span className="block truncate">{item.title}</span>
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="max-w-[10rem] truncate">
                  <span className="block truncate">{cat?.name ?? '—'}</span>
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(item.amountVnd)}</TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatMonthLabel(item.validFrom)} → {item.validTo ? formatMonthLabel(item.validTo) : '…'}
              </TableCell>
              <TableCell className="text-right tabular-nums whitespace-nowrap">{formatVnd(remaining)}</TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    type="button"
                    onClick={() => onAddActual(item)}
                    className="whitespace-nowrap"
                  >
                    {t.budget.addActual}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() => onEdit(item)}
                    className="whitespace-nowrap"
                  >
                    {t.budget.edit}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => onDelete(item)}
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}
