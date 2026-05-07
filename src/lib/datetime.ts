import { formatInTimeZone } from 'date-fns-tz'

import { VN_TZ } from './month'

export function formatDate(date: number): string {
  return formatInTimeZone(date, VN_TZ, 'dd/MM/yyyy')
}

export function formatDateShort(date: number): string {
  return formatInTimeZone(date, VN_TZ, 'dd/MM')
}

export function formatDateLong(date: number): string {
  return formatInTimeZone(date, VN_TZ, 'dd/MM/yyyy HH:mm')
}
