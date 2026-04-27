import { describe, expect, it } from 'vitest'

import {
  asOfMonthForYearFilter,
  clampYearRangeAsc,
  formatMonthLabelShort,
  monthYearPickerYearConstraints,
  periodOverlapsCalendarYear,
  statsMonthKeys,
  yearFilterRange,
} from '@/lib/month'

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

describe('formatMonthLabelShort', () => {
  it('returns T{n} without year', () => {
    expect(formatMonthLabelShort('2026-04')).toBe('T4')
    expect(formatMonthLabelShort('2027-01')).toBe('T1')
  })
})

describe('periodOverlapsCalendarYear', () => {
  it('is true when the period spans the year', () => {
    expect(periodOverlapsCalendarYear('2025-06', '2026-03', 2025)).toBe(true)
    expect(periodOverlapsCalendarYear('2025-06', '2026-03', 2026)).toBe(true)
  })

  it('is false when the period is entirely before or after the year', () => {
    expect(periodOverlapsCalendarYear('2024-01', '2024-12', 2025)).toBe(false)
    expect(periodOverlapsCalendarYear('2026-01', null, 2025)).toBe(false)
  })

  it('treats open-ended periods as overlapping when they start on or before year end', () => {
    expect(periodOverlapsCalendarYear('2025-01', null, 2025)).toBe(true)
    expect(periodOverlapsCalendarYear('2025-01', null, 2026)).toBe(true)
  })
})

describe('asOfMonthForYearFilter', () => {
  it('uses current month when the filter year matches the calendar year (VN TZ)', () => {
    const now = new Date('2026-04-15T12:00:00Z')
    expect(asOfMonthForYearFilter(2026, now)).toBe('2026-04')
  })

  it('uses December for past years and January for future years', () => {
    const now = new Date('2026-04-15T12:00:00Z')
    expect(asOfMonthForYearFilter(2025, now)).toBe('2025-12')
    expect(asOfMonthForYearFilter(2027, now)).toBe('2027-01')
  })
})

describe('clampYearRangeAsc', () => {
  it('returns at most maxYears centered on centerYear', () => {
    const ys = [2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028]
    expect(clampYearRangeAsc(ys, { centerYear: 2026, maxYears: 5 })).toEqual([2024, 2025, 2026, 2027, 2028])
  })
})

describe('yearFilterRange', () => {
  it('returns five consecutive years from the current calendar year forward (VN TZ)', () => {
    const now = new Date('2026-06-01T12:00:00Z')
    const ys = yearFilterRange(now, 5)
    expect(ys).toEqual([2026, 2027, 2028, 2029, 2030])
    expect(ys[0]).toBe(2026)
    expect(ys[ys.length - 1]).toBe(2030)
  })

  it('respects a custom span', () => {
    const now = new Date('2026-01-10T12:00:00Z')
    expect(yearFilterRange(now, 3)).toEqual([2026, 2027, 2028])
  })
})

describe('monthYearPickerYearConstraints', () => {
  it('matches the page filter window when creating', () => {
    const now = new Date('2026-06-01T12:00:00Z')
    expect(monthYearPickerYearConstraints(null, now, 5)).toEqual({
      maxYear: 2030,
      maxYears: 5,
      minYear: 2026,
    })
  })

  it('expands bounds when editing an older period', () => {
    const now = new Date('2026-06-01T12:00:00Z')
    expect(monthYearPickerYearConstraints({ validFrom: '2024-01', validTo: '2025-06' }, now, 5)).toEqual({
      maxYear: 2030,
      maxYears: 7,
      minYear: 2024,
    })
  })
})
