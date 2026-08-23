import type { MonthSnapshot } from '@/lib/budget/aggregate'

export type IncomeSplit = {
  actualSpentVnd: number
  incomeVnd: number
  leftoverVnd: number
  overspentVnd: number
}

/** Totals income vs actual spend for one month or a full year of snapshots. */
export function incomeSplit(snaps: Pick<MonthSnapshot, 'actualSpentVnd' | 'incomeVnd'>[]): IncomeSplit {
  const incomeVnd = snaps.reduce((sum, s) => sum + s.incomeVnd, 0)
  const actualSpentVnd = snaps.reduce((sum, s) => sum + s.actualSpentVnd, 0)
  return {
    actualSpentVnd,
    incomeVnd,
    leftoverVnd: Math.max(0, incomeVnd - actualSpentVnd),
    overspentVnd: Math.max(0, actualSpentVnd - incomeVnd),
  }
}

/** Overspend as a percent of income. Spend with no income is 100%. */
export function overspentSharePercent(split: Pick<IncomeSplit, 'incomeVnd' | 'overspentVnd'>): number {
  if (split.overspentVnd <= 0) return 0
  if (split.incomeVnd <= 0) return 100
  return Math.round((split.overspentVnd / split.incomeVnd) * 100)
}
