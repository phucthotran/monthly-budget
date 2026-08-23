import { describe, expect, it } from 'vitest'

import { categoryIncomeSplit } from '@/lib/budget/categoryIncomeSplit'

describe('categoryIncomeSplit', () => {
  it('groups spend by category and reports leftover', () => {
    const result = categoryIncomeSplit(
      1_000_000,
      [
        { amountVnd: 200_000, budgetItemId: 'rent' },
        { amountVnd: 100_000, budgetItemId: 'power' },
        { amountVnd: 50_000, budgetItemId: 'rent' },
      ],
      [
        { categoryId: 'housing', id: 'rent' },
        { categoryId: 'utilities', id: 'power' },
      ],
    )

    expect(result.incomeVnd).toBe(1_000_000)
    expect(result.leftoverVnd).toBe(650_000)
    expect(result.overspentVnd).toBe(0)
    expect(result.slices).toEqual([
      { amountVnd: 250_000, categoryId: 'housing' },
      { amountVnd: 100_000, categoryId: 'utilities' },
    ])
  })

  it('reports overspend when actual exceeds income', () => {
    const result = categoryIncomeSplit(
      100_000,
      [{ amountVnd: 180_000, budgetItemId: 'rent' }],
      [{ categoryId: 'housing', id: 'rent' }],
    )

    expect(result.leftoverVnd).toBe(0)
    expect(result.overspentVnd).toBe(80_000)
    expect(result.slices).toEqual([{ amountVnd: 180_000, categoryId: 'housing' }])
  })

  it('puts orphaned budget items in a null category slice', () => {
    const result = categoryIncomeSplit(
      500_000,
      [
        { amountVnd: 80_000, budgetItemId: 'gone' },
        { amountVnd: 20_000, budgetItemId: 'rent' },
      ],
      [{ categoryId: 'housing', id: 'rent' }],
    )

    expect(result.leftoverVnd).toBe(400_000)
    expect(result.slices).toEqual([
      { amountVnd: 80_000, categoryId: null },
      { amountVnd: 20_000, categoryId: 'housing' },
    ])
  })

  it('drops zero slices', () => {
    const result = categoryIncomeSplit(50_000, [], [{ categoryId: 'housing', id: 'rent' }])

    expect(result.leftoverVnd).toBe(50_000)
    expect(result.overspentVnd).toBe(0)
    expect(result.slices).toEqual([])
  })
})
