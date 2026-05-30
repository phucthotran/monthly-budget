import type { ActualExpense, MonthKey } from '@/lib/types'

import { Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { ActionTooltipButton } from '@/components/patterns'
import {
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { useActualExpenses } from '@/hooks/useUserCollections'
import { formatDateLong } from '@/lib/datetime'
import { compareMonthKeys, formatMonthLabel } from '@/lib/month'
import { t } from '@/lib/strings'
import { cn } from '@/lib/utils'
import { formatVnd } from '@/lib/vnd'

function sortActualExpenseRows(rows: ActualExpense[]): ActualExpense[] {
  return [...rows].sort((a, b) => {
    const byCreated = a.createdAt - b.createdAt
    if (byCreated !== 0) return byCreated
    return a.amountVnd - b.amountVnd
  })
}

function ActualExpenseMonthTabPanel({
  budgetItemId,
  deleteLocked,
  onDeleteLine,
  spentMonth,
  uid,
}: {
  uid: string
  budgetItemId: string
  spentMonth: MonthKey
  deleteLocked: boolean
  onDeleteLine: (expense: ActualExpense) => void
}) {
  const { data: rows = [], isHydrated } = useActualExpenses(uid, spentMonth, budgetItemId)
  const sorted = useMemo(() => sortActualExpenseRows(rows), [rows])

  if (!isHydrated) {
    return (
      <div className="space-y-2 py-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <p className="text-sm text-muted-foreground">{t.common.loading}</p>
      </div>
    )
  }

  if (sorted.length === 0) {
    return <p className="py-2 text-sm text-muted-foreground">{t.budget.actualLinesEmpty}</p>
  }

  return (
    <div className="-mx-1 max-h-[min(40vh,18rem)] overflow-x-auto overflow-y-auto px-1">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">{t.budget.amount}</TableHead>
            <TableHead className="whitespace-nowrap">{t.common.note}</TableHead>
            <TableHead className="whitespace-nowrap">{t.budget.createdAt}</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="whitespace-nowrap text-sm font-medium tabular-nums">
                {formatVnd(row.amountVnd)}
              </TableCell>
              <TableCell className="max-w-[10rem] truncate text-sm">{row.note?.trim() || '—'}</TableCell>
              <TableCell className="text-sm">{formatDateLong(row.createdAt)}</TableCell>
              <TableCell className="whitespace-nowrap p-1 text-right align-middle">
                <ActionTooltipButton
                  aria-label={t.common.delete}
                  className="h-8 w-8 shrink-0 p-0"
                  disabled={deleteLocked}
                  label={deleteLocked ? t.budget.periodEndedLocked : t.common.delete}
                  variant="ghost"
                  onClick={() => onDeleteLine(row)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </ActionTooltipButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export function ActualExpenseMonthTabs({
  budgetItemId,
  defaultMonth,
  deleteLocked,
  onDeleteLine,
  uid,
}: {
  uid: string
  budgetItemId: string
  defaultMonth: MonthKey
  deleteLocked: boolean
  onDeleteLine: (expense: ActualExpense) => void
}) {
  const { data: itemActuals = [], isHydrated: tabMonthsReady } = useActualExpenses(uid, undefined, budgetItemId)
  const [viewMonth, setViewMonth] = useState(defaultMonth)

  const tabMonths = useMemo(() => {
    const months = new Set<MonthKey>([defaultMonth])
    for (const row of itemActuals) {
      months.add(row.spentMonth)
    }
    return [...months].sort((a, b) => compareMonthKeys(b, a))
  }, [defaultMonth, itemActuals])

  useEffect(() => {
    setViewMonth(defaultMonth)
  }, [budgetItemId, defaultMonth])

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="text-sm font-medium">{t.budget.actualLinesHeading}</div>
      {!tabMonthsReady ? (
        <div className="space-y-2 py-1">
          <Skeleton className="h-9 w-full max-w-md" />
          <p className="text-sm text-muted-foreground">{t.common.loading}</p>
        </div>
      ) : (
        <Tabs className="min-w-0" value={viewMonth} onValueChange={(value) => setViewMonth(value as MonthKey)}>
          <TabsList
            className={cn(
              'mb-2 flex h-auto w-full justify-start gap-1 overflow-x-auto p-1',
              'scrollbar-thin scrollbar-track-transparent',
            )}
          >
            {tabMonths.map((month) => (
              <TabsTrigger key={month} className="shrink-0 whitespace-nowrap px-3" value={month}>
                {formatMonthLabel(month)}
              </TabsTrigger>
            ))}
          </TabsList>
          {tabMonths.map((month) => (
            <TabsContent key={month} className="mt-0 min-w-0" value={month}>
              {viewMonth === month ? (
                <ActualExpenseMonthTabPanel
                  budgetItemId={budgetItemId}
                  deleteLocked={deleteLocked}
                  spentMonth={month}
                  uid={uid}
                  onDeleteLine={onDeleteLine}
                />
              ) : null}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  )
}
