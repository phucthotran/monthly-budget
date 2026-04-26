import type { BudgetItem, IncomePeriod } from '@/lib/types'

import { describe, expect, it } from 'vitest'

import { buildActualByMonth, incomeForMonth, plannedBudgetForMonth } from '@/lib/budget/apply'

describe('incomeForMonth', () => {
  it('sums overlapping periods', () => {
    const periods: IncomePeriod[] = [
      {
        amountVnd: 10_000_000,
        createdAt: 0,
        id: '1',
        label: 'Lương',
        updatedAt: 0,
        validFrom: '2026-01',
        validTo: '2026-06',
      },
      {
        amountVnd: 12_000_000,
        createdAt: 0,
        id: '2',
        label: 'Lương mới',
        updatedAt: 0,
        validFrom: '2026-07',
        validTo: null,
      },
    ]
    expect(incomeForMonth('2026-03', periods)).toBe(10_000_000)
    expect(incomeForMonth('2026-07', periods)).toBe(12_000_000)
    expect(incomeForMonth('2026-01', periods)).toBe(10_000_000)
  })
})

describe('plannedBudgetForMonth', () => {
  it('filters by validity', () => {
    const items: BudgetItem[] = [
      {
        amountVnd: 5_000_000,
        categoryId: 'c',
        createdAt: 0,
        id: 'a',
        title: 'Thuê',
        updatedAt: 0,
        validFrom: '2026-01',
        validTo: '2026-03',
      },
    ]
    expect(plannedBudgetForMonth('2026-02', items)).toBe(5_000_000)
    expect(plannedBudgetForMonth('2026-04', items)).toBe(0)
  })
})

describe('buildActualByMonth', () => {
  it('aggregates by month', () => {
    const map = buildActualByMonth([
      { amountVnd: 100, spentMonth: '2026-04' },
      { amountVnd: 200, spentMonth: '2026-04' },
      { amountVnd: 50, spentMonth: '2026-05' },
    ])
    expect(map.get('2026-04')).toBe(300)
    expect(map.get('2026-05')).toBe(50)
  })
})
