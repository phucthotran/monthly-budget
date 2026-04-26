const vndFormatter = new Intl.NumberFormat('vi-VN', {
  currency: 'VND',
  maximumFractionDigits: 0,
  style: 'currency',
})

const vndNumberFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

export function formatVnd(amount: number): string {
  return vndFormatter.format(Math.round(amount))
}

/** Format number for inputs: 1.000.000 */
export function formatVndNumber(amount: number): string {
  return vndNumberFormatter.format(Math.round(amount))
}

/** Parse user input like "1.000.000" or "1000000" to integer VND. */
export function parseVndInput(raw: string): null | number {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (!trimmed) return null
  const normalized = trimmed.replace(/\./g, '').replace(/,/g, '')
  const n = Number(normalized)
  if (!Number.isFinite(n) || n < 0) return null
  return Math.round(n)
}
