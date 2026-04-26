import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { isMonthInRange } from '@/lib/month'

export function incomeForMonth(month: MonthKey, periods: IncomePeriod[]): number {
  return periods.filter((p) => isMonthInRange(month, p.validFrom, p.validTo)).reduce((s, p) => s + p.amountVnd, 0)
}

export function plannedBudgetForMonth(month: MonthKey, items: BudgetItem[]): number {
  return items.filter((b) => isMonthInRange(month, b.validFrom, b.validTo)).reduce((s, b) => s + b.amountVnd, 0)
}

export function actualSpentForMonth(month: MonthKey, byMonth: Map<MonthKey, number>): number {
  return byMonth.get(month) ?? 0
}

/** Tổng chi thực tế theo từng tháng (tất cả khoản). */
export function buildActualByMonth(expenses: { spentMonth: MonthKey; amountVnd: number }[]): Map<MonthKey, number> {
  const map = new Map<MonthKey, number>()
  for (const e of expenses) {
    map.set(e.spentMonth, (map.get(e.spentMonth) ?? 0) + e.amountVnd)
  }
  return map
}

/** Chi thực tế theo `budgetItemId` trong một tháng. */
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

export function remainingForBudgetItem(
  item: BudgetItem,
  month: MonthKey,
  actualMap: Map<string, number>,
): null | number {
  if (!isMonthInRange(month, item.validFrom, item.validTo)) return null
  const spent = actualMap.get(`${item.id}|${month}`) ?? 0
  return item.amountVnd - spent
}
