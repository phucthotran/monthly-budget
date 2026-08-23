import type { BudgetItem } from '@/lib/types'

const viCollator = new Intl.Collator('vi-VN', { sensitivity: 'base' })

export type CategoryIncomeSlice = {
  amountVnd: number
  categoryId: null | string
}

export type CategoryIncomeSplit = {
  incomeVnd: number
  leftoverVnd: number
  overspentVnd: number
  slices: CategoryIncomeSlice[]
}

/** Groups actual spend by budget-item category for one income total. */
export function categoryIncomeSplit(
  incomeVnd: number,
  expenses: { amountVnd: number; budgetItemId: string }[],
  budget: Pick<BudgetItem, 'categoryId' | 'id'>[],
): CategoryIncomeSplit {
  const categoryByBudgetId = new Map(budget.map((item) => [item.id, item.categoryId]))
  const byCategory = new Map<null | string, number>()
  let actualSpentVnd = 0

  for (const expense of expenses) {
    actualSpentVnd += expense.amountVnd
    const raw = categoryByBudgetId.get(expense.budgetItemId)
    const categoryId = raw && raw.length > 0 ? raw : null
    byCategory.set(categoryId, (byCategory.get(categoryId) ?? 0) + expense.amountVnd)
  }

  const slices = [...byCategory.entries()]
    .filter(([, amountVnd]) => amountVnd > 0)
    .map(([categoryId, amountVnd]) => ({ amountVnd, categoryId }))
    .sort((a, b) => {
      const byAmount = b.amountVnd - a.amountVnd
      if (byAmount !== 0) return byAmount
      if (a.categoryId == null) return 1
      if (b.categoryId == null) return -1
      return viCollator.compare(a.categoryId, b.categoryId)
    })

  return {
    incomeVnd,
    leftoverVnd: Math.max(0, incomeVnd - actualSpentVnd),
    overspentVnd: Math.max(0, actualSpentVnd - incomeVnd),
    slices,
  }
}
