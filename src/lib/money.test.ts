import { describe, expect, it } from 'vitest'

import { formatMoney, formatMoneyNumber, parseMoneyInput } from '@/lib/money'

describe('formatMoney', () => {
  it('formats VND in major units (dong)', () => {
    expect(formatMoney(1_000_000, 'VND')).toContain('1.000.000')
  })

  it('formats USD from cents', () => {
    expect(formatMoney(1050, 'USD')).toContain('10.50')
  })
})

describe('formatMoneyNumber', () => {
  it('formats VND digits with vi grouping', () => {
    expect(formatMoneyNumber(25000, 'VND')).toBe('25.000')
  })
})

describe('parseMoneyInput', () => {
  it('parses VND thousands dots as dong', () => {
    expect(parseMoneyInput('1.000.000', 'VND')).toBe(1_000_000)
  })

  it('parses USD decimals as cents', () => {
    expect(parseMoneyInput('10.50', 'USD')).toBe(1050)
  })
})
