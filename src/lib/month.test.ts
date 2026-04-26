import { describe, expect, it } from 'vitest'

import { statsMonthKeys } from '@/lib/month'

describe('statsMonthKeys', () => {
  it('covers from current month through next calendar year (12 months)', () => {
    const keys = statsMonthKeys(new Date('2026-04-15T12:00:00Z'))
    expect(keys[0]).toBe('2026-04')
    expect(keys).toContain('2026-12')
    expect(keys[keys.length - 1]).toBe('2027-12')
    expect(keys).toHaveLength(9 + 12)
  })

  it('starts January when current is January', () => {
    const keys = statsMonthKeys(new Date('2026-01-10T12:00:00Z'))
    expect(keys[0]).toBe('2026-01')
    expect(keys).toHaveLength(12 + 12)
  })
})
