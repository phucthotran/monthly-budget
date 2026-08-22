import type { BudgetItem, Category, MonthKey } from '@/lib/types'

import { HandCoinsIcon, Pencil, Trash2 } from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { ActionTooltipButton, InfoTooltip } from '@/components/patterns'
import { Badge, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { useMoney } from '@/hooks/useMoney'
import { canRecordActualExpenseForBudgetItem } from '@/lib/budget/apply'
import { currentMonthKey, formatMonthLabel, isPeriodClosedBefore } from '@/lib/month'
import { currencyClass } from '@/lib/style-classes'
import { cn } from '@/lib/utils'

export type BudgetItemsTableProps = {
  month: MonthKey
  items: BudgetItem[]
  categories: Category[]
  actualMap: Map<string, number>
  onAddActual: (item: BudgetItem) => void
  onEdit: (item: BudgetItem) => void
  onDelete: (item: BudgetItem) => void
}

export function BudgetItemsTableDesktop({
  actualMap,
  categories,
  items,
  month,
  onAddActual,
  onDelete,
  onEdit,
}: BudgetItemsTableProps) {
  const { t } = useTranslation('budget')
  const { currency, format } = useMoney()
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]))
  }, [categories])

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[34%]">{t('titleLabel')}</TableHead>
          <TableHead className="w-[18%]">{t('category')}</TableHead>
          <TableHead className="text-right whitespace-nowrap">{t('amount', { currency })}</TableHead>
          <TableHead className="whitespace-nowrap min-w-[8rem]">
            <span className="inline-flex items-center gap-1">
              {t('periodColumn')}
              <InfoTooltip
                className="h-4 w-4"
                content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('periodColumnHint')}</p>}
              />
            </span>
          </TableHead>
          <TableHead className="text-right whitespace-nowrap min-w-[7rem]">
            <span className="inline-flex w-full items-center justify-end gap-1">
              {t('remaining', { currency })}
              <InfoTooltip
                className="h-4 w-4"
                content={<p className="max-w-xs text-pretty text-sm leading-snug">{t('remainingHint')}</p>}
              />
            </span>
          </TableHead>
          <TableHead className="w-[128px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => {
          const cat = categoryMap.get(item.categoryId)
          const spent = actualMap.get(`${item.id}|${month}`) ?? 0
          const remaining = item.amountVnd - spent
          const locked = isPeriodClosedBefore(item.validTo, month)
          const canAddActual = canRecordActualExpenseForBudgetItem(item, currentMonthKey())
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
              <TableCell className={cn('text-right', currencyClass({ positive: item.amountVnd >= 0 }))}>
                {format(item.amountVnd)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {formatMonthLabel(item.validFrom)} → {item.validTo ? formatMonthLabel(item.validTo) : '…'}
              </TableCell>
              <TableCell className={cn('text-right', currencyClass({ positive: remaining >= 0, primary: true }))}>
                {format(remaining)}
              </TableCell>
              <TableCell className="text-right whitespace-nowrap">
                <div className="inline-flex items-center justify-end gap-1">
                  <ActionTooltipButton
                    variant="secondary"
                    onClick={() => onAddActual(item)}
                    label={canAddActual ? t('addActual') : t('viewActual')}
                  >
                    <HandCoinsIcon className="h-4 w-4" />
                  </ActionTooltipButton>
                  <ActionTooltipButton
                    variant="outline"
                    disabled={locked}
                    onClick={() => onEdit(item)}
                    label={locked ? t('periodEndedLocked') : t('editAction')}
                  >
                    <Pencil className="h-4 w-4" />
                  </ActionTooltipButton>
                  <ActionTooltipButton
                    variant="ghost"
                    disabled={locked}
                    onClick={() => onDelete(item)}
                    label={locked ? t('periodEndedLocked') : t('deleteAction')}
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
  )
}
