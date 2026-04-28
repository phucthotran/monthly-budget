import type { BudgetItem, IncomePeriod, MonthKey } from '@/lib/types'

import { isMonthInRange } from '@/lib/month'

const viCollator = new Intl.Collator('vi-VN', { sensitivity: 'base' })

export type HomeMonthLineItem = {
  amountVnd: number
  id: string
  label: string
}

function sortIncomePeriodsForMonth(month: MonthKey, periods: IncomePeriod[]): IncomePeriod[] {
  return [...periods]
    .filter((p) => isMonthInRange(month, p.validFrom, p.validTo))
    .sort((a, b) => {
      const byFrom = (a.validFrom ?? '').localeCompare(b.validFrom ?? '')
      if (byFrom !== 0) return byFrom
      return viCollator.compare(a.label ?? '', b.label ?? '')
    })
}

function sortBudgetItemsForMonth(month: MonthKey, items: BudgetItem[]): BudgetItem[] {
  return [...items]
    .filter((b) => isMonthInRange(month, b.validFrom, b.validTo))
    .sort((a, b) => {
      const byFrom = (a.validFrom ?? '').localeCompare(b.validFrom ?? '')
      if (byFrom !== 0) return byFrom
      return viCollator.compare(a.title ?? '', b.title ?? '')
    })
}

/**
 * Builds per-row income, planned budget, and actual spend lines for a calendar month for the Home summary tiles.
 */
export function buildHomeMonthLineItems(
  month: MonthKey,
  income: IncomePeriod[],
  budget: BudgetItem[],
  actuals: { amountVnd: number; budgetItemId: string; spentMonth: MonthKey }[],
  orphanedBudgetTitle: string,
): {
  actualLines: HomeMonthLineItem[]
  incomeLines: HomeMonthLineItem[]
  plannedLines: HomeMonthLineItem[]
} {
  const incomeLines = sortIncomePeriodsForMonth(month, income).map((p) => ({
    amountVnd: p.amountVnd,
    id: p.id,
    label: p.label ?? '',
  }))

  const plannedLines = sortBudgetItemsForMonth(month, budget).map((b) => ({
    amountVnd: b.amountVnd,
    id: b.id,
    label: b.title ?? '',
  }))

  const aggregated = new Map<string, number>()
  for (const e of actuals) {
    if (e.spentMonth !== month) continue
    const id = e.budgetItemId
    aggregated.set(id, (aggregated.get(id) ?? 0) + e.amountVnd)
  }

  const budgetById = new Map(budget.map((b) => [b.id, b]))

  const tied: HomeMonthLineItem[] = []
  const orphaned: HomeMonthLineItem[] = []

  for (const [budgetItemId, amountVnd] of aggregated) {
    const b = budgetById.get(budgetItemId)
    const line = { amountVnd, id: budgetItemId, label: b?.title ?? orphanedBudgetTitle }
    if (b) {
      tied.push(line)
    } else {
      orphaned.push(line)
    }
  }

  tied.sort((a, b) => {
    const ba = budgetById.get(a.id)!
    const bb = budgetById.get(b.id)!
    const byFrom = (ba.validFrom ?? '').localeCompare(bb.validFrom ?? '')
    if (byFrom !== 0) return byFrom
    return viCollator.compare(ba.title ?? '', bb.title ?? '')
  })

  orphaned.sort((a, b) => viCollator.compare(a.label, b.label))

  const actualLines = [...tied, ...orphaned]

  return {
    actualLines,
    incomeLines,
    plannedLines,
  }
}
