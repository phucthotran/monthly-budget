import { formatInTimeZone } from 'date-fns-tz'

/** IANA timezone for month boundaries and "current month". */
export const VN_TZ = 'Asia/Ho_Chi_Minh'

/** Month key `yyyy-MM`, comparable lexicographically. */
export function currentMonthKey(now = new Date()): string {
  return formatInTimeZone(now, VN_TZ, 'yyyy-MM')
}

/**
 * Tháng hiển thị thống kê: từ tháng hiện tại đến hết năm dương lịch,
 * sau đó thêm trọn 12 tháng của năm kế tiếp (tháng 1–12).
 */
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

/** Hiển thị theo VN: MM/YYYY */
export function formatMonthVi(month: MonthKey): string {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `${m}/${y}`
}

/** Hiển thị theo UX hiện tại: T{tháng}/{năm} (ví dụ: T4/2026). */
export function formatMonthLabel(month: MonthKey): string {
  const [y, m] = month.split('-')
  if (!y || !m) return month
  return `T${Number(m)}/${y}`
}
