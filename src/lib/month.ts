import { formatInTimeZone } from 'date-fns-tz'

export const VN_TZ = 'Asia/Ho_Chi_Minh'

export function currentMonthKey(now = new Date()): string {
  return formatInTimeZone(now, VN_TZ, 'yyyy-MM')
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

export type MonthKey = string

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
