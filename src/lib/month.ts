import type { MonthKey } from '@/lib/types'

import { formatInTimeZone } from 'date-fns-tz'

export type { MonthKey }

export const VN_TZ = 'Asia/Ho_Chi_Minh'

export function currentMonthKey(now = new Date()): string {
  return formatInTimeZone(now, VN_TZ, 'yyyy-MM')
}

export function currentCalendarYear(now = new Date()): number {
  return Number(formatInTimeZone(now, VN_TZ, 'yyyy'))
}

/** Keeps at most `maxYears` entries, centered on `centerYear` in a sorted ascending year list. */
export function clampYearRangeAsc(
  yearsAsc: number[],
  { centerYear, maxYears }: { centerYear: number; maxYears: number },
): number[] {
  if (yearsAsc.length <= maxYears) return yearsAsc

  const idx = Math.max(
    0,
    yearsAsc.findIndex((y) => y === centerYear),
  )
  const half = Math.floor(maxYears / 2)
  let start = Math.max(0, idx - half)
  let end = start + maxYears
  if (end > yearsAsc.length) {
    end = yearsAsc.length
    start = Math.max(0, end - maxYears)
  }
  return yearsAsc.slice(start, end)
}

/** Month used for “as of” calculations when viewing a specific calendar year in filters. */
export function asOfMonthForYearFilter(filterYear: number, now = new Date()): MonthKey {
  const cy = currentCalendarYear(now)
  if (filterYear === cy) return currentMonthKey(now)
  if (filterYear < cy) return `${filterYear}-12`
  return `${filterYear}-01`
}

/** First/last month keys for a calendar year (`yyyy-MM`, string-safe for Firestore + overlap checks). */
export function calendarYearStartEndKeys(year: number): { end: MonthKey; start: MonthKey } {
  return { end: `${year}-12`, start: `${year}-01` }
}

/** Whether a budget/income period overlaps the given calendar year (inclusive). */
export function periodOverlapsCalendarYear(validFrom: MonthKey, validTo: MonthKey | null, year: number): boolean {
  const { end: yearEnd, start: yearStart } = calendarYearStartEndKeys(year)
  if (validFrom > yearEnd) return false
  if (validTo !== null && validTo < yearStart) return false
  return true
}

/** Same forward window as page year filters (VN TZ). */
export const YEAR_FILTER_SPAN = 5

function yearFilterInclusiveBounds(now = new Date(), span = YEAR_FILTER_SPAN): { maxYear: number; minYear: number } {
  const cy = currentCalendarYear(now)
  const n = Math.max(1, span)
  return { maxYear: cy + n - 1, minYear: cy }
}

/** Consecutive years for page year filters: `span` years from the current calendar year forward (VN TZ). */
export function yearFilterRange(now = new Date(), span = YEAR_FILTER_SPAN): number[] {
  const { maxYear, minYear } = yearFilterInclusiveBounds(now, span)
  const out: number[] = []
  for (let y = minYear; y <= maxYear; y++) out.push(y)
  return out
}

/**
 * Year dropdown bounds for create/edit period dialogs: create uses the filter window; edit expands to include
 * existing `validFrom` / `validTo` years. `maxYears` widens the picker list when the span exceeds `YEAR_FILTER_SPAN`.
 */
export function monthYearPickerYearConstraints(
  editing: { validFrom: string; validTo: null | string } | null,
  now = new Date(),
  span = YEAR_FILTER_SPAN,
): { maxYear: number; maxYears: number; minYear: number } {
  const base = yearFilterInclusiveBounds(now, span)
  if (!editing) {
    return {
      maxYear: base.maxYear,
      maxYears: span,
      minYear: base.minYear,
    }
  }
  const yf = Number(editing.validFrom.slice(0, 4))
  const yt = editing.validTo ? Number(editing.validTo.slice(0, 4)) : yf
  const minYear = Math.min(base.minYear, yf, yt)
  const maxYear = Math.max(base.maxYear, yf, yt)
  return {
    maxYear,
    maxYears: Math.max(span, maxYear - minYear + 1),
    minYear,
  }
}

/** Stats grid: from current month through Dec, then all 12 months of next year. */
export function statsMonthKeys(now = new Date()): string[] {
  const y = Number(formatInTimeZone(now, VN_TZ, 'yyyy'))
  const m = Number(formatInTimeZone(now, VN_TZ, 'MM'))
  const keys: string[] = []
  for (let month = m; month <= 12; month++) {
    keys.push(`${y}-${String(month).padStart(2, '0')}`)
  }
  const nextYear = y + 1
  for (let month = 1; month <= 12; month++) {
    keys.push(`${nextYear}-${String(month).padStart(2, '0')}`)
  }
  return keys
}

export function isMonthInRange(month: string, validFrom: string, validTo: null | string): boolean {
  if (month < validFrom) return false
  if (validTo === null) return true
  return month <= validTo
}

/** Period ended before `asOfMonth` (`yyyy-MM` string compare). */
export function isPeriodClosedBefore(validTo: MonthKey | null, asOfMonth: MonthKey): boolean {
  if (validTo === null) return false
  return validTo < asOfMonth
}

export function formatMonthVi(month: MonthKey): string {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `${m}/${y}`
}

/** UI label `T{month}/{year}` (e.g. T4/2026). */
export function formatMonthLabel(month: MonthKey): string {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `T${Number(m)}/${y}`
}

/** Month-only label `T{n}` for use under a year group header. */
export function formatMonthLabelShort(month: MonthKey): string {
  const [, m] = month.split('-')
  if (!m) return month
  return `T${Number(m)}`
}
