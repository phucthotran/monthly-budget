import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { compareMonthKeys, isMonthInRange } from '@/lib/month'

export type ActualMonthBounds = {
  latest: MonthKey
  oldest: MonthKey
}

export function actualSpentMonthBoundsByItemId(
  actuals: { budgetItemId: string; spentMonth: MonthKey }[],
): Map<string, ActualMonthBounds> {
  const map = new Map<string, ActualMonthBounds>()
  for (const a of actuals) {
    const prev = map.get(a.budgetItemId)
    if (!prev) {
      map.set(a.budgetItemId, { latest: a.spentMonth, oldest: a.spentMonth })
      continue
    }
    if (compareMonthKeys(a.spentMonth, prev.oldest) < 0) prev.oldest = a.spentMonth
    if (compareMonthKeys(a.spentMonth, prev.latest) > 0) prev.latest = a.spentMonth
  }
  return map
}

export function periodCoversActualMonthBounds(
  validFrom: MonthKey,
  validTo: MonthKey | null,
  bounds: ActualMonthBounds,
): boolean {
  if (compareMonthKeys(validFrom, bounds.oldest) > 0) return false
  if (validTo !== null && compareMonthKeys(validTo, bounds.latest) < 0) return false
  return true
}

export function incomeForMonth(month: MonthKey, periods: IncomePeriod[]): number {
  return periods.filter((p) => isMonthInRange(month, p.validFrom, p.validTo)).reduce((s, p) => s + p.amountVnd, 0)
}

export function plannedBudgetForMonth(month: MonthKey, items: BudgetItem[]): number {
  return items.filter((b) => isMonthInRange(month, b.validFrom, b.validTo)).reduce((s, b) => s + b.amountVnd, 0)
}

export function canRecordActualExpenseForBudgetItem(item: BudgetItem, month: MonthKey): boolean {
  return isMonthInRange(month, item.validFrom, item.validTo)
}

export function buildActualByMonth(expenses: { spentMonth: MonthKey; amountVnd: number }[]): Map<MonthKey, number> {
  const map = new Map<MonthKey, number>()
  for (const e of expenses) {
    map.set(e.spentMonth, (map.get(e.spentMonth) ?? 0) + e.amountVnd)
  }
  return map
}

export function actualByBudgetItemMonth(
  expenses: { budgetItemId: string; spentMonth: MonthKey; amountVnd: number }[],
): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    const key = `${e.budgetItemId}|${e.spentMonth}`
    map.set(key, (map.get(key) ?? 0) + e.amountVnd)
  }
  return map
}
